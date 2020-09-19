const pronote = require('./pronote')(sendPush);
const firebase = require('firebase-admin');
const getServs = require('./pronoteServFinder');

require('./serve')((io) => {
  io.on('connection', (socket) => {
    console.log('User connected =>', socket.id.slice(-4));

    socket.on('getServsList', getServs);

    socket.on('fetch', async (user, callback) => {
      if (!user || !user.username || !user.password || !user.server) return;
      user.username = user.username.toUpperCase();

      const usr = (await $(user.username).get()).data();

      if (usr) {
        if (usr.password === user.password) {
          callback({ success: true });
          sendData(user.username);
        } else {
          callback({ error: 'Mauvais identifiant ou mot de passe' });
        }
      } else {
        console.log('Creating user', user);
        computeUser(user, (rs) => {
          if (!rs) {
            $(user.username).delete();
            callback({ error: 'Mauvais identifiant ou mot de passe' });
          } else {
            callback({ success: true });
            sendData(user.username);
          } 
        });
      }
    });

    socket.on('addFriend', async (user, friendName, cb) => {
      if (!user
        || !user.username
        || !user.password
        || !user.server
        || !checkPass(user.username, user.pass)
      ) return;

      user.username = user.username.toUpperCase();
      friendName = friendName.toUpperCase();

      if (friendName === user.username) {
        return cb({ error: 'Vous ne pouvez pas vous ajouter vous-même' });
      }

      if (!(await $(friendName).get()).exists) {
        return cb({ error: 'Cet utilisateur n\'existe pas' });
      }

      const friend = $(user.username).collection('friends').doc(friendName);

      if ((await friend.get()).exists) {
        return cb({ error: 'Vous etes déjà ami avec cet utilisateur' });
      }

      friend.set({
        active: true,
        notif: false,
      });

      sendData(user.username);
    });

    socket.on('removeFriend', async (user, friendName, cb) => {
      if (!user
        || !user.username
        || !user.password
        || !user.server
        || !checkPass(user.username, user.pass)
      ) return;

      user.username = user.username.toUpperCase();

      const friend = $(user.username).collection('friends').doc(friendName);
      if ((await friend.get()).exists) friend.delete();

      cb({ success: true });
      sendData(user.username);
    });

    async function sendData(username) {
      const user = $(username);

      socket.emit('data', {
        // tokens: (await user.collection('pushTokens').get()).docs.map((p) => ({ token: p.id, ...p.data() })),
        friends: await (await user.collection('friends').get()).docs.map((f) => f.id),
        ...(await user.get()).data().data,
      });
    }

    socket.on('addPushToken', async (user, token) => {
      if (!user
        || !user.username
        || !user.password
        || !user.server
        || !checkPass(user.username, user.pass)
      ) return;

      user.username = user.username.toUpperCase();
      addPushToken(user, token, socket.request.headers['user-agent']);
    });
  });
});

firebase.initializeApp({
  credential: firebase.credential.cert(require('./credentials.json')),
  databaseURL: 'https://iridium-blast.firebaseio.com',
});

const fcm = firebase.messaging();
const db = firebase.firestore().collection('pronote_users');
const $ = (u) => db.doc(u);

async function checkPass(username, password) {
  return (await $(username).get()).exists && (await $(username).get()).data().password === password;
}

// async function createUser(username, password, data = {}) {
//   if (await checkPass(username, password)) return;
//   console.log('Creating user', username, 'pass=', password);
//   const doc = $(username);
//   if (!(await doc.get()).exists) await doc.set({ username, password, data });
//   computeUser({ username, password, data }, (success) => {
//     if (!success) doc.delete();
//   });
// }

async function addPushToken({ username, password }, token, UA) {
  const doc = $(username).collection('pushTokens').doc(token);
  if (!checkPass(username, password)) return;
  if (!(await doc.get()).exists) await doc.set({});

  doc.update({
    active: true,
    lastAdd: new Date(),
    UA,
  });
}

async function sendPush(username, data) {
  const user = $(username);
  if (await (await user.get()).data().lastNotif === data.body) return;
  console.log('Send push');
  const pushTokens = await user.collection('pushTokens').get();
  pushTokens.forEach(({ id: token }) => {
    console.log(`Send to : ${token}`);
    fcm.send({
      token,
      data,
    }).then(() => {
      user.collection('pushTokens').doc(token).update({ lastUse: new Date() });
      user.update({ lastNotif: data.body });
    }).catch(() => {
      user.collection('pushTokens').doc(token).delete();
    });
  });
}

function computeUser(user, cb = (rs = false) => null) {
  if (!user.password) return cb(false);
  if (!user.server || user.server.length < 10) return cb(false);
  pronote.fetch(user, async (data) => {
    if (!(await $(user.username).get()).exists) $(user.username).set({});
    $(user.username).update({ ...user, data });
    cb(data);
  }).catch((err) => {
    if (err.code === 6 || err.code === 3) {
      console.error('Mauvais identifiants');
      $(user.username).delete();
      cb(false);
    } else {
      console.error(err);
    }
  })
}

async function computeAll() {
  const users = await db.get();
  console.log(`Computing ${users.size} user${users.size > 1 ? 's' : ''}`, new Date().toLocaleTimeString());
  users.forEach((user) => {
    computeUser(user.data());
  });
};

computeAll();
setInterval(computeAll, 60000);

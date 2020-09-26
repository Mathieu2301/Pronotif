const pronote = require('./pronote')(sendPush);
const firebase = require('firebase-admin');
const getServs = require('./pronoteServFinder');

require('./serve')((io) => {
  io.on('connection', (socket) => {
    console.log('User connected =>', socket.id.slice(-4));

    socket.on('getServsList', getServs);

    socket.on('fetch', async (user, callback) => {
      user = await logUser(user, true);
      if (!user) return callback({ error: 'Veuillez sélectionner un établissement' });;

      const usr = (await $(user).get()).data();

      if (usr) {
        if (usr.password === user.password) {
          callback({ success: true });
          sendData(user);
        } else {
          callback({ error: 'Mauvais identifiant ou mot de passe' });
        }
      } else {
        console.log('Creating user', user);
        computeUser(user, (rs) => {
          if (!rs) {
            $(user).delete();
            callback({ error: 'Mauvais identifiant ou mot de passe' });
          } else {
            callback({ success: true });
            sendData(user);
          } 
        });
      }
    });

    socket.on('addFriend', async (user, friend, cb) => {
      user = await logUser(user);
      if (!user) return;

      friend = await logUser({
        username: friend,
        server: user.server,
      }, true);

      if (friend.username === user.username) {
        return cb({ error: 'Vous ne pouvez pas vous ajouter vous-même' });
      }

      if (!(await $(friend).get()).exists) {
        return cb({ error: 'Cet utilisateur n\'existe pas' });
      }

      const frnd = $(user).collection('friends').doc(friend.key);

      if ((await frnd.get()).exists) {
        return cb({ error: 'Vous êtes déjà ami avec cet utilisateur' });
      }

      await frnd.set({
        active: true,
        notif: false,
      });

      sendData(user);
    });

    socket.on('removeFriend', async (user, friendName, cb) => {
      user = await logUser(user);
      if (!user) return;

      const friend = $(user).collection('friends').doc(friendName);
      if ((await friend.get()).exists) await friend.delete();

      cb({ success: true });
      sendData(user);
    });

    async function sendData(user) {
      const usr = $(user);
      const friends = (await usr.collection('friends').get()).docs.map((f) => f.id );

      for (const key in friends) {
        if (friends[key]) {
          friends[key] = (await $({ key: friends[key] }).get());
          friends[key] = {
            ...friends[key].data().data,
            key: friends[key].id,
          };

          friends[key] = {
            key: friends[key].key,
            name: friends[key].name,
            class: friends[key].class,
            timetable: friends[key].timetable,
          };
        }
      }

      socket.emit('data', {
        // tokens: (await usr.collection('pushTokens').get()).docs.map((p) => ({ token: p.id, ...p.data() })),
        friends,
        ...(await usr.get()).data().data,
      });
    }

    socket.on('addPushToken', async (user, token) => {
      user = await logUser(user);
      if (user) addPushToken(user, token, socket.request.headers['user-agent']);
    });
  });
});

firebase.initializeApp({
  credential: firebase.credential.cert(require('./credentials.json')),
  databaseURL: 'https://iridium-blast.firebaseio.com',
});

const fcm = firebase.messaging();
const db = firebase.firestore().collection('pronote_users');
const $ = (user) => db.doc(user.key);

async function logUser(user, bypass = false) {
  if (user
    && user.username
    && (user.password || bypass)
    && user.server && user.server.length > 10
  ) {
    user.username = user.username.toUpperCase();
    user.key = `${user.server.replace(/(.*\/\/)|\.(.*)(\.*)/g, '') || 'DEFAULT' }-${user.username}`;

    if (!bypass) {
      const data = await $(user).get();
      if ((data.exists && data.data().password === user.password)) {
        return user;
      } else return false;
    } else return user;
  } return false;
}

async function addPushToken(user, token, UA) {
  const doc = $(user).collection('pushTokens').doc(token);
  if (!(await doc.get()).exists) await doc.set({});

  doc.update({
    active: true,
    lastAdd: new Date(),
    UA,
  });
}

async function sendPush(user, data) {
  const usr = $(user);
  console.log('Send push');
  if (await (await usr.get()).data().lastNotif === data.body) return;
  const pushTokens = await usr.collection('pushTokens').get();
  pushTokens.forEach(({ id: token }) => {
    console.log(`Send to : ${token}`);
    fcm.send({
      token,
      data,
    }).then(() => {
      usr.collection('pushTokens').doc(token).update({ lastUse: new Date() });
      usr.update({ lastNotif: data.body });
    }).catch(() => {
      usr.collection('pushTokens').doc(token).delete();
    });
  });
}

async function computeUser(user, cb = (rs = false) => null) {
  user = await logUser(user, true);
  if (!user) return cb(false);

  pronote.fetch(user, async (data) => {
    if (!(await $(user).get()).exists) $(user).set({});
    $(user).update({ ...user, data });
    cb(data);
  }).catch((err) => {
    if (err.code === 6 || err.code === 3) {
      console.error('Mauvais identifiants');
      $(user).delete();
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
setInterval(computeAll, 600000);

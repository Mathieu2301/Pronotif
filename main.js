const pronote = require('./pronote')(sendPush);
const firebase = require('firebase-admin');
const getServs = require('./pronoteServFinder');

const credentials = process.env.credentials ? JSON.parse(process.env.credentials) : require('./credentials.json');

const cipher = require('./cipher')(
  credentials.pwd_private_key,
  credentials.pwd_salt,
  'aes-192-cbc',
);

require('./serve')((io) => {
  io.on('connection', (socket) => {
    console.log('User connected =>', socket.id.slice(-4));

    socket.on('getServsList', getServs);

    socket.on('fetch', async (user, callback) => {
      user = await logUser(user, true);
      if (!user) return callback({ error: 'Veuillez sélectionner un établissement' });;

      const usr = (await $(user).get()).data();

      if (usr && usr.password) {
        if (await cipher.decrypt(usr.password) === user.password) {
          callback({ success: true });
          sendData(user);
        } else {
          callback({ error: 'Mauvais identifiant ou mot de passe' });
        }
      } else {
        console.log('Creating user', user);
        computeUser(user, (rs) => {
          if (!rs) {
            if (process.env.production) $(user).delete();
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

      cb({ success: true });
      sendData(user);
    });

    socket.on('removeFriend', async (user, friendName, cb) => {
      user = await logUser(user);
      if (!user || typeof friendName !== 'string') return;

      const friend = $(user).collection('friends').doc(friendName);
      if ((await friend.get()).exists) await friend.delete();

      cb({ success: true });
      sendData(user);
    });

    async function sendData(user) {
      const usr = $(user);
      const friends = (await usr.collection('friends').get()).docs.map((f) => f.id);

      for (const key in friends) {
        if (friends[key]) {
          const friend = (await $({ key: friends[key] }).get());

          if (!friend.exists || !friend.data().data) {
            friends[key] = {
              key: friends[key],
              name: friends[key],
              class: '?',
              timetable: [],
            };
            continue;
          }

          friends[key] = {
            ...friend.data().data,
            key: friend.id,
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
  credential: firebase.credential.cert(credentials),
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
    user.username = user.username.toUpperCase().replace(/ /g, '');
    user.key = `${user.server.replace(/(.*\/\/)|\.(.*)(\.*)/g, '').toUpperCase() || 'DEFAULT' }-${user.username}`;

    if (!bypass) {
      const data = await $(user).get();
      if ((data.exists && await cipher.decrypt(data.data().password) === user.password)) {
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
  console.log('Send push to', user.key);
  if (!process.env.production) return console.log('Canceled (not in production)...', data.title);
  const usr = $(user);
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

  pronote.fetch({ ...user }, async (data) => {
    if (!(await $(user).get()).exists) $(user).set({});
    $(user).update({ ...user, data, password: await cipher.encrypt(user.password) });
    cb(data);
  }).catch((err) => {
    if (err.code === 6 || err.code === 3) {
      console.error('Mauvais identifiants ou anti-spam');
      if (process.env.production) $(user).delete();
      cb(false);
    } else {
      console.error(err);
    }
  })
}

async function computeAll() {
  const users = await db.get();
  console.log(`Computing ${users.size} user${users.size > 1 ? 's' : ''}`, new Date().toLocaleTimeString());
  users.forEach(async (user) => {
    const usr = user.data();
    if (!usr || !usr.password || !usr.username) return;
    usr.password = await cipher.decrypt(usr.password);
    computeUser(usr);
  });
};

computeAll();
setInterval(computeAll, 600000);

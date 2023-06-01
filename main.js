const firebase = require('firebase-admin');
const config = require('./config');
const utils = require('./utils');

const cipher = require('./cipher')(
  config.PWD_PRIVATE_KEY,
  config.PWD_SALT,
  'aes-192-cbc',
);

firebase.initializeApp({
  credential: firebase.credential.cert(config.FIREBASE_CREDENTIALS),
  databaseURL: config.FIREBASE_DB,
});

const fcm = firebase.messaging();
const fstore = firebase.firestore();
fstore.settings({ ignoreUndefinedProperties: true });

const db = fstore.collection(config.PRODUCTION
  ? 'pronote_users'
  : 'pronote_users_test');

const $ = (user) => db.doc(user.key);

const pronote = require('./pronote')(async (user, data) => {
  console.log('Send push to', user.key);
  if (!config.PRODUCTION) return console.log('Canceled (not in production)...', data.title);
  if (!config.NOTIFICATIONS) return console.log('Canceled (notifications disabled)...', data.title);

  const usr = $(user);
  if (await (await usr.get()).data().lastNotif === data.body) return false;

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

  return true;
});

async function logUser(user, bypass = false) {
  if (user
    && user.username
    && (user.password || bypass)
    && user.server && (user.server.length > 7 || user.server.toUpperCase() === 'DEMO')
  ) {
    const usr = user;
    usr.username = usr.username.toUpperCase().replace(/ /g, '');
    usr.key = `${usr.server.replace(/(.*\/\/)|\.(.*)(\.*)/g, '').toUpperCase() || 'DEFAULT'}@${usr.username}`;

    if (bypass) return usr;

    const data = await $(usr).get();
    if (data.exists
      && await cipher.decrypt(data.data().password) === usr.password) return usr;
  }

  return false;
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

async function computeUser(userCred, cb = (rs = false) => rs) {
  const usr = await logUser(userCred, true);
  if (!usr) return cb(false);

  pronote.fetch({ ...usr }, async (data) => {
    if (!(await $(usr).get()).exists) $(usr).set({});
    $(usr).update({ ...usr, data, password: await cipher.encrypt(usr.password) });
    cb(data);
  }).catch((err) => {
    if (err.code === 6 || err.code === 3) {
      console.error('Mauvais identifiants ou anti-spam');
      if (config.PRODUCTION) $(usr).delete();
      cb(false);
    } else {
      console.error(`${usr.key} => Can't compute user: ${err.message}`);
    }
  });

  return true;
}

async function computeAll() {
  const users = await db.get();
  console.log(`Computing ${users.size} user${users.size > 1 ? 's' : ''}`, utils.nowDate());
  users.forEach(async (user) => {
    const usr = user.data();
    if (!usr || !usr.password || !usr.username) return;
    usr.password = await cipher.decrypt(usr.password);
    computeUser(usr);
  });
}

computeAll();
setInterval(computeAll, 600000);

const getServs = require('./pronoteServFinder');
const getFriendQR = require('./getFriendQR');

require('./serve')((io) => {
  io.on('connection', (socket) => {
    console.log('User connected =>', socket.id.slice(-4));

    socket.on('getServsList', getServs);

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
          } else {
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
      }

      const usrData = (await usr.get()).data();

      socket.emit('data', {
        friends,
        options: usrData.options,
        key: usrData.key,
        ...usrData.data,
      });
    }

    async function sendQRCode(user) {
      getFriendQR(Buffer.from(user.key, 'utf8').toString('base64').replace(/=/g, ''), (rs) => {
        socket.emit('friendQRCode', rs);
      });
    }

    socket.on('fetch', async (userCred, callback) => {
      const user = await logUser(userCred, true);
      if (!user) return callback({ error: 'Veuillez sélectionner un établissement' });

      const usr = (await $(user).get()).data();

      // Si l'utilisateur existe
      if (usr && usr.password) {
        // On vérifie si le pass est bon
        if (await cipher.decrypt(usr.password) === user.password) {
          callback({ success: true });
          sendData(user);
          sendQRCode(user);
          return true;
        }

        // Si le pass ne correspond pas
        callback({ error: 'Mauvais identifiant ou mot de passe' });
        return false;
      }

      // Si l'utilisateur n'existe pas, on le crée
      console.log('Creating user', user);
      // On commence par vérifier si le pass donné est bien celui du compte pronote
      computeUser(user, (rs) => {
        // S'il est bon, on renvoie les données
        if (rs) {
          callback({ success: true });
          sendData(user);
          return true;
        }

        // Sinon, on renvoie une erreur et on supprime (si besoin) l'utilisateur
        if (config.PRODUCTION) $(user).delete();
        callback({ error: 'Mauvais identifiant ou mot de passe' });
        return false;
      });

      return false;
    });

    socket.on('addFriend', async (user, fName, cb) => {
      const usr = await logUser(user); // Authentification
      if (!usr) return;

      // Par défaut, on prend l'input comme username et l'établissement du user
      const friendCred = {
        username: fName,
        server: usr.server,
      };

      // Si l'input contient un '@', on extrait l'établissement et le username
      if (fName.includes('@')) {
        [friendCred.server, friendCred.username] = fName.split('@');
      }

      const friend = await logUser(friendCred, true);

      // Si l'utilisateur tente de s'ajouter lui-même
      if (
        friend.username === usr.username
        && friend.server === usr.server
      ) {
        cb({ error: 'Vous ne pouvez pas vous ajouter vous-même' });
        return;
      }

      const friendUser = await $(friend).get();

      if (!friendUser.exists) {
        cb({ error: 'Cet utilisateur n\'existe pas' });
        return;
      }

      // Ligne dans la liste d'amis
      const friendRow = $(usr).collection('friends').doc(friend.key);

      // Si l'ami est déjà dans la liste, on affiche une erreur
      if ((await friendRow.get()).exists) {
        cb({ error: 'Vous êtes déjà ami avec cet utilisateur' });
        return;
      }

      // Sinon, on l'ajoute à la liste
      await friendRow.set({
        active: true,
        notif: false,
      });

      // On callback l'action pour afficher le message de succès
      cb({
        success: true,
        fname: friendUser.data().data.name,
      });

      // On envoie les nouvelles données
      sendData(usr);
    });

    socket.on('removeFriend', async (userCred, friendName, cb) => {
      const user = await logUser(userCred);
      if (!user || typeof friendName !== 'string') return;

      const friend = $(user).collection('friends').doc(friendName);
      if ((await friend.get()).exists) await friend.delete();

      cb({ success: true });
      sendData(user);
    });

    socket.on('setOptions', async (userCred, options) => {
      const user = await logUser(userCred);
      if (!user) return;

      (await $(user).update({
        options: {
          disable_global: !options.notifs,
          disable_homeworks: !options.notifs_homeworks,
          disable_marks: !options.notifs_marks,
          disable_reports: !options.notifs_reports,
        },
      }));
    });

    socket.on('addPushToken', async (userCred, token) => {
      const user = await logUser(userCred);
      if (!user || user.key === 'DEMO-DEMONSTRATION') return;
      addPushToken(user, token, socket.request.headers['user-agent']);
    });
  });
});

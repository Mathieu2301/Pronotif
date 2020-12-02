const pronote = require('pronote-api');
const getMarks = require('./getMarks');
const CORR = parseInt(process.env.CORR || 0) * 1000;

const addZeros = (nbr) => parseInt(nbr) < 10 ? `0${nbr}` : `${nbr}`;
const getCompleteDay = (date = new Date, sep = '/') => `${
  addZeros(date.getDate())
}${sep}${
  addZeros(date.getMonth())
}`;

const dateCorrecter = (e = []) => (item) => {
  const rs = item;
  e.forEach((k) => {
    if (rs[k] instanceof Date) rs[k] = new Date(rs[k].getTime() - CORR);
  });
  return rs;
};

module.exports = (sendPush) => ({
  async fetch(user, callback = (data = {}) => null) {
    if (!user.server || !user.username || !user.password) return;

    const serverID = user.server.replace(/(.*\/\/)|\.(.*)(\.*)/g, '').toLowerCase();

    const url = `https://${serverID}.index-education.net/pronote/`;

    const session = await pronote.login(url, user.username, user.password, user.cas || 'none');

    const now = Date.now();

    const data = {
      name: session.user.name,
      class: session.user.studentClass.name,
      establishment: session.user.establishment.name,
      homeworks: await session.homeworks(
        new Date(new Date(now).setHours(0, 0, 0, 0) - 86400000 * 2),
        new Date(new Date(now).setHours(0, 0, 0, 0) + 604800000 * 2),
      ),
      timetable: await session.timetable(
        new Date(new Date(now).setHours(0, 0, 0, 0)),
        new Date(new Date(now).setHours(0, 0, 0, 0) + 86400000 * 2),
      ),
      marks: (await getMarks(session)).marks.reverse(),
      menus: (await session.menu(
        new Date(new Date(now).setHours(0, 0, 0, 0)),
        new Date(new Date(now).setHours(0, 0, 0, 0) + 86400000 * 2),
      )),
      reports: await session.absences(),
    };

    data.timetable = data.timetable.map(dateCorrecter(['from', 'to'])).map((l) => ({
      ...l,
      status: l.status || 'OK',
      subject: l.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
      room: l.room ? l.room.split(/-|\.| /g)[0] : null,
    })).filter((l) => l.isCancelled === false && l.isAway === false);

    data.homeworks = data.homeworks.map(dateCorrecter(['givenAt', 'for'])).map((hw) => ({
      ...hw,
      UID: `${Math.round(hw.givenAt.getTime() / 1000)}_${hw.subject}`,
      subject: hw.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
    }));

    data.marks = data.marks.map(dateCorrecter(['date'])).map((m) => ({
      ...m,
      UID: getMarkUID(m),
    }));

    const hours = await session.timetable(
      new Date(new Date().setHours(0, 0, 0, 0)),
      new Date(new Date().setHours(0, 0, 0, 0) + 604800000),
    );

    data.daysHours = {};
    hours.filter((h) => !h.isAway && !h.isCancelled).forEach((l) => {
      if (!data.daysHours[`${l.from.getDay()}`]) data.daysHours[`${l.from.getDay()}`] = {};
      data.daysHours[`${l.from.getDay()}`][`${l.from.getTime() - CORR}`] = {
        subject: l.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
        teacher: l.teacher || null,
        room: l.room || null,
        to: l.to.getTime() - CORR,
      };
    });

    if (data.menus && data.menus.map) {
      data.menus = data.menus.map((d) => ({
        date: d.date,
        meals: d.meals.flat().map((m) => m[0].name),
      }));
    } else data.menus = [];

    if (data.reports && data.reports.delays && data.reports.absences) {
      data.reports = {
        delays: data.reports.delays.map(dateCorrecter(['date'])).map((d) => ({
          ...d,
          UID: Math.round((d.date.getTime()) / 1000),
        })),
        absences: data.reports.absences.map(dateCorrecter(['from', 'to'])).map((a) => ({
          ...a,
          UID: Math.round((a.from.getTime()) / 1000),
        })),
      }
    } else data.reports = { delays: [], absences: [] };

    if (serverID !== 'demo'
      && user.data
      && user.data.homeworks
      && user.data.homeworks.find
      && isEnabled('reports', user.settings)
    ) {
      // Traitement homeworks

      data.homeworks.forEach((work) => {
        const oldWork = user.data.homeworks.find((w) => w.UID === work.UID);
        if (!oldWork) sendPush(user, {
          title: `Travail ${work.subject}`,
          body: work.description,
          tag: `HW_${work.UID}`,
        });
      });
    }

    if (serverID !== 'demo'
      && user.data
      && user.data.marks
      && user.data.marks.find
      && isEnabled('marks', user.settings)
    ) {
      // Traitement marks

      data.marks.forEach((mark) => {
        const oldMark = user.data.marks.find((m) => m.UID == mark.UID);
        if (!oldMark) sendPush(user, {
          title: `Note ${mark.subject.name} du ${getCompleteDay(mark.date._seconds)} (Coef: ${mark.coefficient})`,
          body: `${mark.title}: ${mark.value}/${mark.scale} [Min: ${mark.min} - Max: ${mark.max}]`,
          tag: `MRK_${getMarkUID(mark, true)}`,
        });
      });
    }

    if (serverID !== 'demo'
      && user.data
      && user.data.reports
      && user.data.reports.delays
      && user.data.reports.absences
      && isEnabled('reports', user.settings)
    ) {
      // Traitement reports

      data.reports.absences.forEach((abs) => {
        const oldAbs = user.data.reports.absences.find((a) => a.UID === abs.UID);

        if (!oldAbs) sendPush(user, {
          title: `Nouvelle absence de ${abs.hours} heure${abs.hours > 1 ? 's' : ''}`,
          body: `Raison: ${abs.reason || 'Aucune'}`,
          tag: `NABS_${abs.UID}`,
        });
        else if (!oldAbs.solved && abs.solved) sendPush(user, {
          title: `Absence du ${getCompleteDay(abs.from)} réglée`,
          body: `Raison: ${abs.reason || 'Aucune'}`,
          tag: `RABS_${abs.UID}`,
        });
      });

      data.reports.delays.forEach((delay) => {
        const oldDelay = user.data.reports.delays.find((d) => d.UID === delay.UID);

        if (!oldDelay) sendPush(user, {
          title: `Nouveau retard de ${delay.minutesMissed} minute${delay.minutesMissed > 1 ? 's' : ''}`,
          body: `Raison: ${delay.reason || 'Aucune'}`,
          tag: `NDLAY_${delay.UID}`,
        });
        else if (!oldDelay.solved && delay.solved) sendPush(user, {
          title: `Retard du ${getCompleteDay(delay.date)} réglé`,
          body: `Raison: ${delay.reason || 'Aucune'}`,
          tag: `RDLAY_${delay.UID}`,
        });
      });
    }

    console.log(serverID, user.username);

    callback(data);
  },
});

function isEnabled(type, settings) {
  return (!settings
    || !settings.disable_global
    || !settings[`disable_${type}`]
  );
}

function getMarkUID(mark, global = false) {
  let UID = (mark.date && mark.date.getTime) ? Math.round(mark.date.getTime() / 1000) : mark.date._seconds;

  UID += `?${mark.subject.color || mark.subject.title}:${mark.title}`;
  if (!global) UID += `@${mark.coefficient}x${mark.value}:${mark.scale}`;

  return UID.toUpperCase();
}

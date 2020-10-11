const pronote = require('pronote-api');
const getMarks = require('./getMarks');
const CORR = parseInt(process.env.CORR || 0) * 1000;

const addZeros = (nbr) => parseInt(nbr) < 10 ? `0${nbr}` : `${nbr}`;
const getCompleteDay = (date = new Date, sep = '/') => `${
  addZeros(date.getDate())
}${sep}${
  addZeros(date.getMonth())
}`;

module.exports = (sendPush) => ({
  async fetch(user, callback = (data = {}) => null, log = false) {
    if (!user.server || !user.username || !user.password) return;

    const session = await pronote.login(user.server, user.username, user.password);

    if (log) console.log('Session: OK');

    const data = {
      name: session.user.name,
      class: session.user.studentClass.name,
      homeworks: await session.homeworks(new Date(), new Date(Date.now() + 604800000 * 2)),
      timetable: await session.timetable(new Date(new Date().setHours(0, 0, 0, 0))),
      marks: (await getMarks(session)).marks.reverse(),
      menu: (await session.menu(new Date(Date.now() - 86400000)))[0],
      reports: await session.absences(),
      // evaluations: await session.evaluations(),
    };

    const dateCorrecter = (e = []) => (item) => {
      const rs = item;
      e.forEach((k) => {
        if (rs[k] instanceof Date) rs[k] = new Date(rs[k].getTime() - CORR);
      });
      return rs;
    };

    if (log) console.log('Other data: OK');

    data.timetable = data.timetable.map(dateCorrecter(['from', 'to'])).map((l) => ({
      ...l,
      subject: l.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
    })).filter((l) => l.isCancelled === false);

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

    if (data.menu && data.menu.meals && data.menu.meals.map) {
      data.menu = data.menu.meals.map((m) => m.map((m2) => m2[0].name))[0];
    } else data.menu = [];

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

    if (user.data && user.data.homeworks && user.data.homeworks.find) {
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

    if (user.data && user.data.marks && user.data.marks.find) {
      // Traitement marks

      data.marks.forEach((mark) => {
        const oldMark = user.data.marks.find((m) => m.UID == mark.UID);
        if (!oldMark) sendPush(user, {
          title: `Note ${mark.subject.name} (Coef: ${mark.coefficient})`,
          body: `${mark.title}: ${mark.value}/${mark.scale} [Min: ${mark.min} - Max: ${mark.max}]`,
          tag: `MRK_${getMarkUID(mark, true)}`,
        });
      });
    }

    if (user.data
      && user.data.reports
      && user.data.reports.delays
      && user.data.reports.absences
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

    if (log) console.log('Action: DONE');

    console.log(user.server, user.username);

    callback(data);
  },
});

function getMarkUID(mark, global = false) {
  let UID = (mark.date && mark.date.getTime) ? Math.round(mark.date.getTime() / 1000) : mark.date._seconds;

  UID = UID +
  `?${mark.subject.color || mark.subject.title
  }:${mark.title}`;

  if (!global) UID = UID +
  `@${mark.coefficient
  }x${mark.value}:${mark.scale
  }-[${mark.min || 0}-${mark.average || 0}-${mark.max || 0}]`;

  return UID.toUpperCase();
}

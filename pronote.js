const pronote = require('./pronote-api');
const getSubjects = require('./getSubjects');

const { CORR, addZeros, dateCorr } = global;

const getCompleteDay = (date = 0, sep = '/') => `${
  addZeros(new Date(date).getDate())
}${sep}${
  addZeros(new Date(date).getMonth() + 1)
}`;

function getMarkUID(mark, global = false) {
  let UID = `${Math.round(mark.date / 1000)}?${mark.subject.color || mark.subject.title}:${mark.title}`;
  if (!global) UID += `@${mark.coefficient}x${mark.value}:${mark.scale}`;

  return UID.toUpperCase();
}

function isEnabled(type, settings) {
  return (!settings
    || !settings.disable_global
    || !settings[`disable_${type}`]
  );
}

module.exports = (sendPush) => ({
  async fetch(user, callback = (data = {}) => data) {
    if (!user.server || !user.username || !user.password) return;

    const serverID = user.server.replace(/(.*\/\/)|\.(.*)(\.*)/g, '').toLowerCase();

    const url = `https://${serverID}.index-education.net/pronote/`;

    const session = await pronote.login(url, user.username, user.password, user.cas || 'none');

    const now = Date.now();

    const subjects = (await getSubjects(session));
    const periods = [{
      name: 'ALL',
      all: true,
      ...subjects.averages,
      averages: subjects.subjects,
    }];

    for (const m of subjects.marks) {
      if (!periods.find((v) => v.name === m.period)) {
        const avrg = (await session.marks(m.period));

        periods.push({
          name: m.period,
          value: avrg.averages.student || -1,
          class: avrg.averages.studentClass || -1,
          averages: avrg.subjects.map((s) => ({
            name: s.name,
            color: s.color,
            value: Math.round(s.averages.student * 100) / 100,
            class: Math.round(s.averages.studentClass * 100) / 100,
            min: s.averages.min,
            max: s.averages.max,
          })),
        });
      }
    }

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
      marks: subjects.marks.reverse(),
      periods,
      menus: (await session.menu(
        new Date(new Date(now).setHours(0, 0, 0, 0)),
        new Date(new Date(now).setHours(0, 0, 0, 0) + 86400000 * 2),
      )),
      reports: await session.absences(),
    };

    data.timetable = data.timetable.map(dateCorr('from', 'to')).map((l) => ({
      ...l,
      status: l.status || 'OK',
      subject: (!l.subject) ? null : l.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
      room: (!l.room) ? null : l.room.split(/-|\.| /g)[0],
    })).filter((l) => l.isCancelled === false && l.isAway === false);

    data.homeworks = data.homeworks.map(dateCorr('givenAt', 'for')).map((hw) => ({
      ...hw,
      UID: `${Math.round(hw.givenAt / 1000)}_${hw.subject}`,
      subject: hw.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
    }));

    data.marks = data.marks.map(dateCorr('date')).map((m) => ({
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
        subject: (!l.subject) ? null : l.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
        teacher: l.teacher || null,
        room: l.room || null,
        to: l.to.getTime() - CORR,
      };
    });

    if (data.menus && data.menus.map) {
      data.menus = data.menus.map(dateCorr('date')).map((d) => ({
        date: d.date,
        meals: d.meals.flat().map((m) => m[0].name),
      }));
    } else data.menus = [];

    if (data.reports && data.reports.delays && data.reports.absences) {
      data.reports = {
        delays: data.reports.delays.map(dateCorr('date')).map((d) => ({
          ...d,
          UID: Math.round(d.date / 1000),
        })),
        absences: data.reports.absences.map(dateCorr('from', 'to')).map((a) => ({
          ...a,
          UID: Math.round(a.from / 1000),
        })),
      };
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
        if (!oldWork) {
          sendPush(user, {
            title: `Travail ${work.subject}`,
            body: work.description,
            tag: `HW_${work.UID}`,
          });
        }
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
        const oldMark = user.data.marks.find((m) => m.UID === mark.UID);
        if (!oldMark) {
          sendPush(user, {
            title: `Note ${mark.subject.name} du ${getCompleteDay(mark.date)} (Coef: ${mark.coefficient})`,
            body: `${mark.title}: ${mark.value}/${mark.scale} [Min: ${mark.min} - Max: ${mark.max}]`,
            tag: `MRK_${getMarkUID(mark, true)}`,
          });
        }
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

        if (!oldAbs) {
          sendPush(user, {
            title: `Nouvelle absence de ${abs.hours} heure${abs.hours > 1 ? 's' : ''}`,
            body: `Raison: ${abs.reason || 'Aucune'}`,
            tag: `NABS_${abs.UID}`,
          });
        } else if (!oldAbs.solved && abs.solved) {
          sendPush(user, {
            title: `Absence du ${getCompleteDay(abs.from)} réglée`,
            body: `Raison: ${abs.reason || 'Aucune'}`,
            tag: `RABS_${abs.UID}`,
          });
        }
      });

      data.reports.delays.forEach((delay) => {
        const oldDelay = user.data.reports.delays.find((d) => d.UID === delay.UID);

        if (!oldDelay) {
          sendPush(user, {
            title: `Nouveau retard de ${delay.minutesMissed} minute${delay.minutesMissed > 1 ? 's' : ''}`,
            body: `Raison: ${delay.reason || 'Aucune'}`,
            tag: `NDLAY_${delay.UID}`,
          });
        } else if (!oldDelay.solved && delay.solved) {
          sendPush(user, {
            title: `Retard du ${getCompleteDay(delay.date)} réglé`,
            body: `Raison: ${delay.reason || 'Aucune'}`,
            tag: `RDLAY_${delay.UID}`,
          });
        }
      });
    }

    console.log(serverID, user.username);

    callback(data);
  },
});

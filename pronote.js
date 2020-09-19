const pronote = require('pronote-api');
const getMarks = require('./getMarks');

module.exports = (sendPush) => ({
  async fetch(user, callback = (data = {}) => null, log = false) {
    const session = await pronote.login(user.server, user.username, user.password);

    if (log) console.log('Session: OK');

    const data = {
      name: session.user.name,
      class: session.user.studentClass.name,
      homeworks: await session.homeworks(new Date(), new Date(Date.now() + 604800000)),
      timetable: await session.timetable(new Date(new Date().setHours(0, 0, 0, 0))),
      marks: (await getMarks(session)).marks,
      // absences: await session.absences(),
      // evaluations: await session.evaluations(),
    };

    if (log) console.log('Other data: OK');

    data.timetable = data.timetable.map((l) => ({
      ...l,
      subject: l.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
    }));

    data.homeworks = data.homeworks.map((h) => ({
      ...h,
      subject: h.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
    }));

    const hours = await session.timetable(
      new Date(new Date().setHours(0, 0, 0, 0)),
      new Date(new Date().setHours(0, 0, 0, 0) + 604800000),
    );

    data.daysHours = {};
    hours.filter((h) => !h.isAway && !h.isCancelled).forEach((l) => {
      if (!data.daysHours[`${l.from.getDay()}`]) data.daysHours[`${l.from.getDay()}`] = {};
      data.daysHours[`${l.from.getDay()}`][`${l.from.getTime()}`] = {
        subject: l.subject.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join('-'),
        teacher: l.teacher || null,
        room: l.room || null,
        to: l.to.getTime(),
      };
    });

    // const now = new Date('2020-09-09 14:09:00').getTime();
    // const now = Date.now();

    // Traitement timetable

    // data.timetable.forEach((lesson) => {
    //   if (now > lesson.to.getTime()) return; // Dépassé
    //   if (lesson.isCancelled || lesson.isAway) return; // Dépassé

    //   let notif = false;

    //   if (lesson.from.getTime() < now) notif = { title: 'Cours actuel', body: `(${lesson.room}) ${lesson.subject} avec ${lesson.teacher}` };

    //   if (
    //     now < lesson.from.getTime()
    //     && lesson.from.getTime() < now + 600000 // 600000 ms = 10 minutes
    //   ) notif = { title: 'Prochain cours', body: `(${lesson.room}) ${lesson.subject} avec ${lesson.teacher}` };

    //   if (notif) sendPush(user.username, { ...notif, tag: 'COURS' });
    // });

    if (user.data && user.data.homeworks && user.data.homeworks.find) {  
      // Traitement homeworks

      data.homeworks.forEach((work) => {
        const oldWork = user.data.homeworks.find((w) => `${w.givenAt.seconds * 1000}_${w.subject}` === `${work.givenAt.getTime()}_${work.subject}`);
        if (!oldWork) sendPush(user, { title: `Travail ${work.subject}`, body: work.description, tag: `HW_${work.givenAt.getTime()}` });
      });
    }

    if (user.data && user.data.marks && user.data.marks.find) {  
      // Traitement marks

      data.marks.forEach((mark) => {
        const oldMark = user.data.marks.find((m) => m.id === mark.id);
        if (!oldMark) sendPush(user, {
          title: `Note ${mark.subject.name} (Coef: ${mark.coefficient})`,
          body: `${mark.title}: ${mark.value}/${mark.scale} [Min: ${mark.min} - Max: ${mark.max}]`,
          tag: `MRK_${mark.id}`
        });
      });
    }

    if (log) console.log('Action: DONE');

    callback(data);
  },
});

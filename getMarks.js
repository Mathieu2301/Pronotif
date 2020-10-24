const parse = require('pronote-api/src/data/types');
const { toPronote } = require('pronote-api/src/data/objects');
const navigate = require('pronote-api/src/fetch/pronote/navigate');

module.exports = async function getMarks(session, period = {}) {
  const marks = await navigate(session, session.user, 'DernieresNotes', 198, ['student'], {
    periode: period.name ? toPronote(period) : period
  });

  if (!marks) return null;

  const result = {};

  if (marks.moyGenerale) {
    result.studentAverage = parse(marks.moyGenerale);
    result.studentAverageScale = parse(marks.baremeMoyGenerale);
    result.defaultStudentAverageScale = parse(marks.baremeMoyGeneraleParDefaut);
  }

  if (marks.moyGeneraleClasse) {
    result.studentClassAverage = parse(marks.moyGeneraleClasse);
  }

  return {
    ...result,
    // subjects: parse(marks.listeServices, ({
    //   ordre, estServiceEnGroupe,
    //   moyEleve, baremeMoyEleve, baremeMoyEleveParDefaut, moyClasse, moyMax, moyMin,
    //   couleur,
    // }) => ({
    //   position: ordre,
    //   isGroupSubject: estServiceEnGroupe,
    //   studentAverage: parse(moyEleve),
    //   studentAverageScale: parse(baremeMoyEleve),
    //   defaultStudentAverageScale: parse(baremeMoyEleveParDefaut),
    //   studentClassAverage: parse(moyClasse),
    //   maxAverage: parse(moyMax),
    //   minAverage: parse(moyMin),
    //   color: couleur,
    // })) || [],
    // marks: parse(marks.listeDevoirs, ({
    //   note, bareme, baremeParDefaut, date, service, periode, moyenne, estEnGroupe, noteMax, noteMin,
    //   commentaire, coefficient,
    // }) => ({
    //   subject: parse(service, ({ couleur }) => ({
    //     color: couleur,
    //   })),
    //   title: commentaire,
    //   value: parse(note),
    //   scale: parse(bareme),
    //   average: parse(moyenne),
    //   defaultScale: parse(baremeParDefaut),
    //   coefficient,
    //   min: parse(noteMin) || -1,
    //   max: parse(noteMax) || -1,
    //   date: parse(date),
    //   period: parse(periode),
    //   isGroupMark: estEnGroupe,
    // })) || [],
    marks: parse(marks.listeDevoirs, ({
      note, bareme, date, service, moyenne, noteMax, noteMin,
      commentaire, coefficient,
    }) => ({
      subject: parse(service, ({ couleur }) => ({
        color: couleur,
      })),
      title: commentaire,
      value: parse(note),
      scale: parse(bareme),
      average: parse(moyenne),
      coefficient,
      min: parse(noteMin) || -1,
      max: parse(noteMax) || -1,
      date: parse(date),
    })) || [],
  };
};

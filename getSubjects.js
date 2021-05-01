const parse = require('pronote-api/src/data/types');
const { toPronote } = require('pronote-api/src/data/objects');
const navigate = require('pronote-api/src/fetch/pronote/navigate');

module.exports = async function getMarks(session, period = {}) {
  const marks = await navigate(session, session.user, 'DernieresNotes', 198, ['student'], {
    periode: period.name ? toPronote(period) : period,
  });

  if (!marks) return null;

  return {
    averages: {
      value: parse(marks.moyGenerale) || -1,
      class: parse(marks.moyGeneraleClasse) || -1,
    },

    subjects: parse(marks.listeServices, ({
      moyEleve, moyClasse, moyMax, moyMin,
      baremeMoyEleve, couleur,
    }) => ({
      value: parse(moyEleve),
      scale: parse(baremeMoyEleve),
      class: parse(moyClasse),
      min: parse(moyMin),
      max: parse(moyMax),
      color: couleur,
    })) || [],

    marks: parse(marks.listeDevoirs, ({
      note, bareme, date, service, moyenne, noteMax, noteMin,
      commentaire, coefficient, periode,
    }) => ({
      subject: parse(service, ({ couleur: color }) => ({ color })),
      title: commentaire,
      value: parse(note),
      scale: parse(bareme),
      average: parse(moyenne),
      coefficient,
      min: parse(noteMin) || -1,
      max: parse(noteMax) || -1,
      date: parse(date),
      period: parse(periode).name || 'Autre',
    })) || [],
  };
};

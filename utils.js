const config = require('./config');

console.log('Timezone correcter:', (config.CORR / 3600000), 'hour(s)');

const addZeros = (nbr) => (Number(nbr) < 10 ? `0${nbr}` : `${nbr}`);

const dateCorr = (...keys) => (item) => {
  const rs = item;
  for (const k of keys) {
    if (rs[k] instanceof Date) rs[k] = rs[k].getTime() - config.CORR;
  }
  return rs;
};

const nowDate = () => {
  const d = new Date(Date.now() + config.CORR);
  return `> ${addZeros(d.getDate())
  }/${addZeros(d.getMonth() + 1)
  } ${addZeros(d.getHours())
  }:${addZeros(d.getMinutes())
  }:${addZeros(d.getSeconds())
  }`;
};

module.exports = {
  addZeros,
  dateCorr,
  nowDate,
};

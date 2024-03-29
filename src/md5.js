const crypto = require('crypto');

const md5 = (data) => {
  return crypto.createHash('md5').update(data).digest('hex');
};

module.exports = md5;

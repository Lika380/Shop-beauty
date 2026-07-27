const crypto = require('crypto');

const CODE_LENGTH = 6;
const TTL_MINUTES = 10;

function generateCode() {
  return String(crypto.randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, '0');
}

function getExpiryDate() {
  return new Date(Date.now() + TTL_MINUTES * 60 * 1000);
}

module.exports = { generateCode, getExpiryDate, TTL_MINUTES };

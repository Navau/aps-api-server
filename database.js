const { Pool } = require("pg");
const { promisify } = require("util");
const { PARAMS_CONNECTION } = require("./config");

const pool = new Pool(PARAMS_CONNECTION);
pool.connect((err, client) => {
  if (err) {
    console.error(err);
    throw err;
  }
  if (client) client.release();
  console.log("Conexión al pool correcto.");
  return;
});

promisify(pool.query);

module.exports = pool;

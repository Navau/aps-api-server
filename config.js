const API_VERSION = "v1";
const IP_SERVER_API = "localhost";
const IP_SERVER_DB = process.env.DATABASE_HOST || "localhost";
const PORT_DB = process.env.DATABASE_PORT || 5432;
const PORT_SERVER = 3977; // 3977 || 5290
// const PARAMS_CONNECTION = {
//   host: IP_SERVER_DB,
//   user: process.env.DATABASE_USER || "svtwlzpatpgvdg",
//   password: process.env.DATABASE_PASS || "71b620b8896975475949c07a703f156fe6cc96a6b2b2d1042319fbd9c410ae1c", //apsadmin2022
//   database: process.env.DATABASE_NAME || "dfpc86sb3fh4vd",
//   port: PORT_DB,
//   ssl: { rejectUnauthorized: false },
// };

const PARAMS_CONNECTION = {
  host: IP_SERVER_DB,
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASS || "navau", //apsadmin2022
  database: process.env.DATABASE_NAME || "APS",
  port: PORT_DB,
};

module.exports = {
  API_VERSION,
  IP_SERVER_API,
  IP_SERVER_DB,
  PORT_DB,
  PARAMS_CONNECTION,
  PORT_SERVER,
};

const API_VERSION = "v1";
const IP_SERVER_API = "localhost";
<<<<<<< HEAD
// const IP_SERVER_DB = "ec2-54-157-16-196.compute-1.amazonaws.com"; //localhost
const IP_SERVER_DB = "localhost"; //localhost
const PORT_DB = 5432;
const PORT_SERVER = process.env.PORT || 3977; // 3977 || 5290 || 5000

// const PARAMS_CONNECTION = {
//   host: IP_SERVER_DB,
//   user: "postgres",
//   password: "apsadmin2022", //apsadmin2022
//   database: "APS",
//   port: PORT_DB,
//   ssl: { rejectUnauthorized: false },
// };

// const PARAMS_CONNECTION = {
//   host: IP_SERVER_DB,
//   user: "svtwlzpatpgvdg",
//   password: "71b620b8896975475949c07a703f156fe6cc96a6b2b2d1042319fbd9c410ae1c", //apsadmin2022
//   database: "dfpc86sb3fh4vd",
//   port: PORT_DB,
//   ssl: { rejectUnauthorized: false },
=======
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
>>>>>>> 07a68483100d52ac8501ac09674dd6747c01d111
// };

const PARAMS_CONNECTION = {
  host: IP_SERVER_DB,
<<<<<<< HEAD
  user: "postgres",
  password: "navau", //apsadmin2022
  database: "APS",
=======
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASS || "navau", //apsadmin2022
  database: process.env.DATABASE_NAME || "APS",
>>>>>>> 07a68483100d52ac8501ac09674dd6747c01d111
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

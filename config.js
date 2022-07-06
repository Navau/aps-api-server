const API_VERSION = "v1";
const IP_SERVER_API = "localhost";
const IP_SERVER_DB = "ec2-54-159-22-90.compute-1.amazonaws.com"; //localhost
// const IP_SERVER_DB = "localhost"; //localhost
const PORT_DB = 5432;
const PORT_SERVER = process.env.PORT || 3977; // 3977 || 5290
const PARAMS_CONNECTION = {
  host: IP_SERVER_DB,
  user: "gmvrmtclxzjqnu",
  password: "46a20461066279f698e4d086af878d02980b4d3763613c5b7d6432ade168002c", //apsadmin2022
  database: "dffjt8b6npef61",
  port: PORT_DB,
  ssl: { rejectUnauthorized: false },
};
// const PARAMS_CONNECTION = {
//   host: IP_SERVER_DB,
//   user: "postgres",
//   password: "navau", //apsadmin2022
//   database: "APS",
//   port: PORT_DB,
// };

module.exports = {
  API_VERSION,
  IP_SERVER_API,
  IP_SERVER_DB,
  PORT_DB,
  PARAMS_CONNECTION,
  PORT_SERVER,
};

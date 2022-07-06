const API_VERSION = "v1";
const IP_SERVER_API = "localhost";
// const IP_SERVER_DB = "ec2-44-205-41-76.compute-1.amazonaws.com"; //localhost
const IP_SERVER_DB = "localhost"; //localhost
const PORT_DB = 5432;
const PORT_SERVER = process.env.PORT || 3977; // 3977 || 5290
// const PARAMS_CONNECTION = {
//   host: IP_SERVER_DB,
//   user: "qugjbcgwewthjq",
//   password: "2a1b4107db5bb5d91c6042071b73be511c1ee258d5d42f3895f2be65f237e8e9", //apsadmin2022
//   database: "d7j9o8aude4h0s",
//   port: PORT_DB,
//   ssl: { rejectUnauthorized: false },
// };
const PARAMS_CONNECTION = {
  host: IP_SERVER_DB,
  user: "postgres",
  password: "navau", //apsadmin2022
  database: "APS",
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

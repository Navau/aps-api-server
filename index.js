// const mysql = require("mysql");
const { Client } = require("pg");
const app = require("./app");

const {
  API_VERSION,
  IP_SERVER_API,
  PARAMS_CONNECTION,
  PORT_SERVER,
} = require("./config");

const connection = new Client(PARAMS_CONNECTION);

connection.connect((err) => {
  if (err) {
    console.log("ERROR", err);
    throw err;
  } else {
    console.log("La conexión a la base de datos es correcta.");
    app.listen(PORT_SERVER, () => {
      console.log("#####################");
      console.log("###### API_REST #####");
      console.log("#####################");
      console.log(`####VERSION##${API_VERSION}########`);
      console.log(`http://${IP_SERVER_API}:${PORT_SERVER}/api`);
    });
  }
});

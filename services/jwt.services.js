const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY =
  "EstoEsUnaClaveSecretaParaQueElTokenFuncioneYTengaAutenticidad-PuedeTomarCualquierValor-PeroDebeSerSeguro";

exports.createAccessToken = function (user) {
  //FUNCTION PARA CREAR EL ACCESS TOKEN
  console.log("USER", user);
  const payload = {
    id_usuario: user.id_usuario,
    nbf: moment().unix(),
    exp: moment().add(48, "hours").unix(),
    iat: moment().unix(),
  };

  console.log(payload);

  return jwt.encode(payload, SECRET_KEY);
};

exports.createAccessTokenWithRol = function (user) {
  //FUNCTION PARA CREAR EL ACCESS TOKEN
  console.log("USER", user);
  const payload = {
    id_usuario: user.id_usuario,
    id_rol: user.id_rol,
    nbf: moment().unix(),
    exp: moment().add(48, "hours").unix(),
    iat: moment().unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken = function (user) {
  //FUNCTION PARA CREAR EL REFRESH ACCES TOKEN
  const payload = {
    id: user.id_usuario,
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

exports.decodedToken = function (token) {
  return jwt.decode(token, SECRET_KEY, true);
};

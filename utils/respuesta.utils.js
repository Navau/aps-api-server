function respErrorServidor500(res, err, msg) {
  console.log(err);
  res.status(500).send({
    resultado: 0,
    datos: null,
    mensaje: msg ? msg : "Error del servidor.",
    err,
  });
}

function respResultadoVacio404(res, msg) {
  res.status(404).send({
    resultado: 0,
    datos: null,
    mensaje: msg
      ? msg
      : "No se logró realizar correctamente la petición, debido a que no se pudo encontrar u obtener la información.",
  });
}

function respResultadoCorrecto200(res, result, msg) {
  res.status(200).send({
    resultado: 1,
    datos: result.rows,
    mensaje: msg ? msg : "La petición fue realizada correctamente.",
  });
}

function respResultadoCorrectoObjeto200(res, data, msg) {
  res.status(200).send({
    resultado: 1,
    datos: data,
    mensaje: msg ? msg : "La petición fue realizada correctamente.",
  });
}

function respDatosNoRecibidos400(res, msg) {
  res.status(400).send({
    resultado: 0,
    datos: null,
    mensaje: msg ? msg : "No se envio ningún dato o entrada para la petición.",
  });
}

function respIDNoRecibido400(res, msg) {
  res.status(400).send({
    resultado: 0,
    datos: null,
    mensaje: msg ? msg : "No se especificó el ID.",
  });
}

module.exports = {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
};

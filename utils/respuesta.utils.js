function respErrorServidor500(res, err, msg) {
  console.log(err);
  let errMessage = err?.message ? err?.message : "";
  res.status(500).send({
    resultado: 0,
    datos: null,
    mensaje: msg ? msg + errMessage : "Error del servidor. ERROR:" + errMessage,
    err,
  });
}

function respErrorServidor500END(res, err, msg) {
  console.log(err);
  let errMessage = err?.message ? err?.message : "";
  res
    .status(500)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msg
        ? msg + errMessage
        : "Error del servidor. ERROR:" + errMessage,
      err,
    })
    .end();
}

function respErrorMulter500(res, err, msg) {
  console.log(err);
  let errMessage = err?.message ? err?.message : "";
  res
    .status(500)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msg
        ? msg + errMessage
        : "Se ha producido un error de Multer al cargar el archivo. ERROR:" +
          errMessage,
      err,
    })
    .end();
}

function respErrorExtensionError403(res, err, msg) {
  console.log(err);
  let errMessage = err?.message ? err?.message : "";
  res
    .status(413)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msg
        ? msg + errMessage
        : "Error desconocido al cargar el archivo. ERROR:" + errMessage,
      err,
    })
    .end();
}

function respResultadoVacio404(res, msg) {
  res.status(404).send({
    resultado: 0,
    datos: null,
    mensaje: msg
      ? msg
      : "No se logró realizar correctamente la petición, debido a que la información no existe.",
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

function respDatosNoRecibidos400END(res, msg) {
  res
    .status(400)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msg
        ? msg
        : "No se envio ningún dato o entrada para la petición.",
    })
    .end();
}

function respArchivoErroneo415(res, err, msg) {
  res.status(415).send({
    resultado: 0,
    datos: null,
    mensaje: msg
      ? msg
      : "El tipo de archivo que se ha recibido no cumple con el formato esperado.",
    errores: err,
  });
}

function respArchivoErroneo200(res, err, data, msg) {
  res.status(200).send({
    resultado: 0,
    datos: data,
    mensaje: msg
      ? msg
      : "El tipo de archivo que se ha recibido no cumple con el formato esperado.",
    errores: err,
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
  respErrorMulter500,
  respErrorExtensionError403,
  respDatosNoRecibidos400,
  respArchivoErroneo415,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respArchivoErroneo200,
};

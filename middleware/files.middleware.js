const multer = require("multer");
const path = require("path");
const { map } = require("lodash");
const fs = require("fs");
const pool = require("../database");
const moment = require("moment");

const { formatoArchivo } = require("../utils/formatoCamposArchivos.utils");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  CargarArchivoABaseDeDatosUtil,
  EliminarUtil,
  ResetearIDUtil,
  InsertarVariosUtil,
} = require("../utils/consulta.utils");

const {
  respErrorServidor500,
  respErrorMulter500,
  respDatosNoRecibidos400,
  respArchivoErroneo415,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
} = require("../utils/respuesta.utils");

const nameTable = "APS_aud_carga_archivos_bolsa";

function formatearDatosEInsertarCabeceras(headers, dataSplit) {
  let arrayDataObject = [];
  let errors = [];

  map(dataSplit, (item, index) => {
    let rowSplit = item.split(",");
    if (item.length === 0) {
      return;
    }
    if (rowSplit.length > Object.keys(headers).length) {
      errors.push({
        msg: `El archivo contiene ${
          rowSplit.length
        } columnas y el formato esperado es que tenga ${
          Object.keys(headers).length
        } columnas`,
      });
      return;
    }
    let resultObject = {};
    let counterAux = 0;
    map(headers, (item2, index2) => {
      resultObject = {
        ...resultObject,
        [index2]: rowSplit[counterAux]?.trim().replace(/['"]+/g, ""), //QUITAR ESPACIOS Y QUITAR COMILLAS DOBLES
      };
      counterAux++;
    });
    arrayDataObject.push(resultObject);
  });

  if (errors.length >= 1) {
    return {
      err: true,
      errors,
    };
  }
  return arrayDataObject;
}

function obtenerValidaciones(typeFile) {
  let result = null;
  if (typeFile === "k") {
    result = [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: false,
        required: true,
        function: "clasificadorcomun",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{0,20}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z0-9]{0,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoinstrumento",
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9]{0,30}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa",
        pattern: /^(\d{1,8})(\.\d{4,4}){0,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto",
        pattern: /^(\d{1,16})(\.\d{2,2}){0,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto_minimo",
        pattern: /^(\d{1,16})(\.\d{2,2}){0,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tipo_marcacion",
        pattern: /^[A-Za-z]{2,2}$/,
        positveNegative: true,
        required: true,
        function: "marcacion",
      },
    ];
  }

  return result;
}

async function clasificadorComun(table, params) {
  let query = ListarUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function tipoInstrumento(table, params) {
  let query = ListarUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function tipoMarcacion(params) {
  let resultFinal = null;
  if (
    params.montoNegociado !== 0 &&
    params.montoNegociado >= params.montoMinimo
  ) {
    resultFinal = "AC, NA";
  }
  if (
    params.montoNegociado !== 0 &&
    params.montoNegociado < params.montoMinimo
  ) {
    resultFinal = "NM";
  }

  return resultFinal;
}

async function FiltrarNombreArchivo(paramsFilter) {
  const id_rol = paramsFilter.req.user.id_rol;
  const id_usuario = paramsFilter.req.user.id_usuario;
  console.log(paramsFilter);

  const ObtenerListaArchivosPromise = new Promise(async (resolve, reject) => {
    const params = {
      body: {
        id_usuario,
      },
    };
    let query = EscogerUtil("APS_view_archivos_pensiones_seguros", params);
    await pool
      .query(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });

  let result = await ObtenerListaArchivosPromise.then((response) => {
    console.log(response);
  })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      console.log("finally");
    });
}

exports.validarArchivo = async (req, res, next) => {
  let insertFilesPromise = null;
  let nroCargaPromise = null;
  let nroCargas = [];
  let isOkUpload = null;
  try {
    let filesUploaded = req?.files; //ARCHIVOS SUBIDOS Y TEMPORALES
    let filesReaded = []; //ARCHIVOS LEIDOS Y EXISTENTES
    let errors = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO
    let clasificador = await clasificadorComun("APS_param_clasificador_comun", {
      idKey: "id_clasificador_comun_grupo",
      idValue: 1,
    });
    let siglaClasificador = clasificador.resultFinal[0].sigla;
    let instrumento = await tipoInstrumento("APS_param_tipo_instrumento");

    map(filesUploaded, async (item, index) => {
      const filePath = `./uploads/tmp/${item.originalname}`;
      let data = fs.readFileSync(filePath, "utf8");
      let dataSplit = null;
      let fileDate = "";
      map(item.originalname, (item2, index2) => {
        if (item2.match(/^[0-9]$/) !== null) {
          fileDate += item2;
          if (index2 % 2 === 0) {
            fileDate += "-";
          }
        }
      });
      fileDate = fileDate.substring(0, fileDate.length - 1);
      currentDate = moment().format("YYYY-MM-DD");
      if (fileDate !== currentDate) {
        errors.push({
          file: item.originalname,
          type: "ERROR NAME",
          message: "El nombre del archivo no coincide con la fecha actual.",
        });
      } else {
        if (data.length === 0) {
          errors.push({
            file: item.originalname,
            type: "DATA EMPTY",
            message: "El contenido del archivo esta vacío.",
          });
        } else {
          if (data.includes("\r\n")) {
            dataSplit = data.split("\r\n");
          } else if (data.includes("\r\n")) {
            dataSplit = data.split("\n");
          } else {
            dataSplit = null;
          }
          if (dataSplit === null) {
            errors.push({
              file: item.originalname,
              type: "DATA SPLIT",
              message:
                "Ocurrió un error debido al formato del contenido del archivo.",
            });
          } else {
            if (item.originalname.includes("K.")) {
              console.log("ARCHIVO CORRECTO : K", item.originalname);
              let headers = formatoArchivo("k");
              let arrayDataObject = formatearDatosEInsertarCabeceras(
                headers,
                dataSplit
              );
              if (arrayDataObject?.err === true) {
                map(arrayDataObject.errors, (itemError, indexError) => {
                  errors.push({
                    file: item.originalname,
                    type: "FILE CONTENT ERROR",
                    message: itemError.msg,
                  });
                });
              } else {
                let arrayValidateObject = obtenerValidaciones("k");
                map(arrayDataObject, async (item2, index2) => {
                  map(arrayValidateObject, async (item3, index3) => {
                    let value = item2[item3.columnName];
                    let columnName = item3.columnName;
                    let pattern = item3.pattern;
                    let required = item3.required;
                    let funct = item3.function;

                    if (required === true) {
                      if (!item2[item3.columnName]) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE NULL OR EMPTY",
                          message: `El valor esta vacio o existe un error en el contenido del archivo, en la columna de '${columnName}' que contiene el valor de: '${value}'`,
                        });
                      } else {
                        let match = value.match(pattern);
                        if (match === null) {
                          errors.push({
                            file: item.originalname,
                            type: "VALUE INCORRECT",
                            message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}'`,
                          });
                        }
                        if (columnName === "fecha") {
                          if (value !== "20" + fileDate) {
                            errors.push({
                              file: item.originalname,
                              type: "VALUE INCORRECT",
                              message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}' el cual tiene que coincidir con la fecha del nombre del archivo`,
                            });
                          }
                        }
                        if (funct === "clasificadorcomun") {
                          if (value !== siglaClasificador) {
                            errors.push({
                              file: item.originalname,
                              type: "VALUE INCORRECT",
                              message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con la sigla '${siglaClasificador}' de Clasificador Común para la Bolsa de valores`,
                            });
                          }
                        } else if (funct === "tipoinstrumento") {
                          let errInstrumento = true;
                          map(instrumento.resultFinal, (item4, index4) => {
                            if (value === item4.sigla) {
                              errInstrumento = false;
                            }
                          });
                          if (errInstrumento === true) {
                            errors.push({
                              file: item.originalname,
                              type: "VALUE INCORRECT",
                              message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                            });
                          }
                        } else if (funct === "marcacion") {
                          let marcacion = await tipoMarcacion({
                            montoNegociado: item2.monto,
                            montoMinimo: item2.monto_minimo,
                          });
                          if (!marcacion.toString().includes(value)) {
                            errors.push({
                              file: item.originalname,
                              type: "VALUE INCORRECT",
                              message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con '${marcacion}' de Tipo Marcación para la Bolsa de valores`,
                            });
                          }
                        }
                      }
                    }
                  });
                });
              }
            } else if (item.originalname.includes("L.")) {
            } else if (item.originalname.includes("N.")) {
            } else if (item.originalname.includes("P.")) {
            } else {
              errors.push({
                file: item.originalname,
                type: "NAME FILE",
                message:
                  "El nombre del archivo no cumple con el formato estandar (no se conoce de que tipo es: 'K', 'L', 'N', 'P').",
              });
            }
          }
        }
      }
      filesReaded.push(dataSplit);
    });

    nroCargaPromise = new Promise(async (resolve, reject) => {
      let result = [];
      let nroCarga = "";
      map(req.files, async (item, index) => {
        queryNroCarga = ValorMaximoDeCampoUtil(nameTable, {
          fieldMax: "nro_carga",
          where: [
            {
              key: "nombre_archivo",
              value: item.originalname,
              like: true,
            },
          ],
        });
        await pool.query(queryNroCarga).then((resultNroCarga) => {
          if (!resultNroCarga.rowCount || resultNroCarga.rowCount < 1) {
            nroCarga = 1;
          } else {
            nroCarga =
              resultNroCarga.rows[0]?.max !== null
                ? resultNroCarga.rows[0]?.max
                : null;
          }
          result.push(nroCarga);
          if (index === req.files.length - 1) {
            resolve(result);
          }
        });
      });
    });

    nroCargas = await nroCargaPromise.then((response) => {
      return response;
    });

    insertFilesPromise = new Promise(async (resolve, reject) => {
      let queryFiles = "";
      let bodyQuery = [];
      let currentFiles = [];
      let resultsPromise = [];
      let errorsPromise = [];
      if (errors.length >= 1) {
        isOkUpload = false;
      } else {
        isOkUpload = true;
      }
      map(req.files, (item, index) => {
        currentFiles.push(item.originalname);
        bodyQuery.push({
          fecha_operacion: new Date(),
          nombre_archivo: item.originalname,
          nro_carga: nroCargas[index] === null ? 1 : nroCargas[index] + 1,
          fecha_entrega: new Date(),
          fecha_carga: new Date(),
          id_usuario: req.user.id_usuario,
          cargado: isOkUpload,
        });
      });
      queryFiles = InsertarVariosUtil(nameTable, {
        body: bodyQuery,
        returnValue: ["id_carga_archivos", "nombre_archivo"],
      });
      await pool
        .query(queryFiles)
        .then(async (resultFiles) => {
          resultsPromise.push({
            files: currentFiles,
            message:
              resultFiles.rowCount >= 1
                ? `Los archivos fueron insertado correctamente a la tabla '${nameTable}'`
                : `El archivo fue insertado correctamente a la tabla '${nameTable}'`,
            result: {
              rowsUpdate: resultFiles.rows,
              rowCount: resultFiles.rowCount,
            },
          });
        })
        .catch((err) => {
          console.log(err);
          errorsPromise.push({
            files: currentFiles,
            type: "QUERY SQL ERROR",
            message: `Hubo un error al insertar datos en la tabla '${nameTable}' ERROR: ${err.message}`,
            err,
          });
        })
        .finally(() => {
          resolve({ resultsPromise, errorsPromise, bodyQuery });
        });
    });

    if (errors.length >= 1) {
      insertFilesPromise.then((response) => {
        errors = [...errors, response.errorsPromise];
        respArchivoErroneo415(res, errors);
      });
    } else {
      insertFilesPromise.then((response) => {
        req.errors = [...errors, response.errorsPromise];
        req.results = response.resultsPromise;
        req.returnsValues = response.resultsPromise[0].result.rowsUpdate;
        req.filesReaded = filesReaded;
        req.filesUploadedBD = response.bodyQuery;
        next();
      });
    }
  } catch (err) {
    respErrorServidor500(res, err, "Ocurrió un error inesperado.");
    throw err;
  }
};

exports.subirArchivo = (req, res, next) => {
  FiltrarNombreArchivo({ req, res });
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/tmp");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).any("archivos");

  upload(req, res, (err) => {
    // console.log("REQ FILES", req?.files);
    if (err instanceof multer.MulterError) {
      respErrorMulter500(res, err);
    } else if (err) {
      if (err.name == "ExtensionError") {
        respErrorExtensionError403(res, err);
      } else {
        respErrorServidor500(res, err);
      }
    } else {
      let filesUploaded = req?.files;
      if (!filesUploaded || filesUploaded?.length === 0) {
        respDatosNoRecibidos400(
          res,
          "No se encontro ningún archivo para subir."
        );
      } else {
        next();
      }
    }
  });
};

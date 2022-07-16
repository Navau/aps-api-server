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
} = require("../utils/consulta.utils");

const {
  respErrorServidor500,
  respErrorMulter500,
  respDatosNoRecibidos400,
  respArchivoErroneo415,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
} = require("../utils/respuesta.utils");

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
        pattern: /^[A-Za-z]{0,3}$/,
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
        pattern: /^[A-Za-z0-9]{0,5}$/,
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
        pattern: /^(\d{1,8})(\.\d{1,4}){0,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto",
        pattern: /^(\d{1,16})(\.\d{1,2}){0,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto_minimo",
        pattern: /^(\d{1,16})(\.\d{1,2}){0,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tipo_marcacion",
        pattern: /^[A-Za-z]{0,2}$/,
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

exports.validarArchivo = async (req, res, next) => {
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
      currentDate = moment().format("YY-MM-DD");
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
                      // console.log(item2);
                      if (!item2[item3.columnName]) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE NULL OR EMPTY",
                          message: `El valor esta vacio o existe un error en el contenido del archivo, en la columna de '${columnName}' que contiene el valor de: '${value}'`,
                        });
                      } else {
                        let match = value.match(pattern);
                        // if (columnName === "tasa") {
                        //   console.log({
                        //     columnName: columnName,
                        //     value: value,
                        //     match,
                        //   });
                        // }
                        if (match === null) {
                          errors.push({
                            file: item.originalname,
                            type: "VALUE INCORRECT",
                            message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}'`,
                          });
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
                          if (!value.toString().includes(marcacion)) {
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

    if (errors.length >= 1) {
      respArchivoErroneo415(res, errors);
    } else {
      req.errors = errors;
      req.filesReaded = filesReaded;
      next();
    }
  } catch (err) {
    respErrorServidor500(res, err, "Ocurrió un error inesperado.");
  }
};

exports.subirArchivo = (req, res, next) => {
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

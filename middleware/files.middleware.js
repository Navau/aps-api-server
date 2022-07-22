const multer = require("multer");
const path = require("path");
const { map } = require("lodash");
const fs = require("fs");
const pool = require("../database");
const moment = require("moment");

const {
  formatoArchivo,
  obtenerValidaciones,
  clasificadorComun,
  tipoMarcacion,
  tipoInstrumento,
  codigoOperacion,
  codigoMercado,
  calificacionRiesgo,
  codigoCustodia,
  formatearDatosEInsertarCabeceras,
  accionesMonedaOriginal,
} = require("../utils/formatoCamposArchivos.utils");

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
  ObtenerColumnasDeTablaUtil,
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
const { SelectInnerJoinSimple } = require("../utils/multiConsulta.utils");

var nameTable = "APS_aud_carga_archivos_bolsa";

async function obtenerInstitucion(params) {
  const id_rol = params.req.user.id_rol;
  const id_usuario = params.req.user.id_usuario;

  const obtenerListaInstitucion = new Promise(async (resolve, reject) => {
    const params = {
      select: [
        `"APS_seg_usuario".id_usuario`,
        `"APS_seg_usuario".usuario`,
        `"APS_seg_institucion".id_institucion`,
        `"APS_seg_institucion".sigla as sigla_institucion`,
        `"APS_seg_institucion".codigo`,
      ],
      from: [`"APS_seg_usuario"`],
      innerjoin: [
        {
          join: `"APS_seg_institucion"`,
          on: [
            `"APS_seg_usuario".id_institucion = "APS_seg_institucion".id_institucion`,
          ],
        },
      ],
      // where: [{ key: `"APS_seg_usuario".id_usuario`, value: id_usuario }],
    };
    let query = SelectInnerJoinSimple(params);
    await pool
      .query(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });

  await obtenerListaInstitucion
    .then((response) => {
      return { result: response.rows };
    })
    .catch((err) => {
      return { err };
    });
}

async function obtenerListaArchivos(params) {
  const id_rol = params.req.user.id_rol;
  const id_usuario = params.req.user.id_usuario;

  const obtenerListaArchivosPromise = new Promise(async (resolve, reject) => {
    const paramsQuery = {
      body: {
        id_usuario,
      },
    };
    let query = EscogerUtil("APS_view_archivos_pensiones_seguros", paramsQuery);
    await pool
      .query(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
  return obtenerListaArchivosPromise;
}

exports.validarArchivo = async (req, res, next) => {
  let insertFilesPromise = null;
  let nroCargaPromise = null;
  let nroCargas = [];
  let isOkUpload = null;
  let codeCurrentFile = null;
  let isOkQuerys = false;
  try {
    let filesUploaded = req?.files; //ARCHIVOS SUBIDOS Y TEMPORALES
    let filesReaded = []; //ARCHIVOS LEIDOS Y EXISTENTES
    let errors = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO
    const clasificador = await clasificadorComun(
      "APS_param_clasificador_comun",
      {
        idKey: "id_clasificador_comun_grupo",
        idValue: 1,
      }
    );

    const siglaClasificador = clasificador.resultFinal[0].sigla;
    const archivosRequeridos = await obtenerListaArchivos({ req, res })
      .then((response) => {
        return { result: response.rows };
      })
      .catch((err) => {
        return { err };
      });
    const currentDate = moment().format("YYYYMMDD");

    map(filesUploaded, async (item, index) => {
      const filePath = `./uploads/tmp/${item.originalname}`;
      const data = fs.readFileSync(filePath, "utf8");
      let dataSplit = null;
      let isFileRequire = false;
      map(archivosRequeridos.result, (item2, index2) => {
        if (item2.archivo === item.originalname) {
          isFileRequire = true;
        }
      });
      if (isFileRequire === false) {
        errors.push({
          file: item.originalname,
          type: "ERROR FILE",
          message:
            "El nombre del archivo no coincide con los archivos requeridos del usuario.",
        });
      } else if (!item.originalname.includes(currentDate)) {
        errors.push({
          file: item.originalname,
          type: "ERROR NAME",
          message: "El nombre del archivo no coincide con la fecha actual.",
        });
      } else if (data.length === 0) {
        errors.push({
          file: item.originalname,
          type: "DATA EMPTY",
          message: "El contenido del archivo esta vacío.",
        });
      } else {
        if (data.includes("\r\n")) {
          dataSplit = data.split("\r\n");
        } else if (data.includes("\n")) {
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
          isOkQuerys = true;
          let paramsInstrumento = null;
          let paramsCodOperacion = null;
          let paramsAccionesMO = null;
          let paramsCodMercado = null;
          let paramsCalfRiesgo = null;
          let paramsCodCustodia = null;
          if (item.originalname.includes("K.")) {
            console.log("ARCHIVO CORRECTO : K", item.originalname);
            let headers = await formatoArchivo("k");
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
                        value,
                        column: columnName,
                        row: index2,
                      });
                    } else {
                      let match = value.match(pattern);
                      if (match === null) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE INCORRECT",
                          message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}'`,
                          value,
                          column: columnName,
                          row: index2,
                        });
                      }
                      if (columnName === "fecha") {
                        if (value !== "20" + fileDate) {
                          errors.push({
                            file: item.originalname,
                            type: "VALUE INCORRECT",
                            message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}' el cual tiene que coincidir con la fecha del nombre del archivo`,
                            value,
                            column: columnName,
                            row: index2,
                          });
                        }
                      }
                      if (funct === "clasificadorcomun") {
                        if (value !== siglaClasificador) {
                          errors.push({
                            file: item.originalname,
                            type: "VALUE INCORRECT",
                            message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con la sigla '${siglaClasificador}' de Clasificador Común para la Bolsa de valores`,
                            value,
                            column: columnName,
                            row: index2,
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
                            value,
                            column: columnName,
                            row: index2,
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
                            value,
                            column: columnName,
                            row: index2,
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
          } else if (item.originalname.includes(".413")) {
            console.log("ARCHIVO CORRECTO : 413", item.originalname);
            codeCurrentFile = "413";
            nameTable = "APS_aud_carga_archivos_pensiones_seguros";
            paramsInstrumento = {
              table: "APS_param_tipo_instrumento",
              params: {
                select: ["sigla"],
                where: [
                  {
                    key: "id_grupo",
                    valuesWhereIn: [125, 214],
                    whereIn: true,
                  },
                ],
              },
            };
            paramsCodOperacion = {
              table: "APS_param_tipo_operacion",
              params: {
                select: ["codigo_aps"],
                where: [
                  {
                    key: "tipo",
                    value: "V",
                  },
                ],
              },
            };
            paramsAccionesMO = {
              table: "APS_param_tipo_instrumento",
              params: {
                select: ["sigla"],
                where: [
                  {
                    key: "id_grupo",
                    valuesWhereIn: [125, 214],
                    whereIn: true,
                  },
                ],
              },
            };
            paramsCodMercado = {
              table: "APS_param_lugar_negociacion",
              params: {
                select: ["codigo_aps"],
                where: [
                  {
                    key: "id_tipo_lugar_negociacion",
                    value: 148,
                    operator: "<>",
                  },
                ],
              },
            };
            paramsCalfRiesgo = {
              table: "APS_param_clasificador_comun",
              params: {
                select: ["descripcion"],
                where: [
                  {
                    key: "id_clasificador_comun_grupo",
                    value: 5,
                  },
                ],
              },
            };
            paramsCodCustodia = {
              table: "APS_param_clasificador_comun",
              params: {
                select: ["sigla"],
                where: [
                  {
                    key: "id_clasificador_comun_grupo",
                    value: 9,
                  },
                ],
              },
            };
          } else {
            errors.push({
              file: item.originalname,
              type: "NAME FILE",
              message:
                "El nombre del archivo no cumple con el formato estandar (no se conoce que tipo de archivo es.",
            });
          }
          const instrumento = paramsInstrumento
            ? await tipoInstrumento(
                paramsInstrumento.table,
                paramsInstrumento.params
              )
            : null;
          const codOperacion = paramsCodOperacion
            ? await codigoOperacion(
                paramsCodOperacion.table,
                paramsCodOperacion.params
              )
            : null;
          const accionesMO = paramsAccionesMO
            ? await accionesMonedaOriginal(
                paramsAccionesMO.table,
                paramsAccionesMO.params
              )
            : null;
          const codMercado = paramsCodMercado
            ? await codigoMercado(
                paramsCodMercado.table,
                paramsCodMercado.params
              )
            : null;
          const calfRiesgo = paramsCalfRiesgo
            ? await calificacionRiesgo(
                paramsCalfRiesgo.table,
                paramsCalfRiesgo.params
              )
            : null;
          const codCustodia = paramsCodCustodia
            ? await codigoCustodia(
                paramsCodCustodia.table,
                paramsCodCustodia.params
              )
            : null;

          console.log("instrumento", instrumento);
          console.log("codOperacion", codOperacion);
          console.log("accionesMO", accionesMO);
          console.log("codMercado", codMercado);
          console.log("calfRiesgo", calfRiesgo);
          console.log("codCustodia", codCustodia);

          let headers = await formatoArchivo(codeCurrentFile);
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
            // console.log(arrayDataObject);
            let arrayValidateObject = await obtenerValidaciones(
              codeCurrentFile
            );
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
                      message: `El valor esta vacio o existe un error no controlado en el contenido del archivo, en la columna de '${columnName}' que contiene el valor de: '${value}'`,
                      value,
                      column: columnName,
                      row: index2,
                    });
                  } else {
                    let match = value.match(pattern);
                    if (match === null) {
                      errors.push({
                        file: item.originalname,
                        type: "VALUE INCORRECT",
                        message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}'`,
                        value,
                        column: columnName,
                        row: index2,
                      });
                    }
                    if (columnName === "fecha_operacion") {
                      if (value.includes(currentDate)) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE INCORRECT",
                          message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}' el cual tiene que coincidir con la fecha del nombre del archivo`,
                          value,
                          column: columnName,
                          row: index2,
                        });
                      }
                    }
                    if (funct === "clasificadorcomun") {
                      if (value !== siglaClasificador) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE INCORRECT",
                          message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con la sigla '${siglaClasificador}' de Clasificador Común para la Bolsa de valores`,
                          value,
                          column: columnName,
                          row: index2,
                        });
                      }
                    } else if (funct === "tipoInstrumento") {
                      let errFunction = true;
                      map(instrumento.resultFinal, (item4, index4) => {
                        if (value === item4.sigla) {
                          errFunction = false;
                        }
                      });
                      if (errFunction === true) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE INCORRECT",
                          message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          value,
                          column: columnName,
                          row: index2,
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
                          value,
                          column: columnName,
                          row: index2,
                        });
                      }
                    } else if (funct === "accionesMonedaOriginal") {
                      let errFunction = true;
                      map(codOperacion.resultFinal, (item4, index4) => {
                        if (value === item4.codigo_aps) {
                          errFunction = false;
                        }
                      });
                      if (errFunction === true) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE INCORRECT",
                          message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          value,
                          column: columnName,
                          row: index2,
                        });
                      }
                    } else if (funct === "codigoMercado") {
                      let errFunction = true;
                      map(codMercado.resultFinal, (item4, index4) => {
                        if (value === item4.codigo_aps) {
                          errFunction = false;
                        }
                      });
                      if (errFunction === true) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE INCORRECT",
                          message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          value,
                          column: columnName,
                          row: index2,
                        });
                      }
                    } else if (funct === "calificacionRiesgo") {
                      let errFunction = true;
                      map(calfRiesgo.resultFinal, (item4, index4) => {
                        if (value === item4.descripcion) {
                          errFunction = false;
                        }
                      });
                      if (errFunction === true) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE INCORRECT",
                          message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          value,
                          column: columnName,
                          row: index2,
                        });
                      }
                    } else if (funct === "codigoCustodia") {
                      let errFunction = true;
                      map(codCustodia.resultFinal, (item4, index4) => {
                        if (value === item4.sigla) {
                          errFunction = false;
                        }
                      });
                      if (errFunction === true) {
                        errors.push({
                          file: item.originalname,
                          type: "VALUE INCORRECT",
                          message: `El contenido del archivo no cumple con el formato correcto, en la columna de '${columnName}' que contiene el valor de: '${value}' en la fila '${index2}', el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          value,
                          column: columnName,
                          row: index2,
                        });
                      }
                    }
                  }
                }
              });
            });
          }
        }
      }

      filesReaded.push(dataSplit);
    });

    nroCargaPromise = new Promise(async (resolve, reject) => {
      let result = [];
      let errorsPromise = [];
      let nroCarga = "";
      map(req.files, async (item, index) => {
        queryNroCarga = ValorMaximoDeCampoUtil(nameTable, {
          fieldMax: "nro_carga",
          where: [
            {
              key: "fecha_operacion",
              value: moment().format("YYYY-MM-DD"),
            },
          ],
        });
        await pool
          .query(queryNroCarga)
          .then((resultNroCarga) => {
            if (!resultNroCarga.rowCount || resultNroCarga.rowCount < 1) {
              nroCarga = 1;
            } else {
              nroCarga =
                resultNroCarga.rows[0]?.max !== null
                  ? resultNroCarga.rows[0]?.max
                  : null;
            }
            result.push(nroCarga);
          })
          .catch((err) => {
            console.log(err);
            errorsPromise.push({
              files: currentFiles,
              type: "QUERY SQL ERROR",
              message: `Hubo un error al obtener el ultimo NUMERO DE CARGA en la tabla '${nameTable}' de la FECHA OPERACIÓN ${moment().format(
                "YYYY-MM-DD"
              )} ERROR: ${err.message}`,
              err,
            });
          })
          .finally(() => {
            if (index === req.files.length - 1) {
              resolve({ result, errorsPromise });
            }
          });
      });
    });

    nroCargas = await nroCargaPromise.then((response) => {
      if (response.errorsPromise.length >= 1) {
        errors = [...errors, response.errorsPromise];
        return null;
      } else {
        return response;
      }
    });

    if (nroCargas !== null) {
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
            id_rol: req.user.id_rol,
            fecha_operacion: new Date(),
            // nombre_archivo: item.originalname,
            nro_carga:
              nroCargas.result[index] === null
                ? 1
                : nroCargas.result[index] + 1,
            fecha_carga: new Date(),
            id_usuario: req.user.id_usuario,
            cargado: isOkUpload,
          });
        });
        queryFiles = InsertarVariosUtil(nameTable, {
          body: bodyQuery,
          returnValue: ["id_carga_archivos"],
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
            console.log("ERR", err);
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
      insertFilesPromise.then((response) => {
        // console.log(response);
        if (errors.length >= 1 || response.errorsPromise.length >= 1) {
          errors = [...errors, response.errorsPromise];
          respArchivoErroneo415(res, errors);
        } else {
          req.errors = [...errors, response.errorsPromise];
          req.results = response.resultsPromise;
          req.returnsValues = response.resultsPromise[0]?.result?.rowsUpdate;
          req.filesReaded = filesReaded;
          req.filesUploadedBD = response.bodyQuery;
          req.codeCurrentFile = codeCurrentFile;
          req.nameTableAud = nameTable;
          next();
        }
      });
    } else {
      respArchivoErroneo415(res, errors);
    }
  } catch (err) {
    respErrorServidor500(res, err, "Ocurrió un error inesperado.");
    throw err;
  }
};

exports.subirArchivo = async (req, res, next) => {
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

const multer = require("multer");
const path = require("path");
const { map, filter } = require("lodash");
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
  obtenerInformacionDeArchivo,
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
var nameTableErrors = "APS_aud_errores_carga_archivos ";
var errors = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO

async function obtenerInstitucion(params) {
  const obtenerListaInstitucion = new Promise(async (resolve, reject) => {
    const params = {
      select: [
        `"APS_seg_institucion".codigo`,
        `"APS_param_clasificador_comun".descripcion`,
      ],
      from: [`"APS_seg_institucion"`],
      innerjoin: [
        {
          join: `"APS_param_clasificador_comun"`,
          on: [
            `"APS_param_clasificador_comun".id_clasificador_comun = "APS_seg_institucion".id_tipo_mercado`,
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

  return obtenerListaInstitucion;
}

function verificarArchivosRequeridos(archivosRequeridos, archivosSubidos) {
  let arrayA = archivosRequeridos.result;
  let arrayB = archivosSubidos;
  let arrayResult = [];
  let arrayResult2 = [];
  map(arrayA, (itemR, indexR) => {
    arrayResult2.push(itemR.archivo);
    map(arrayB, (itemU, indexU) => {
      if (itemR.archivo === itemU.originalname) {
        arrayResult.push(itemR.archivo);
      }
    });
  });
  map(arrayResult, (item, index) => {
    let myIndex = arrayResult2.indexOf(item);
    if (myIndex !== -1) {
      arrayResult2.splice(myIndex, 1);
    }
  });
  return {
    ok: JSON.stringify(arrayA) === JSON.stringify(arrayB),
    missingFiles: arrayResult2,
  };
}

async function obtenerListaArchivos(params) {
  const id_rol = params.req.user.id_rol;
  const id_usuario = params.req.user.id_usuario;
  const fecha_operacion = params.req?.body?.fecha_operacion
    ? params.req.body.fecha_operacion
    : moment().format("YYYY-MM-DD");

  const obtenerListaArchivosPromise = new Promise(async (resolve, reject) => {
    let query = `SELECT 
    replace(replace(replace(replace(replace(
      "APS_param_archivos_pensiones_seguros".nombre::text,'nnn'::text, "APS_seg_institucion".codigo::text), 
      'aaaa'::text, EXTRACT(year FROM TIMESTAMP '${fecha_operacion}')::text), 
      'mm'::text, lpad(EXTRACT(month FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)), 
      'dd'::text, lpad(EXTRACT(day FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)), 
      'nntt'::text, "APS_seg_institucion".codigo::text || "APS_param_archivos_pensiones_seguros".codigo::text) AS archivo, 
      "APS_seg_usuario".id_usuario 
      FROM "APS_param_archivos_pensiones_seguros" 
      JOIN "APS_param_clasificador_comun" 
      ON "APS_param_archivos_pensiones_seguros".id_periodicidad = "APS_param_clasificador_comun".id_clasificador_comun 
      JOIN "APS_seg_usuario_rol" 
      ON "APS_seg_usuario_rol".id_rol = "APS_param_archivos_pensiones_seguros".id_rol 
      JOIN "APS_seg_usuario" 
      ON "APS_seg_usuario".id_usuario = "APS_seg_usuario_rol".id_usuario 
      JOIN "APS_seg_institucion" 
      ON "APS_seg_institucion".id_institucion = "APS_seg_usuario".id_institucion 
      WHERE "APS_seg_usuario".id_usuario = '${id_usuario}'`;
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
  let isOkUpload = null;
  let codeCurrentFile = null;
  let isEndRegisterAllFilesAux = false;
  let isOkQuerys = false;
  let fechaInicial = req?.body?.fecha_operacion;

  const fechaOperacion = fechaInicial
    ? fechaInicial.split("-").join("")
    : moment().format("YYYYMMDD");

  try {
    let filesUploaded = req?.files; //ARCHIVOS SUBIDOS Y TEMPORALES
    let filesReaded = []; //ARCHIVOS LEIDOS Y EXISTENTES
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
    const isAllFiles = await verificarArchivosRequeridos(
      archivosRequeridos,
      filesUploaded
    );

    const instituciones = await obtenerInstitucion()
      .then((response) => {
        return { result: response.rows };
      })
      .catch((err) => {
        return { err };
      });

    map(req.files, (item, index) => {
      if (item.originalname.substring(0, 3) === "108") {
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
      } else {
        nameTable = null;
      }
    });

    map(filesUploaded, async (item, index) => {
      const filePath = `./uploads/tmp/${item.originalname}`;
      const data = fs.readFileSync(filePath, "utf8");
      let dataSplit = null;
      if (data.includes("\r\n")) {
        dataSplit = data.split("\r\n");
      } else if (data.includes("\n")) {
        dataSplit = data.split("\n");
      } else {
        dataSplit = null;
      }
      if (isAllFiles.ok === false && isEndRegisterAllFilesAux === false) {
        map(isAllFiles.missingFiles, (item, index) => {
          errors.push({
            archivo: item,
            tipo_error: "ARCHIVO FALTANTE",
            descripcion:
              "El archivo subido no coincide con los archivos requeridos del usuario.",
          });
        });
        isEndRegisterAllFilesAux = true;
      }
      if (isEndRegisterAllFilesAux === false) {
        if (!item.originalname.includes(fechaOperacion)) {
          errors.push({
            archivo: item.originalname,
            tipo_error: "NOMBRE ARCHIVO ERRONEO",
            descripcion:
              "El nombre del archivo no coincide con la fecha de operación.",
          });
        } else if (data.length === 0) {
          errors.push({
            archivo: item.originalname,
            tipo_error: "CONTENIDO VACIO",
            descripcion: "El contenido del archivo esta vacío.",
          });
        } else if (dataSplit === null) {
          errors.push({
            archivo: item.originalname,
            tipo_error: "FORMATO DE INFORMACION ERRONEO",
            mensaje:
              "Ocurrió un error debido al formato del contenido del archivo.",
          });
        } else {
          isOkQuerys = true;
          let headers = null;

          const infoArchivo = await obtenerInformacionDeArchivo(
            item.originalname
          );

          codeCurrentFile = await infoArchivo.codeCurrentFile;
          nameTable = await infoArchivo.nameTable;
          headers = await infoArchivo.headers;
          console.log(infoArchivo);

          //#region VALIDADORES
          const instrumento = infoArchivo?.paramsInstrumento
            ? await tipoInstrumento(
                infoArchivo.paramsInstrumento.table,
                infoArchivo.paramsInstrumento.params
              )
            : null;
          const codOperacion = infoArchivo?.paramsCodOperacion
            ? await codigoOperacion(
                infoArchivo.paramsCodOperacion.table,
                infoArchivo.paramsCodOperacion.params
              )
            : null;
          const accionesMO = infoArchivo?.paramsAccionesMO
            ? await accionesMonedaOriginal(
                infoArchivo.paramsAccionesMO.table,
                infoArchivo.paramsAccionesMO.params
              )
            : null;
          const codMercado = infoArchivo?.paramsCodMercado
            ? await codigoMercado(
                infoArchivo.paramsCodMercado.table,
                infoArchivo.paramsCodMercado.params
              )
            : null;
          const calfRiesgo = infoArchivo?.paramsCalfRiesgo
            ? await calificacionRiesgo(
                infoArchivo.paramsCalfRiesgo.table,
                infoArchivo.paramsCalfRiesgo.params
              )
            : null;
          const codCustodia = infoArchivo?.paramsCodCustodia
            ? await codigoCustodia(
                infoArchivo.paramsCodCustodia.table,
                infoArchivo.paramsCodCustodia.params
              )
            : null;

          //#endregion
          let arrayDataObject = await formatearDatosEInsertarCabeceras(
            headers,
            dataSplit
          );

          if (arrayDataObject?.err === true) {
            map(arrayDataObject.errors, (itemError, indexError) => {
              errors.push({
                archivo: item.originalname,
                tipo_error: "ERROR DE CONTENIDO",
                descripcion: itemError.msg,
              });
            });
          } else {
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
                      archivo: item.originalname,
                      tipo_error: "VALOR EN NULO O VACIO",
                      descripcion: `El valor esta vacio o existe un error no controlado en el contenido del archivo, en la columna de "${columnName}" que contiene el valor de: "${value}"`,
                      valor:
                        typeof value === "undefined"
                          ? "undefined"
                          : value === null
                          ? null
                          : "",
                      columna: columnName,
                      fila: index2,
                    });
                  } else {
                    let match = value.match(pattern);
                    if (match === null) {
                      errors.push({
                        archivo: item.originalname,
                        tipo_error: "VALOR INCORRECTO",
                        descripcion: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: "${value}" en la fila "${index2}"`,
                        valor: value,
                        columna: columnName,
                        fila: index2,
                      });
                    }
                    if (columnName === "fecha_operacion") {
                      if (value.includes(fechaOperacion)) {
                        errors.push({
                          archivo: item.originalname,
                          tipo_error: "VALOR INCORRECTO",
                          descripcion: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: "${value}" en la fila "${index2}" el cual tiene que coincidir con la fecha del nombre del archivo`,
                          valor: value,
                          columna: columnName,
                          fila: index2,
                        });
                      }
                    }
                    if (funct === "clasificadorcomun") {
                      if (value !== siglaClasificador) {
                        errors.push({
                          archivo: item.originalname,
                          tipo_error: "VALOR INCORRECTO",
                          descripcion: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: "${value}" en la fila "${index2}", el cual tiene que coincidir con la sigla "${siglaClasificador}" de Clasificador Común para la Bolsa de valores`,
                          valor: value,
                          columna: columnName,
                          fila: index2,
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
                          archivo: item.originalname,
                          tipo_error: "VALOR INCORRECTO",
                          descripcion: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: "${value}" en la fila "${index2}", el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          valor: value,
                          columna: columnName,
                          fila: index2,
                        });
                      }
                    } else if (funct === "marcacion") {
                      let marcacion = await tipoMarcacion({
                        montoNegociado: item2.monto,
                        montoMinimo: item2.monto_minimo,
                      });
                      if (!marcacion.toString().includes(value)) {
                        errors.push({
                          archivo: item.originalname,
                          tipo_error: "VALOR INCORRECTO",
                          descripcion: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: "${value}" en la fila "${index2}", el cual tiene que coincidir con "${marcacion}" de Tipo Marcación para la Bolsa de valores`,
                          valor: value,
                          columna: columnName,
                          fila: index2,
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
                          archivo: item.originalname,
                          tipo_error: "VALOR INCORRECTO",
                          descripcion: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: "${value}" en la fila "${index2}", el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          valor: value,
                          columna: columnName,
                          fila: index2,
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
                          archivo: item.originalname,
                          tipo_error: "VALOR INCORRECTO",
                          descripcion: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: "${value}" en la fila "${index2}", el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          valor: value,
                          columna: columnName,
                          fila: index2,
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
                          archivo: item.originalname,
                          tipo_error: "VALOR INCORRECTO",
                          descripcion: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: "${value}" en la fila "${index2}", el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          valor: value,
                          columna: columnName,
                          fila: index2,
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
                          archivo: item.originalname,
                          tipo_error: "VALOR INCORRECTO",
                          descripcion: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: "${value}" en la fila "${index2}", el cual tiene que coincidir con alguna sigla de Tipo Instrumento para la Bolsa de valores`,
                          valor: value,
                          columna: columnName,
                          fila: index2,
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

      if (index === filesUploaded.length - 1) {
        const nroCargaPromise = new Promise(async (resolve, reject) => {
          let result = [];
          let errorsPromise = [];
          let nroCarga = "";
          map(req.files, async (item, index) => {
            queryNroCarga = ValorMaximoDeCampoUtil(nameTable, {
              fieldMax: "nro_carga",
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
                  type: "QUERY SQL ERROR",
                  message: `Hubo un error al obtener el ultimo NUMERO DE CARGA en la tabla '${nameTable}' de la FECHA OPERACIÓN ${fechaOperacion} ERROR: ${err.message}`,
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

        const nroCargas = await nroCargaPromise.then((response) => {
          if (response.errorsPromise.length >= 1) {
            errors = [...errors, response.errorsPromise];
            return null;
          } else {
            return response;
          }
        });

        if (nroCargas !== null) {
          const insertFilesPromise = new Promise(async (resolve, reject) => {
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
            });
            bodyQuery.push({
              id_rol: req.user.id_rol,
              fecha_operacion: fechaOperacion,
              nro_carga:
                nroCargas.result[0] === null ? 1 : nroCargas.result[0] + 1,
              fecha_carga: new Date(),
              id_usuario: req.user.id_usuario,
              cargado: isOkUpload,
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
          insertFilesPromise
            .then((response) => {
              if (errors.length >= 1 || response.errorsPromise.length >= 1) {
                if (response.errorsPromise.length >= 1) {
                  errors = [...errors, response.errorsPromise];
                }
                respArchivoErroneo415(res, errors);
                const insertErorrsPromise = new Promise(
                  async (resolve, reject) => {
                    let queryFiles = "";
                    let bodyQuery = [];
                    let currentFiles = [];
                    let resultsPromise = [];
                    let errorsPromise = [];
                    map(errors, (item, index) => {
                      bodyQuery.push({
                        id_carga_archivos:
                          response.resultsPromise[0]?.result?.rowsUpdate[0]
                            .id_carga_archivos,
                        archivo: item.archivo,
                        tipo_error: item.tipo_error,
                        descripcion: item.descripcion,
                        valor:
                          item.valor === ""
                            ? "VACIO"
                            : item.hasOwnProperty("valor")
                            ? item.valor
                            : "",
                        fila: item.hasOwnProperty("fila")
                          ? parseInt(item.fila) + 1
                          : 0,
                        columna: item.hasOwnProperty("columna")
                          ? item.columna
                          : 0,
                      });
                    });

                    queryFiles = InsertarVariosUtil(nameTableErrors, {
                      body: bodyQuery,
                      returnValue: ["id_error_archivo"],
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
                  }
                );
                insertErorrsPromise
                  .then((response) => {})
                  .catch((err) => {
                    respErrorServidor500(
                      res,
                      err,
                      "Ocurrió un error inesperado."
                    );
                  });
              } else {
                req.errors = [...errors, response.errorsPromise];
                req.results = response.resultsPromise;
                req.returnsValues =
                  response.resultsPromise[0]?.result?.rowsUpdate;
                req.filesReaded = filesReaded;
                req.filesUploadedBD = response.bodyQuery;
                req.codeCurrentFile = codeCurrentFile;
                req.nameTableAud = nameTable;
                // next();
              }
            })
            .finally(() => {});
        } else {
          respArchivoErroneo415(res, errors);
        }
        // console.log(errors);
      }

      filesReaded.push(dataSplit);
    });
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

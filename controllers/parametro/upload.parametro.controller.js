const { map } = require("lodash");
const pool = require("../../database");
const fs = require("fs");

const { formatoArchivo } = require("../../utils/formatoCamposArchivos.utils");

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
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respArchivoErroneo415,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_aud_carga_archivos_bolsa";

async function CargarArchivo(req, res) {
  let fieldMax = "id_carga_archivos";
  let idCargaArchivos = null;
  let idArchivo = null;
  let errors = [];
  let filesReaded = req.filesReaded;
  let resultFinal = [];
  let uploadPromise = null;
  try {
    uploadPromise = new Promise(async (resolve, reject) => {
      let queryCargaArchivoBolsa = await ListarUtil(nameTable, {});
      let currentFilesBD = [];
      await pool
        .query(queryCargaArchivoBolsa)
        .then(async (result) => {
          currentFilesBD = await result.rows;
        })
        .catch((err) => {
          console.log(err);
          errors.push({
            type: "QUERY SQL ERROR",
            message: `Hubo un error al obtener los datos en la tabla '${nameTable}' ERROR: ${err.message}`,
            err,
          });
        });
      try {
        await map(req.files, async (item, index) => {
          let existFileBD = {};
          map(currentFilesBD, (item2, index2) => {
            if (item2.nombre_archivo === item.originalname) {
              existFileBD = item2;
              return;
            }
          });
          const params = {
            fieldMax,
            where: [
              {
                key: "nombre_archivo",
                value: item.originalname,
                like: true,
              },
            ],
          };
          let filePath =
            __dirname.substring(0, __dirname.indexOf("controllers")) +
            item.path;
          let queryMax = ValorMaximoDeCampoUtil(nameTable, params);
          await pool
            .query(queryMax)
            .then(async (resultMax) => {
              console.log(resultMax);
              if (!resultMax.rowCount || resultMax.rowCount < 1) {
                idCargaArchivos = 1;
              } else {
                idCargaArchivos =
                  (await resultMax.rows[0].max) !== null
                    ? resultMax.rows[0].max
                    : 1;
              }
            })
            .catch((err) => {
              console.log(err);
              errors.push({
                file: item.originalname,
                type: "QUERY SQL ERROR",
                message: `Hubo un error al obtener el Maximo ID del campo: ${fieldMax} ERROR: ${err.message}`,
                err,
              });
            });
          let arrayDataObject = [];
          map(filesReaded[index], (item2, index2) => {
            let rowSplit = item2.split(",");
            let resultObject = [];
            map(rowSplit, (item3, index3) => {
              if (item3 !== "") {
                resultObject = [
                  ...resultObject,
                  item3.trim(), //QUITAR ESPACIOS
                ];
              }
            });
            if (item2 !== "") {
              arrayDataObject.push(resultObject);
            }
          });
          let arrayDataObjectWithIDandStatus = [];
          map(arrayDataObject, (item2, index2) => {
            let result = [...item2, `"${idCargaArchivos}","true"\r\n`];
            arrayDataObjectWithIDandStatus.push(result);
          });
          let dataFile = arrayDataObjectWithIDandStatus.join("");
          const filePathWrite = `./uploads/tmp/${item.originalname}`;
          fs.writeFileSync(filePathWrite, dataFile);
          let headers = null;
          let tableFile = null;
          let paramsFile = null;
          if (item.originalname.includes("K.")) {
            headers = formatoArchivo("k");
            tableFile = "APS_oper_archivo_k";
            idArchivo = "id_archivo_k";

            headers = {
              ...headers,
              codigo_activo: headers.tipo_marcacion,
              id_carga_archivos: idCargaArchivos,
              estado: true,
            };

            delete headers.tipo_marcacion;

            paramsFile = {
              headers,
              filePath,
            };
          } else if (item.originalname.includes("L.")) {
          } else if (item.originalname.includes("N.")) {
          } else if (item.originalname.includes("P.")) {
          }
          let queryMain = "";
          let queryFile = "";
          let queryDelete = "";
          let queryMaxFile = "";
          let queryResetIDFile = "";
          let lastIDFile = null;
          queryMaxFile = ValorMaximoDeCampoUtil(tableFile, {
            fieldMax: idArchivo,
          });

          if (Object.keys(existFileBD).length >= 1) {
            queryDelete = EliminarUtil(tableFile, {
              where: {
                id_carga_archivos: existFileBD.id_carga_archivos,
              },
            });
            queryMain = ActualizarUtil(nameTable, {
              body: {
                id_carga_archivos: existFileBD.id_carga_archivos,
                fecha_operacion: new Date(existFileBD.fecha_operacion),
                nombre_archivo: item.originalname,
                nro_carga: existFileBD.nro_carga + 1,
                fecha_entrega: new Date(),
                fecha_carga: new Date(),
                id_usuario: req.user.id_usuario,
                cargado: true,
              },
              idKey: "id_carga_archivos",
              idValue: existFileBD.id_carga_archivos,
            });
            queryFile = CargarArchivoABaseDeDatosUtil(tableFile, {
              action: "insert",
              paramsFile,
              existFileBD,
            });
          } else {
            queryMain = await InsertarUtil(nameTable, {
              body: {
                fecha_operacion: new Date(),
                nombre_archivo: item.originalname,
                nro_carga: 1,
                fecha_entrega: new Date(),
                fecha_carga: new Date(),
                id_usuario: req.user.id_usuario,
                cargado: true,
              },
            });

            queryFile = await CargarArchivoABaseDeDatosUtil(tableFile, {
              action: "insert",
              paramsFile,
            });
          }
          await pool
            .query(queryMain)
            .then(async (resultMain) => {
              resultFinal.push({
                file: item.originalname,
                message: `El archivo fue insertado correctamente a la tabla ''${nameTable}''`,
                result: {
                  rowsUpdate: resultMain.rows,
                  rowCount: resultMain.rowCount,
                },
              });
              if (queryDelete.length >= 1) {
                await pool
                  .query(queryDelete)
                  .then(async (resultDelete) => {
                    resultFinal.push({
                      file: item.originalname,
                      message: `El archivo fue eliminado correctamente de la tabla '${tableFile}'`,
                      result: {
                        rowsUpdate: resultDelete.rows,
                        rowCount: resultDelete.rowCount,
                      },
                    });
                    await pool
                      .query(queryMaxFile)
                      .then(async (resultMaxFile) => {
                        if (
                          !resultMaxFile.rowCount ||
                          resultMaxFile.rowCount < 1
                        ) {
                          lastIDFile = 1;
                        } else {
                          lastIDFile =
                            (await resultMaxFile.rows[0]?.max) !== null
                              ? resultMaxFile.rows[0].max
                              : 1;
                        }
                      });
                    queryResetIDFile = ResetearIDUtil(tableFile, {
                      field: idArchivo,
                      resetValue: lastIDFile + 1,
                    });
                    await pool.query(queryResetIDFile);
                    await pool
                      .query(queryFile)
                      .then(async (resultFile) => {
                        resultFinal.push({
                          file: item.originalname,
                          message: `El archivo fue insertado correctamente a la tabla '${tableFile}'`,
                          result: {
                            rowsUpdate: resultFile.rows,
                            rowCount: resultFile.rowCount,
                          },
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                        errors.push({
                          file: item.originalname,
                          type: "QUERY SQL ERROR",
                          message: `Hubo un error al insertar datos en la tabla ${tableFile} ERROR: ${err.message}`,
                          err,
                        });
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    errors.push({
                      file: item.originalname,
                      type: "QUERY SQL ERROR",
                      message: `Hubo un error al eliminar datos en la tabla ${tableFile} ERROR: ${err.message}`,
                      err,
                    });
                  });
              } else {
                await pool.query(queryMaxFile).then(async (resultMaxFile) => {
                  if (!resultMaxFile.rowCount || resultMaxFile.rowCount < 1) {
                    lastIDFile = 1;
                  } else {
                    lastIDFile =
                      (await resultMaxFile.rows[0]?.max) !== null
                        ? resultMaxFile.rows[0].max
                        : 1;
                  }
                });
                queryResetIDFile = ResetearIDUtil(tableFile, {
                  field: idArchivo,
                  resetValue: lastIDFile === 1 ? 1 : lastIDFile + 1,
                });
                await pool
                  .query(queryResetIDFile)
                  .then((resultResetIDFile) => {});
              }
            })
            .catch((err) => {
              console.log(err);
              errors.push({
                file: item.originalname,
                type: "QUERY SQL ERROR",
                message: `Hubo un error al insertar datos en la tabla '${nameTable}' ERROR: ${err.message}`,
                err,
              });
            });
        });
      } catch (err) {
        respErrorServidor500(res, err, "Ocurrió un error inesperado.");
      } finally {
        resolve({ resultFinal, errors });
      }
    });
  } catch (err) {
    respErrorServidor500(res, err, "Ocurrió un error inesperado.");
  }
  uploadPromise
    .then((response) => {
      if (response.errors.length >= 1) {
        respArchivoErroneo415(res, response.errors);
      } else {
        respResultadoCorrecto200(
          res,
          {
            rows: response.resultFinal,
          },
          "Archivos Cargados correctamente."
        );
      }
    })
    .catch((err) => {
      respErrorServidor500(res, err, "Ocurrió un error inesperado.");
    });
}

async function CargarArchivo2(req, res) {
  let idCargaArchivos = null;
  let errorsFinal = [];
  let filesReaded = req.filesReaded;
  let filesUploadedBD = req.filesUploadedBD;
  let previousResults = req.results;
  let previousErrors = req.errors;
  let returnsValues = req.returnsValues;
  let resultFinal = [];
  let bodyPartialQuery = [];
  let bodyFinalQuery = [];
  let uploadPromise = null;
  let tableFile = null;
  let paramsFile = null;
  let queryUpdateForError = "";
  // console.log("filesUploadedBD", filesUploadedBD);
  // console.log("previousResults", previousResults);
  // console.log("previousErrors", previousErrors);
  // console.log("returnsValues", returnsValues);
  // console.log("ESTOY EN CARGAR ARCHIVO 2");
  uploadPromise = new Promise(async (resolve, reject) => {
    let errors = [];
    // let queryCurrentFilesBD = ListarUtil(nameTable, {});
    // let currentFilesBD = [];
    map(req.files, async (item, index) => {
      let arrayDataObject = [];
      let filePath =
        __dirname.substring(0, __dirname.indexOf("controllers")) + item.path;
      map(filesReaded[index], (item2, index2) => {
        let rowSplit = item2.split(",");
        let resultObject = [];
        map(rowSplit, (item3, index3) => {
          if (item3 !== "") {
            resultObject = [
              ...resultObject,
              item3.trim(), //QUITAR ESPACIOS
            ];
          }
        });
        if (item2 !== "") {
          arrayDataObject.push(resultObject);
        }
      });
      let arrayDataObjectWithIDandStatus = [];
      map(returnsValues, (item2, index2) => {
        if (item2.nombre_archivo === item.originalname) {
          idCargaArchivos = item2.id_carga_archivos;
        }
      });
      // console.log(arrayDataObject);
      map(arrayDataObject, (item2, index2) => {
        let result = [...item2, `"${idCargaArchivos}"`, `"true"\r\n`];
        arrayDataObjectWithIDandStatus.push(result);
      });
      // console.log(arrayDataObjectWithIDandStatus);
      let dataFile = arrayDataObjectWithIDandStatus.join("");
      const filePathWrite = `./uploads/tmp/${item.originalname}`;
      fs.writeFileSync(filePathWrite, dataFile);
      let headers = null;

      if (item.originalname.includes("K.")) {
        headers = formatoArchivo("k");
        tableFile = "APS_oper_archivo_k";

        headers = {
          ...headers,
          codigo_activo: headers.tipo_marcacion,
          id_carga_archivos: idCargaArchivos,
          estado: true,
        };

        delete headers.tipo_marcacion;

        paramsFile = {
          headers,
          filePath,
        };
      } else if (item.originalname.includes("L.")) {
      } else if (item.originalname.includes("N.")) {
      } else if (item.originalname.includes("P.")) {
      }
      //#region Formateando informacion de archivo para insertar por medio de un INSERT QUERY
      let finalData = [];
      let partialData = [];
      map(arrayDataObjectWithIDandStatus, (itemV1, indexV1) => {
        // console.log("ITEMV1", itemV1);
        let dataObject = Object.assign({}, itemV1);
        partialData.push(dataObject);
      });
      let partialHeaders = Object.keys(headers);
      map(partialData, (itemV1, indexV1) => {
        let x = {};
        map(itemV1, (itemV2, indexV2) => {
          let valueAux = itemV2;
          if (valueAux.includes("\r\n")) {
            valueAux = `"true"`;
          }
          x = {
            ...x,
            [partialHeaders[indexV2]]: valueAux?.trim().replace(/['"]+/g, ""),
          };
        });
        finalData.push(x);
      });
      //#endregion

      bodyPartialQuery.push(finalData);
      // let queryFile = "";

      // queryFile = CargarArchivoABaseDeDatosUtil(tableFile, {
      //   action: "insert",
      //   paramsFile,
      // });

      // await pool
      //   .query(queryFile)
      //   .then((resultFile) => {
      //     resultFinal.push({
      //       file: item.originalname,
      //       message: `El archivo fue insertado correctamente a la tabla '${tableFile}'`,
      //       result: {
      //         rowsUpdate: resultFile.rows,
      //         rowCount: resultFile.rowCount,
      //       },
      //     });
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     errors.push({
      //       file: item.originalname,
      //       type: "QUERY SQL ERROR",
      //       message: `Hubo un error al insertar datos en la tabla ${tableFile} ERROR: ${err.message}`,
      //       err,
      //     });
      //     if (index === req.files.length - 1) {
      //       reject({ resultFinal, errors });
      //     }
      //   })
      //   .finally(() => {
      //     if (index === req.files.length - 1) {
      //       resolve({ resultFinal, errors });
      //     }
      //   });
    });
    map(bodyPartialQuery, (itemBPQ, indexBPQ) => {
      bodyFinalQuery = bodyFinalQuery.concat(itemBPQ);
    });

    let queryFiles = "";

    queryFiles = InsertarVariosUtil(tableFile, {
      body: bodyFinalQuery,
      returnValue: ["id_carga_archivos", "id_archivo_k"],
    });

    await pool
      .query(queryFiles)
      .then((resultFile) => {
        resultFinal.push({
          // file: item.originalname,
          message: `El archivo fue insertado correctamente a la tabla '${tableFile}'`,
          result: {
            rowsUpdate: resultFile.rows,
            rowCount: resultFile.rowCount,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        errors.push({
          // file: item.originalname,
          type: "QUERY SQL ERROR",
          message: `Hubo un error al insertar datos en la tabla ${tableFile} ERROR: ${err.message}`,
          err,
        });
        reject({ resultFinal, errors });
      })
      .finally(() => {
        resolve({ resultFinal, errors });
      });
  });

  const ActualizarCampoCargado = (resp) => {
    map(returnsValues, async (item, index) => {
      queryUpdateForError = ActualizarUtil(nameTable, {
        body: {
          cargado: false,
        },
        idKey: "id_carga_archivos",
        idValue: item.id_carga_archivos,
      });

      await pool
        .query(queryUpdateForError)
        .then((response) => {})
        .catch((err) => {})
        .finally(() => {
          if (index === req.files.length - 1) {
            resp;
          }
        });
    });
  };

  uploadPromise
    .then((response) => {
      if (response.errors.length >= 1) {
        ActualizarCampoCargado(
          respArchivoErroneo415(res, [...response.errors, ...previousErrors])
        );
      } else {
        respResultadoCorrecto200(
          res,
          {
            rows: [...response.resultFinal, ...previousResults],
          },
          "Archivos Cargados correctamente."
        );
      }
    })
    .catch((err) => {
      ActualizarCampoCargado(
        respErrorServidor500(res, err, "Ocurrió un error inesperado.")
      );
    });
}

//FUNCION PARA OBTENER TODOS LOS ACTIVIDAD ECONOMICA DE SEGURIDAD
function Listar(req, res) {
  const params = {
    status: "activo",
  };
  let query = ListarUtil(nameTable, params);
  pool.query(query, (err, result) => {
    if (err) {
      respErrorServidor500(res, err);
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        respResultadoCorrecto200(res, result);
      }
    }
  });
}

//FUNCION PARA OBTENER UN ACTIVIDAD ECONOMICA, CON BUSQUEDA
function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      status: "activo",
      body: body,
    };
    let query = BuscarUtil(nameTable, params);
    pool.query(query, (err, result) => {
      if (err) {
        respErrorServidor500(res, err);
      } else {
        if (!result.rows || result.rows < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrecto200(res, result);
        }
      }
    });
  }
}

//FUNCION PARA OBTENER UN ACTIVIDAD ECONOMICA, CON ID DEL ACTIVIDAD ECONOMICA
function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = EscogerUtil(nameTable, params);
    pool.query(query, (err, result) => {
      if (err) {
        respErrorServidor500(res, err);
      } else {
        if (!result.rowCount || result.rowCount < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrecto200(res, result);
        }
      }
    });
  }
}

//FUNCION PARA INSERTAR UN ACTIVIDAD ECONOMICA
function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = InsertarUtil(nameTable, params);
    pool.query(query, (err, result) => {
      if (err) {
        respErrorServidor500(res, err);
      } else {
        if (!result.rowCount || result.rowCount < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrecto200(res, result);
        }
      }
    });
  }
}

//FUNCION PARA ACTUALIZAR UN ACTIVIDAD ECONOMICA
function Actualizar(req, res) {
  const body = req.body;

  let query = "";

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = ActualizarUtil(nameTable, params);

      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(res, result);
          }
        }
      });
    }
  }
}

//FUNCION PARA DESHABILITAR UN ACTIVIDAD ECONOMICA
function Deshabilitar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = DeshabilitarUtil(nameTable, params);
      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(res, result);
          }
        }
      });
    }
  }
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Deshabilitar,
  CargarArchivo,
  CargarArchivo2,
};

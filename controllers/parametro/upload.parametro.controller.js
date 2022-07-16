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
  try {
    let fieldMax = "id_carga_archivos";
    let idCargaArchivos = null;
    let errors = [];
    let filesReaded = req.filesReaded;
    let resultFinal = [];
    let queryCargaArchivoBolsa = ListarUtil(nameTable, params);
    let currentFilesBD = [];
    await pool.query(queryCargaArchivoBolsa, async (err, result) => {
      if (err) {
        console.log(err);
        errors.push({
          file: item.originalname,
          type: "QUERY SQL ERROR",
          message: `Hubo un error al obtener los datos en la tabla '${nameTable}' ERROR: ${err.message}`,
          err,
        });
      } else {
        currentFilesBD = await result.rows;
      }
    });

    if (currentFilesBD.length === 0) {
      errors.push({
        file: item.originalname,
        type: "QUERY SQL ERROR",
        message: `Hubo un error al obtener los datos en la tabla '${nameTable}'. NO EXISTE INFORMACIÓN.`,
      });
    }

    map(req.files, async (item, index) => {
      const params = {
        fieldMax,
        where: [
          {
            key: "nombre_archivo",
            value: item.originalname,
            like: true,
          },
          {
            key: "id_usuario",
            value: req.user.id_usuario,
          },
        ],
      };
      let filePath =
        __dirname.substring(0, __dirname.indexOf("controllers")) + item.path;
      let query = ValorMaximoDeCampoUtil(nameTable, params);
      await pool
        .query(query)
        .then(async (result) => {
          if (!result.rowCount || result.rowCount < 1) {
            idCargaArchivos = 1;
          } else {
            idCargaArchivos =
              result.rows[0].max !== null ? result.rows[0].max : 1;
          }
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
          dataFile = arrayDataObjectWithIDandStatus.join("");
          const filePathWrite = `./uploads/tmp/${item.originalname}`;
          fs.writeFileSync(filePathWrite, dataFile);
          let headers = null;
          let tableFile = null;
          let paramsInsertFile = null;
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

            paramsInsertFile = {
              headers,
              filePath,
            };
          } else if (item.originalname.includes("L.")) {
          } else if (item.originalname.includes("N.")) {
          } else if (item.originalname.includes("P.")) {
          }
          // console.log(arrayDataObjectWithIDandStatus);
          let queryInsert = InsertarUtil(nameTable, {
            body: {
              fecha_operacion: new Date(),
              nombre_archivo: item.originalname,
              nro_carga: arrayDataObjectWithIDandStatus.length,
              fecha_entrega: new Date(),
              fecha_carga: new Date(),
              id_usuario: req.user.id_usuario,
            },
          });

          let queryInsertFile = CargarArchivoABaseDeDatosUtil(
            tableFile,
            paramsInsertFile
          );

          await pool
            .query(queryInsert)
            .then(async (resultInsert) => {
              resultFinal.push({
                file: item.originalname,
                message: `El archivo fue insertado correctamente a la tabla ''${nameTable}''`,
                result: resultInsert.rows,
              });
              await pool
                .query(queryInsertFile)
                .then((resultInsertFile) => {
                  resultFinal.push({
                    file: item.originalname,
                    message: `El archivo fue insertado correctamente a la tabla '${tableFile}'`,
                    result: resultInsertFile.rows,
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
                message: `Hubo un error al insertar datos en la tabla '${nameTable}' ERROR: ${err.message}`,
                err,
              });
            });
        })
        .catch((err) => {
          console.log(err);
          errors.push({
            file: item.originalname,
            type: "QUERY SQL ERROR",
            message: `Hubo un error al obtener el Maximo ID del campo: ${fieldMax} ERROR: ${err.message}`,
            err,
          });
        })
        .finally(() => {});
    });
  } catch (err) {
    respErrorServidor500(res, err, "Ocurrió un error inesperado.");
  } finally {
    if (errors.length >= 1) {
      respArchivoErroneo415(res, errors);
    } else {
      respResultadoCorrecto200(res, {
        rows: resultFinal,
      });
    }
  }
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
};

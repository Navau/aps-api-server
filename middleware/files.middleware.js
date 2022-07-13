const multer = require("multer");
const path = require("path");
const { map } = require("lodash");
const fs = require("mz/fs");
const pool = require("../database");

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
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
} = require("../utils/respuesta.utils");

function formatearDatosEInsertarCabeceras(headers, dataSplit) {
  let countColumns = Object.keys(headers).length;
  let arrayDataObject = [];

  for (let index2 = 0; index2 < countColumns; index2++) {
    let rowSplit = dataSplit[index2].split(",");
    let resultObject = {};
    let counterAux = 0;
    map(headers, (item3, index3) => {
      resultObject = {
        ...resultObject,
        [index3]: rowSplit[counterAux].trim().replace(/['"]+/g, ""), //QUITAR ESPACIOS Y QUITAR COMILLAS DOBLES
      };
      counterAux++;
    });
    arrayDataObject.push(resultObject);
    // console.log("resultObject", resultObject);
    // console.log("ROWSPLIT", rowSplit);
  }
  // console.log("arrayDataObject", arrayDataObject);
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

function clasificadorComun(table, params) {
  let query = ListarUtil(table, params);
  pool.query(query, (err, result) => {
    if (err) {
      return {
        err,
      };
    } else {
      return {
        result,
      };
    }
  });
}

exports.validarArchivo = (req, res, next) => {
  try {
    let filesUploaded = req?.files; //ARCHIVOS SUBIDOS Y TEMPORALES
    let filesReaded = []; //ARCHIVOS LEIDOS Y EXISTENTES
    let errors = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO
    map(filesUploaded, (item, index) => {
      const filePath = `./uploads/tmp/${item.originalname}`;
      let data = fs.readFileSync(filePath, "utf8");
      let dataSplit = null;

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
            let params = {
              idKey: "id_clasificador_comun_grupo",
              idValue: 1,
            };
            let clasificadores = clasificadorComun(
              "APS_param_clasificador_comun",
              params
            );

            console.log(clasificadores);

            let headers = {
              bolsa: null, //Char(3)
              fecha: null, //Date fecha operacion "aaaa-mm-dd"
              codigo_valoracion: null, //Char(20)
              tipo_instrumento: null, //Char(5)
              clave_instrumento: null, //Char(30)
              tasa: null, //Decimal(8,4) tasa promedio
              monto: null, //Decimal(16,2) monto negociado
              monto_minimo: null, //Decimal(16,2) monto mínimo
              tipo_marcacion: null, //Char(2) tipo marcación char 2 ** De donde saca los valores NM, NA, AC en donde se lo pone??
            };
            let arrayDataObject = formatearDatosEInsertarCabeceras(
              headers,
              dataSplit
            );
            let arrayValidateObject = obtenerValidaciones("k");
            map(arrayDataObject, (item2, index2) => {
              map(arrayValidateObject, (item3, index3) => {
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
                      message: `El valor esta vacio o existe un error en el contenido del archivo, en la columna de "${columnName}" que contiene el valor de: ${value}`,
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
                        message: `El contenido del archivo no cumple con el formato correcto, en la columna de "${columnName}" que contiene el valor de: ${value} en la fila ${index2}`,
                      });
                    }
                    if (funct === "clasificadorcomun") {
                      let clasificador = clasificadorComun("");
                    } else if (funct === "tipoinstrumento") {
                    } else if (funct === "marcacion") {
                    }
                  }
                }
              });
            });

            // console.log(
            //   "arrayDataObject: " + item.originalname,
            //   arrayDataObject
            // );
            // console.log(
            //   "arrayValidateObject: " + item.originalname,
            //   arrayValidateObject
            // );
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

      filesReaded.push(dataSplit);
    });
    console.log("ERRORS", errors);
    // console.log("FILESREADED FINAL", filesReaded[0]);
  } catch (err) {
    respErrorServidor500(res, err, "Ocurrió un error inesperado.");
  }
};

exports.subirArchivo = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
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

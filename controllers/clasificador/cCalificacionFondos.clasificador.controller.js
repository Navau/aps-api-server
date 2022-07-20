const { map } = require("lodash");
const pool = require("../../database");

const {
  ListarUtil,
  EscogerUtil,
  EscogerLlaveClasificadorUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_clasificador_comun";
const nameTableGroup = "APS_param_clasificador_comun_grupo";
const idClasificadorComunGrupo = 3;
const valueId = "id_calificacion_cuota";

function Listar(req, res) {
  const params = {
    status: "activo",
    clasificador: true,
    idClasificadorComunGrupo,
    valueId,
  };
  let query = ListarUtil(nameTable, params);
  pool.query(query, (err, result) => {
    if (err) {
      respErrorServidor500(res, err);
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        let resultFinalAux = result;
        let a = [];
        let b = [];
        map(resultFinalAux.rows, (item, index) => {
          map(item, (item2, index2) => {
            if (index2 === "id_clasificador_comun") {
              result.rows[index][valueId] = item2;
              delete result.rows[index][index2];
            }
            b.push();
          });
        });
        respResultadoCorrecto200(res, result);
      }
    }
  });
}

function Escoger(req, res) {
  let params = {
    status: "activo",
    clasificador: true,
    idClasificadorComunGrupo,
    valueId,
  };
  let paramsLlave = {
    idClasificadorComunGrupo,
  };
  let queryLlave = EscogerLlaveClasificadorUtil(nameTableGroup, paramsLlave);
  pool.query(queryLlave, (err, result) => {
    if (err) {
      respErrorServidor500(res, err);
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(
          res,
          `No existe ningún registro que contenta la llave: ${idClasificadorComunGrupo} o ${valueId}`
        );
      } else {
        let query = EscogerUtil(nameTable, params);
        params = { ...params, key: result.rows[0].llave };
        pool.query(query, (err2, result2) => {
          if (err2) {
            respErrorServidor500(res, err2);
          } else {
            if (!result.rowCount || result.rowCount < 1) {
              respResultadoVacio404(res);
            } else {
              respResultadoCorrecto200(res, result2);
            }
          }
        });
      }
    }
  });
}

module.exports = {
  Listar,
  Escoger,
};

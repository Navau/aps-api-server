const { map } = require("lodash");
const pool = require("../../database");

const { ListarUtil, EscogerUtil } = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_clasificador_comun";
const idClasificadorComunGrupo = 2;
const valueId = "id_bolsa";

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
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
      status: "activo",
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

module.exports = {
  Listar,
  Escoger,
};

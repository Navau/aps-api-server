const pool = require("../../database");
const jwt = require("../../services/jwt.services");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ObtenerRolUtil,
  ObtenerMenuAngUtil,
  FormatearObtenerMenuAngUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_seg_rol";

//FUNCION PARA OBTENER EL ROL CON TOKEN
function ObtenerRol(req, res) {
  const token = req?.headers?.authorization;

  if (!token) {
    respDatosNoRecibidos400(res, "El token no existe.");
  } else {
    const data = jwt.decodedToken(token);
    if (!data.id_usuario) {
      respDatosNoRecibidos400(res, "El token no contiene el ID de usuario.");
    } else {
      let query = ObtenerRolUtil("APS_seg_usuario_rol", data, true);
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
}

function ObtenerMenuAng(req, res) {
  const token = req?.headers?.authorization;

  if (!token) {
    respDatosNoRecibidos400(res, "El token no existe.");
  } else {
    const data = jwt.decodedToken(token);
    if (!data.id_usuario) {
      respDatosNoRecibidos400(res, "El token no contiene el ID de usuario.");
    } else {
      let querys = ObtenerMenuAngUtil(data);
      pool.query(querys.query, (err, result) => {
        console.log(result);
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rows || result.rows < 1) {
            respResultadoVacio404(res);
          } else {
            pool.query(querys.querydet, (err, result2) => {
              if (err) {
                respErrorServidor500(res, err);
              } else {
                if (!result2.rows || result2.rows < 1) {
                  respResultadoVacio404(res);
                } else {
                  let data = {
                    result: result.rows,
                    result2: result2.rows,
                  };
                  resultData = FormatearObtenerMenuAngUtil(data);
                  respResultadoCorrectoObjeto200(res, resultData);
                }
              }
            });
          }
        }
      });
    }
  }
}

//FUNCION PARA OBTENER TODOS LOS ROL DE SEGURIDAD
function Listar(req, res) {
  const params = {
    status: "status",
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

//FUNCION PARA OBTENER UN ROL, CON BUSQUEDA
function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      status: "status",
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

//FUNCION PARA OBTENER UN ROL, CON ID DEL ROL
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

//FUNCION PARA INSERTAR UN ROL
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

//FUNCION PARA ACTUALIZAR UN ROL
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

//FUNCION PARA DESHABILITAR UN ROL
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
  ObtenerRol,
  ObtenerMenuAng,
};

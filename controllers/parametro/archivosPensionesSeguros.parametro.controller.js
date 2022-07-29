const pool = require("../../database");

const { SelectInnerJoinSimple } = require("../../utils/multiConsulta.utils");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_view_archivos_pensiones_seguros";

function SeleccionarArchivos(req, res) {
  const { id_usuario, fecha_operacion, periodicidad } = req.body;
  console.log(req.body);

  if (!id_usuario) {
    respDatosNoRecibidos400(
      res,
      "La información que se mando no es suficiente, falta el ID del usuario."
    );
  } else {
    let query = `SELECT replace(replace(replace(replace(replace(replace(
      "APS_param_archivos_pensiones_seguros".nombre::text, 
      'nnn'::text, "APS_seg_institucion".codigo::text), 
      'aaaa'::text, EXTRACT(year FROM TIMESTAMP '${fecha_operacion}')::text), 
      'mm'::text, lpad(EXTRACT(month FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)), 
      'dd'::text, lpad(EXTRACT(day FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)), 
      'nntt'::text, "APS_seg_institucion".codigo::text || 
      "APS_param_archivos_pensiones_seguros".codigo::text),
      'nn'::text, "APS_seg_institucion".codigo::text) AS archivo, 
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
      WHERE "APS_param_clasificador_comun".sigla = '${periodicidad}' 
      AND "APS_seg_usuario".id_usuario = '${id_usuario}' 
      AND "APS_seg_usuario".status = true;`;

    console.log(query);

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

//FUNCION PARA OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE PARAMETRO
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

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
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

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
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

//FUNCION PARA INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
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

//FUNCION PARA ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
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

//FUNCION PARA DESHABILITAR UN CARGA ARCHIVO PENSIONES SEGURO
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
  SeleccionarArchivos,
};

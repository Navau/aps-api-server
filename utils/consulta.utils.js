const moment = require("moment");
const { map } = require("lodash");

function ObtenerRolUtil(table, data, idPK) {
  let query = "";

  data &&
    (query = query + `SELECT * FROM public."${table}" WHERE status = true`);

  query &&
    map(data, (item, index) => {
      index = ponerComillasACamposConMayuscula(index);
      if (item !== null && typeof item !== "undefined") {
        if (idPK === true) {
          if (
            index !== "nbf" &&
            index !== "exp" &&
            index !== "iat" &&
            index !== "id_rol"
          ) {
            if (typeof item === "string") {
              index && (query = query + ` AND ${index} = '${item}'`);
            } else if (typeof item === "number") {
              index && (query = query + ` AND ${index} = ${item}`);
            } else if (typeof item === "boolean") {
              index && (query = query + ` AND ${index} = ${item}`);
            }
          }
        } else if (idPK === false) {
          if (index !== "nbf" && index !== "exp" && index !== "iat") {
            if (typeof item === "string") {
              index && (query = query + ` AND ${index} = '${item}'`);
            } else if (typeof item === "number") {
              index && (query = query + ` AND ${index} = ${item}`);
            } else if (typeof item === "boolean") {
              index && (query = query + ` AND ${index} = ${item}`);
            }
          }
        }
      }
    });
  data && (query = query = query + ";");

  console.log(query);

  return query;
}

function ObtenerMenuAngUtil(data) {
  let query = "";
  let querydet = `select text, 'my_library_books' as icon, 
  routerLink || 
  replace(replace(replace(replace(replace(text, 'á', 'a'), 'ó', 'o'), ' ', ''), 'ú', 'u'), 'í', 'i') as routerLink 
  from 
  (select DISTINCT public."APS_seg_modulo".id_modulo, 
  public."APS_seg_tabla".orden, 
  public."APS_seg_tabla".descripcion as text, '/' || 
  replace(replace(replace(replace(replace(public."APS_seg_modulo".modulo, 'á', 'a'), 'ó', 'o'), ' ', ''), 'ú', 'u'), 'í', 'i') || '/' as routerLink 
  from public."APS_seg_tabla" 
  inner join public."APS_seg_modulo" on public."APS_seg_tabla".id_modulo = public."APS_seg_modulo".id_modulo 
  inner join public."APS_seg_tabla_accion" on public."APS_seg_tabla_accion".id_tabla = public."APS_seg_tabla".id_tabla 
  inner join public."APS_seg_permiso" on public."APS_seg_permiso".id_tabla_accion = public."APS_seg_tabla_accion".id_tabla_accion 
  where public."APS_seg_permiso".status = true AND 
  id_rol = ${data.id_rol} 
  order by public."APS_seg_modulo".id_modulo, 
  public."APS_seg_tabla".orden) as children`;

  query = `select DISTINCT modulo as text, case 
  when modulo like 'Tablas Básicas' then 'view_list' 
  when modulo like 'Datos Operativos' then 'keyboard' 
  when modulo like 'Seguridad' then 'vpn_key' 
  else 'tab' end as icon, null as children 
  from public."APS_seg_modulo" inner join public."APS_seg_tabla" 
  on public."APS_seg_modulo".id_modulo = public."APS_seg_tabla".id_modulo 
  inner join public."APS_seg_tabla_accion" 
  on public."APS_seg_tabla_accion".id_tabla = public."APS_seg_tabla".id_tabla 
  inner join public."APS_seg_permiso" 
  on public."APS_seg_permiso".id_tabla_accion = public."APS_seg_tabla_accion".id_tabla_accion 
  where public."APS_seg_modulo".status = true and id_rol = ${data.id_rol}`;

  // console.log(querydet);
  // console.log(query);

  return {
    querydet,
    query,
  };
}

function FormatearObtenerMenuAngUtil(data) {
  // console.log(data);
  let result = data.result;
  map(data.result, (item, index) => {
    let text = item.text;
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    text = text.replace(/\s+/g, "");
    let arrayChildren = [];
    map(data.result2, (item2, index2) => {
      // console.log(item2.routerlink.split("/")[1]);
      if (item2.routerlink.split("/")[1] === text) {
        // console.log("ITEM", item);
        // console.log("ITEM2", item2);
        arrayChildren.push(item2);
      }
    });
    result = [
      ...result,
      {
        ...result[index],
        children: arrayChildren,
      },
    ];
  });
  let resultFinal = result.filter(function (f) {
    return f.children !== null;
  });

  console.log("resultFinal", resultFinal);

  return resultFinal;
}

function ListarUtil(table, params) {
  let query = "";
  if (params?.clasificador) {
    let indexId = table.indexOf("_", 5);
    let idTable = "id" + table.substring(indexId, table.length);
    console.log("ID", {
      idTable,
      idClasificadorComunGrupo: params.idClasificadorComunGrupo,
      valueId: params.valueId,
    });
    query = `SELECT * FROM public."APS_param_clasificador_comun"`;
    if (params?.status) {
      params.status === "activo" &&
        (query =
          query +
          " WHERE id_clasificador_comun_grupo = " +
          params.idClasificadorComunGrupo +
          " AND activo = true");
      params.status === "status" &&
        (query =
          query +
          " WHERE id_clasificador_comun_grupo = " +
          params.idClasificadorComunGrupo +
          " AND status = true");
    }
  } else {
    query = `SELECT * FROM public."${table}"`;
    if (params?.status) {
      params.status === "activo" && (query = query + " WHERE activo = true");
      params.status === "status" && (query = query + " WHERE status = true");
    }
    query && (query = query + ";");
  }
  console.log(query);

  return query;
}

function BuscarUtil(table, params) {
  let query = "";
  params.body && (query = query + `SELECT * FROM public."${table}" `);
  if (params?.status) {
    params.status === "activo" && (query = query + " WHERE activo = true");
    params.status === "status" && (query = query + " WHERE status = true");
  }

  query &&
    map(params.body, (item, index) => {
      // console.log(
      //   "TIPO: " + typeof item + " CLAVE:" + index + " VALOR: " + item
      // );
      index = ponerComillasACamposConMayuscula(index);
      if (item !== null && typeof item !== "undefined") {
        if (typeof item === "string") {
          index &&
            (query = query + ` AND lower(${index}) like lower('${item}%')`);
        } else if (typeof item === "number") {
          index && (query = query + ` AND ${index} = ${item}`);
        } else if (typeof item === "boolean") {
          index && (query = query + ` AND ${index} = ${item}`);
        }
      }
    });
  params.body && (query = query = query + ";");

  console.log(query);

  return query;
}

function EscogerLlaveClasificadorUtil(table, params) {
  let query = "";
  if (params?.idClasificadorComunGrupo) {
    query = `SELECT llave 
  FROM public."${table}" 
  WHERE id_clasificador_comun_grupo = ${params?.idClasificadorComunGrupo}`;
  } else {
    query = null;
  }
  // Posibles Resultados:
  // --1 = id_bolsa
  // --2 = id_calificacion_seg
  // --3 = id_calificacion_cuota
  // --4 = id_calificacion
  // --5 = id_calificacion_rvariable
  // --6 = id_calificacion_rdeuda
  // --7 = id_calificadora_rnacional
  // --8 = id_calificadora_nrsro
  // --10 = id_tipo_mercado
  // --11 = id_g_tipo_instrumento
  // --12 = id_tipo_renta
  // --13 = id_fondo_inv
  // --14 = id_tipo_lugar_negociacion
  // --15 = id_tipo_cuenta
  // --16 = id_tipo_tasa
  // --17 = id_periodo_envio
  // --18 = id_tendencia_mercado
  // --19 = id_custodia
  // --20 = id_prepago
  // --21 = id_subordinado
  // --22 = id_tipo_valuacion
  // --23 = id_tipo_interes
  // --24 = id_periodo_vencimiento
  // --25 = id_tipo_amortizacion
  // --26 = id_tipo_entidad
  // --27 = id_sector_economico_grupo
  // --28 = id_tipo_accion
  // --29 = id_tipo_rpt

  console.log("QUERY LLAVE", query);

  return query;
}

function EscogerUtil(table, params) {
  let query = "";
  if (params?.clasificador) {
    let indexId = table.indexOf("_", 5);
    let idTable = "id" + table.substring(indexId, table.length);
    console.log("ID", {
      idTable,
      idClasificadorComunGrupo: params.idClasificadorComunGrupo,
      valueId: params.valueId,
    });

    query = `SELECT ${idTable} AS ${params.valueId} 
    FROM public."APS_param_clasificador_comun" 
    WHERE ${idTable}_grupo = ${params.idClasificadorComunGrupo}`;

    if (params?.status) {
      params.status === "activo" && (query = query + " AND activo = true;");
      params.status === "status" && (query = query + " AND status = true;");
    }
  } else {
    params.body && (query = query + `SELECT * FROM public."${table}" `);

    if (params?.status) {
      params.status === "activo" && (query = query + " WHERE activo = true");
      params.status === "status" && (query = query + " WHERE status = true");
    }

    query &&
      map(params.body, (item, index) => {
        index = ponerComillasACamposConMayuscula(index);
        if (item !== null && typeof item !== "undefined") {
          if (typeof item === "string") {
            if (index === "password") {
              index &&
                (query =
                  query + ` AND ${index} = crypt('${item}',gen_salt('bf'))`);
            } else if (index === "fecha_activo") {
              index &&
                (query =
                  query +
                  ` AND ${index} = '${moment(item).format(
                    "YYYY-MM-DD HH:mm:ss.SSS"
                  )}'`);
            } else {
              index && (query = query + ` AND ${index} = '${item}'`);
            }
          } else if (typeof item === "number") {
            index && (query = query + ` AND ${index} = ${item}`);
          } else if (typeof item === "boolean") {
            index && (query = query + ` AND ${index} = ${item}`);
          }
        }
      });
    if (!query.includes("WHERE")) {
      let queryAux = query.split("");
      queryAux.splice(query.indexOf(" AND"), 0, "WHERE");
      queryAux.splice(query.indexOf("AND"), 4);
      queryAux.join("");
      query = queryAux.join("");
    }

    params.body && (query = query = query + ";");
  }

  console.log(query);

  return query;
}

function InsertarUtil(table, params) {
  let query = "";
  params.body && (query = query + `INSERT INTO public."${table}"`);
  query && (query = query + " (");

  let idAux = ValidarIDActualizarUtil(table, params.body, params?.newID);

  query &&
    map(params.body, (item, index) => {
      if (idAux.idKey !== index) {
        index = ponerComillasACamposConMayuscula(index);
        index && (query = query + `${index}, `);
      }
    });

  query && (query = query.substring(0, query.length - 2));
  query && (query = query + ") VALUES (");

  map(params.body, (item, index) => {
    if (idAux.idKey !== index) {
      if (typeof item === "string") {
        if (index === "password") {
          index && (query = query + `crypt('${item}', gen_salt('bf')), `);
        } else if (
          index === "fecha_activo" ||
          index === "fecha_emision" ||
          index === "fecha_vencimiento" ||
          index === "vencimiento_1er_cupon"
        ) {
          index &&
            (query =
              query + `'${moment(item).format("YYYY-MM-DD HH:mm:ss.SSS")}', `);
        } else {
          index && (query = query + `'${item}', `);
        }
      } else if (typeof item === "number") {
        index && (query = query + `${item}, `);
      } else if (typeof item === "boolean") {
        index && (query = query + `${item}, `);
      } else if (typeof item === "object" && item === null) {
        index && (query = query + `${item}, `);
      } else {
        if (index === "fecha_activo") {
          index &&
            (query =
              query + `'${moment(item).format("YYYY-MM-DD HH:mm:ss.SSS")}', `);
        } else {
          index && (query = query + `'${item}', `);
        }
      }
    }
  });

  query && (query = query.substring(0, query.length - 2));

  query && (query = query + ")");

  params.body && (query = query = query + ";");
  console.log(query);
  return query;
}

function ActualizarUtil(table, params) {
  let query = "";

  delete params.body[params.idKey];

  params.body && (query = query + `UPDATE public."${table}" SET`);
  query &&
    map(params.body, (item, index) => {
      index = ponerComillasACamposConMayuscula(index);
      if (typeof item === "string") {
        if (index === "password") {
          index &&
            (query = query + ` ${index} = crypt('${item}',gen_salt('bf')),`);
        } else if (index === "fecha_activo") {
          index &&
            (query =
              query +
              ` ${index} = '${moment(item).format(
                "YYYY-MM-DD HH:mm:ss.SSS"
              )}',`);
        } else {
          index && (query = query + ` ${index} = '${item}',`);
        }
      } else if (typeof item === "number") {
        index && (query = query + ` ${index} = ${item},`);
      } else if (typeof item === "boolean") {
        index && (query = query + ` ${index} = ${item},`);
      } else if (typeof item === "object" && item === null) {
        index && (query = query + ` ${index} = ${item},`);
      } else {
        if (index === "fecha_activo") {
          index &&
            (query =
              query +
              ` ${index} = '${moment(item).format(
                "YYYY-MM-DD HH:mm:ss.SSS"
              )}',`);
        } else {
          index && (query = query + ` ${index} = '${item}',`);
        }
      }
    });

  query = query.substring(0, query.length - 1);

  params.idKey &&
    (query = query + ` WHERE ${params.idKey} = '${params.idValue}';`);

  console.log(query);

  return query;
}

function DeshabilitarUtil(table, params) {
  let query = "";

  delete params.body[params.idKey];

  params.body && (query = query + `UPDATE public."${table}" SET`);
  query &&
    map(params.body, (item, index) => {
      index = ponerComillasACamposConMayuscula(index);
      if (typeof item === "string") {
        if (index === "password") {
          index &&
            (query = query + ` ${index} = crypt('${item}',gen_salt('bf')),`);
        } else if (index === "fecha_activo") {
          index &&
            (query =
              query +
              ` ${index} = '${moment(item).format(
                "YYYY-MM-DD HH:mm:ss.SSS"
              )}',`);
        } else {
          index && (query = query + ` ${index} = '${item}',`);
        }
      } else if (typeof item === "number") {
        index && (query = query + ` ${index} = ${item},`);
      } else if (typeof item === "boolean") {
        index && (query = query + ` ${index} = ${item},`);
      } else if (typeof item === "object" && item === null) {
        index && (query = query + ` ${index} = ${item},`);
      } else {
        if (index === "fecha_activo") {
          index &&
            (query =
              query +
              ` ${index} = '${moment(item).format(
                "YYYY-MM-DD HH:mm:ss.SSS"
              )}',`);
        } else {
          index && (query = query + ` ${index} = '${item}',`);
        }
      }
    });

  query = query.substring(0, query.length - 1);

  params.idKey &&
    (query = query + ` WHERE ${params.idKey} = '${params.idValue}';`);

  console.log(query);

  return query;
}

function ValidarIDActualizarUtil(nameTable, body, newID) {
  let indexId = nameTable.indexOf("_", 5);
  let idKey = newID
    ? newID
    : "id" + nameTable.substring(indexId, nameTable.length);
  let idOk = false;
  let idValue = null;

  map(body, (item, index) => {
    if (idKey === index && item) {
      idOk = true;
      idValue = item;
      return;
    }
  });

  return {
    idOk,
    idKey,
    idValue,
  };
}

function ponerComillasACamposConMayuscula(index) {
  let auxArreglarMayuscula = false;
  let comilla = '"';
  map(index, (itemStr, indexStr) => {
    if (
      index.charAt(indexStr) === index.charAt(indexStr).toUpperCase() &&
      itemStr !== "_" &&
      auxArreglarMayuscula === false
    ) {
      console.log("ITEMSTR", itemStr);
      console.log("INDEXSTR", indexStr);
      index = comilla + index + comilla;
      index = index.slice(0, index.length);
      auxArreglarMayuscula = true;
      return;
    }
  });
  return index;
}

module.exports = {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  EscogerLlaveClasificadorUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ObtenerRolUtil,
  ObtenerMenuAngUtil,
  FormatearObtenerMenuAngUtil,
};

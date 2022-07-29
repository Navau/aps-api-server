const multer = require("multer");
const path = require("path");
const { map } = require("lodash");
const fs = require("fs");
const pool = require("../database");
const moment = require("moment");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  EscogerInternoUtil,
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

async function obtenerInformacionDeArchivo(nameFile) {
  console.log("nameFile", nameFile);
  const obtenerInformacionDeArchivoPromise = new Promise(
    async (resolve, reject) => {
      let codeCurrentFile = null;
      let nameTable = null;
      let paramsInstrumento = null;
      let paramsCodOperacion = null;
      let paramsAccionesMO = null;
      let paramsCodMercado = null;
      let paramsCalfRiesgo = null;
      let paramsCodCustodia = null;
      let headers = null;
      if (nameFile.includes("K.")) {
        console.log("ARCHIVO CORRECTO : K", nameFile);
        codeCurrentFile = "k";
        nameTable = "APS_aud_carga_archivos_bolsa";
        headers = await formatoArchivo("k");
      } else if (nameFile.includes("L.")) {
      } else if (nameFile.includes("N.")) {
      } else if (nameFile.includes("P.")) {
      } else if (nameFile.includes(".413")) {
        console.log("ARCHIVO CORRECTO : 413", nameFile);
        codeCurrentFile = "413";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
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
      } else if (nameFile.includes(".411")) {
        console.log("ARCHIVO CORRECTO : 411", nameFile);
        codeCurrentFile = "411";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
        paramsCodOperacion = {
          table: "APS_param_tipo_operacion",
          params: {
            select: ["codigo_aps"],
            // where: [
            //   {
            //     key: "tipo",
            //     value: "V",
            //   },
            // ],
          },
        };
        paramsCodMercado = {
          table: "APS_param_lugar_negociacion",
          params: {
            select: ["codigo_aps"],
            where: [
              {
                key: "id_tipo_lugar_negociacion",
                value: 58,
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
                value: 6,
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
      } else if (nameFile.includes(".441")) {
        console.log("ARCHIVO CORRECTO : 441", nameFile);
        codeCurrentFile = "441";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".443")) {
        console.log("ARCHIVO CORRECTO : 443", nameFile);
        codeCurrentFile = "443";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".44C")) {
        console.log("ARCHIVO CORRECTO : 44C", nameFile);
        codeCurrentFile = "44C";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".451")) {
        console.log("ARCHIVO CORRECTO : 451", nameFile);
        codeCurrentFile = "451";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".481")) {
        console.log("ARCHIVO CORRECTO : 481", nameFile);
        codeCurrentFile = "481";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".482")) {
        console.log("ARCHIVO CORRECTO : 482", nameFile);
        codeCurrentFile = "482";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
      } else {
        reject();
      }
      console.log(codeCurrentFile);
      console.log(headers);
      resolve({
        codeCurrentFile,
        nameTable,
        headers,
        paramsInstrumento,
        paramsCodOperacion,
        paramsAccionesMO,
        paramsCodMercado,
        paramsCalfRiesgo,
        paramsCodCustodia,
      });
    }
  );
  return obtenerInformacionDeArchivoPromise;
}

async function obtenerCabeceras(table) {
  const obtenerColumnas = new Promise(async (resolve, reject) => {
    let query = ObtenerColumnasDeTablaUtil(table);
    await pool
      .query(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });

  return obtenerColumnas;
}

async function formatoArchivo(type) {
  console.log("TYPE", type);
  let headers = null;
  if (type === "k") {
    return {
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
  } else if (type === "413") {
    await obtenerCabeceras("APS_seguro_archivo_413")
      .then((response) => {
        let resultAux = [];
        map(response.rows, (item, index) => {
          resultAux.push(item.column_name);
        });
        headers = resultAux;
      })
      .catch((err) => {
        headers = { err };
      });
    return headers;
  } else if (type === "411") {
    await obtenerCabeceras("APS_seguro_archivo_411")
      .then(async (response) => {
        let resultAux = [];
        map(response.rows, (item, index) => {
          resultAux.push(item.column_name);
        });
        headers = resultAux;
      })
      .catch((err) => {
        headers = { err };
      });
    return headers;
  } else if (type === "441") {
    await obtenerCabeceras("APS_seguro_archivo_441")
      .then(async (response) => {
        let resultAux = [];
        map(response.rows, (item, index) => {
          resultAux.push(item.column_name);
        });
        headers = resultAux;
      })
      .catch((err) => {
        headers = { err };
      });
    return headers;
  } else if (type === "44C") {
    await obtenerCabeceras("APS_seguro_archivo_44C")
      .then((response) => {
        let resultAux = [];
        map(response.rows, (item, index) => {
          resultAux.push(item.column_name);
        });
        headers = resultAux;
      })
      .catch((err) => {
        headers = { err };
      });
    return headers;
  } else if (type === "451") {
    await obtenerCabeceras("APS_seguro_archivo_451")
      .then((response) => {
        let resultAux = [];
        map(response.rows, (item, index) => {
          resultAux.push(item.column_name);
        });
        headers = resultAux;
      })
      .catch((err) => {
        headers = { err };
      });
    return headers;
  } else if (type === "481") {
    await obtenerCabeceras("APS_seguro_archivo_481")
      .then((response) => {
        let resultAux = [];
        map(response.rows, (item, index) => {
          resultAux.push(item.column_name);
        });
        headers = resultAux;
      })
      .catch((err) => {
        headers = { err };
      });
    return headers;
  } else if (type === "482") {
    await obtenerCabeceras("APS_seguro_archivo_482")
      .then((response) => {
        let resultAux = [];
        map(response.rows, (item, index) => {
          resultAux.push(item.column_name);
        });
        headers = resultAux;
      })
      .catch((err) => {
        headers = { err };
      });
    return headers;
  } else {
    return null;
  }
}

async function obtenerValidaciones(typeFile) {
  let result = null;
  if (typeFile === "k") {
    result = [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
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
        pattern: /^[A-Za-z]{3,3}$/,
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
        pattern: /^(\d{1,8})(\.\d{4,4}){0,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto",
        pattern: /^(\d{1,16})(\.\d{2,2}){0,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto_minimo",
        pattern: /^(\d{1,16})(\.\d{2,2}){0,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tipo_marcacion",
        pattern: /^[A-Za-z]{2,2}$/,
        positveNegative: true,
        required: true,
        function: "marcacion",
      },
    ];
  } else if (typeFile === "413") {
    result = [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_operacion",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: false,
        required: true,
        function: "codigoOperacion",
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,5}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "numero_acciones",
        pattern: /^[1-9][0-9]*$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(\d{1,10})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,10})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "accionesMonedaOriginal",
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,10})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_mercado",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "codigoMercado",
      },
      {
        columnName: "precio_unitario",
        pattern: /^(\d{1,10})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z0-9]{1,3}$/,
        positveNegative: true,
        required: true,
        function: "calificacionRiesgo",
      },
      {
        columnName: "codigo_custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "codigoCustodia",
      },
    ];
  } else if (typeFile === "411") {
    result = [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_operacion",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "codigoOperacion",
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad_valores",
        pattern: /^[1-9][0-9]*$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(\d{1,12})(\.\d{8,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa_relevante_valoracion",
        pattern: /^(\d{1,12})(\.\d{8,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_negociacion_mo",
        pattern: /^(\d{1,10})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,10})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,10})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_mercado",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "codigoMercado",
      },
      {
        columnName: "precio_unitario",
        pattern: /^(\d{1,10})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z0-9]{1,3}$/,
        positveNegative: true,
        required: true,
        function: "calificacionRiesgo",
      },
      {
        columnName: "codigo_custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "codigoCustodia",
      },
    ];
  } else if (typeFile === "441") {
    result = [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "precio_nominal_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa_nominal_emision",
        pattern: /^(\d{1,2})(\.\d{8,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_emision_valor",
        pattern:
          /^([0-9]\d{4}|\d[0-9]\d{3}|\d{2}[0-9]\d{2}|\d{3}[0-9]\d|\d{4}[0-9])$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "periodo_pago_cupones",
        pattern:
          /^([D,M,A]\d{4}|\d[0-9]\d{3}|\d{2}[0-9]\d{2}|\d{3}[0-9]\d|\d{4}[0-9])$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad_pagos",
        pattern: /^[0-9]{3,3}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa_interes_variable",
        pattern: /^(\d{1,2})(\.\d{8,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ];
  } else if (typeFile === "443") {
    result = [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad_acciones",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_unitario_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ];
  } else if (typeFile === "44C") {
    result = [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "nro_pago",
        pattern: /^\d{3,3}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "pago_intereses",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "amortizacion_capital",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "flujo_total",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "saldo_amortizar",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ];
  } else if (typeFile === "451") {
    result = [
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoCuenta",
      },
      {
        columnName: "sigla_entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "siglaEntidadFinanciera",
      },
      {
        columnName: "nro_cuenta_entidad",
        pattern: /^[A-Za-z0-9]{5,20}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "moneda",
      },
      {
        columnName: "saldo_mo_original",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "total_saldo_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ];
  } else if (typeFile === "481") {
    result = [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z]{10,10}$/,
        positveNegative: true,
        required: true,
        function: "codigoValoracion",
      },
      {
        columnName: "tasa_relevante_operacion",
        pattern: /^([0-9]{0,2})(\.[0-9]{0,8})?$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_valor",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_economico",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "precioTotal",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "codigoMoneda",
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "calificacionRiesgoGrande",
      },
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
    ];
  } else if (typeFile === "482") {
    result = [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z]{10,10}$/,
        positveNegative: true,
        required: true,
        function: "codigoValoracion",
      },
      {
        columnName: "tasa_relevante_operacion",
        pattern: /^([0-9]{0,2})(\.[0-9]{0,8})?$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_valor",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_economico",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "precioTotal",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "codigoMoneda",
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "calificacionRiesgoGrande",
      },
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
    ];
  }

  return result;
}

async function formatearDatosEInsertarCabeceras(headers, dataSplit) {
  let arrayDataObject = [];
  let errors = [];
  headers.splice(0, 1); // ELIMINAR ID DE TABLA

  map(["id_carga_archivos"], (item, index) => {
    let myIndex = headers.indexOf(item);
    if (myIndex !== -1) {
      headers.splice(myIndex, 1);
    }
  }); // ELIMINAR ID CARGA ARCHIVOS

  map(dataSplit, (item, index) => {
    let rowSplit = item.split(",");
    if (item.length === 0) {
      return;
    }
    if (rowSplit.length > headers.length || rowSplit.length < headers.length) {
      errors.push({
        msg: `El archivo contiene ${rowSplit.length} columnas y el formato esperado es que tenga ${headers.length} columnas`,
      });
      return;
    }
    let resultObject = {};
    let counterAux = 0;
    map(headers, (item2, index2) => {
      resultObject = {
        ...resultObject,
        [item2]: rowSplit[counterAux]?.trim().replace(/['"]+/g, ""), //QUITAR ESPACIOS Y QUITAR COMILLAS DOBLES
      };
      counterAux++;
    });
    arrayDataObject.push(resultObject);
  });

  if (errors.length >= 1) {
    return {
      err: true,
      errors,
    };
  }
  return arrayDataObject;
}

async function clasificadorComun(table, params) {
  let query = ListarUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function tipoInstrumento(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function tipoMarcacion(params) {
  let resultFinal = null;
  if (
    params.montoNegociado !== 0 &&
    params.montoNegociado >= params.montoMinimo
  ) {
    resultFinal = "AC, NA";
  }
  if (
    params.montoNegociado !== 0 &&
    params.montoNegociado < params.montoMinimo
  ) {
    resultFinal = "NM";
  }

  return resultFinal;
}

async function accionesMonedaOriginal(params) {}

async function codigoOperacion(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function codigoMercado(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function calificacionRiesgo(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function codigoCustodia(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function tipoCuenta(table, params) {}

module.exports = {
  formatoArchivo,
  obtenerValidaciones,
  clasificadorComun,
  tipoMarcacion,
  tipoInstrumento,
  codigoOperacion,
  codigoMercado,
  calificacionRiesgo,
  codigoCustodia,
  accionesMonedaOriginal,
  formatearDatosEInsertarCabeceras,
  obtenerInformacionDeArchivo,
};

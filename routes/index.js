const express = require("express");

// Rutas de Seguridad (Se llama Seguridad por la division en la base de datos)
const accionRoute = require("./seguridad/accion.seguridad.route");
const criticoRoute = require("./seguridad/critico.seguridad.route");
const institucionRoutes = require("./seguridad/institucion.seguridad.route");
const logRoute = require("./seguridad/log.seguridad.route");
const logDetRoute = require("./seguridad/logDet.seguridad.route");
const moduloRoute = require("./seguridad/modulo.seguridad.route");
const permisoRoutes = require("./seguridad/permiso.seguridad.route");
const rolRoutes = require("./seguridad/rol.seguridad.route");
const tablaRoutes = require("./seguridad/tabla.seguridad.route");
const tablaAccionRoutes = require("./seguridad/tablaAccion.seguridad.route");
const usuarioRoutes = require("./seguridad/usuario.seguridad.route");
const usuarioRolRoutes = require("./seguridad/usuarioRol.seguridad.route");

// Rutas Operativas (Se llama Operativas por la division en la base de datos)
const archivoKRoute = require("./operativo/archivoK.operativo.route");
const archivoLRoute = require("./operativo/archivoL.operativo.route");
const archivoNRoute = require("./operativo/archivoN.operativo.route");
const archivoPRoute = require("./operativo/archivoP.operativo.route");
const cargaArchivosBolsaRoute = require("./operativo/cargaArchivoBolsa.operativo.route");
const emisorPatrimonioRoute = require("./operativo/emisorPatrimonio.operativo.route");
const otrosActivosRoute = require("./operativo/otrosActivos.operativo.route");
const otrosActivosCuponRoute = require("./operativo/otrosActivosCupon.operativo.route");
const rentaFijaRoute = require("./operativo/rentaFija.operativo.route");
const rentaFijaCuponRoute = require("./operativo/rentaFijaCupon.operativo.route");
const rentaVariableRoute = require("./operativo/rentaVariable.operativo.route");
const tipoCambioRoute = require("./operativo/tipoCambio.operativo.route");

// Rutas de Parametro (Se llama Parametro por la division en la base de datos)
const actividadEconomicaRoute = require("./parametro/actividadEconomica.parametro.route");
const carteraSIPRoute = require("./parametro/carteraSIP.parametro.route");
const carteraSIPAgrupacionRoute = require("./parametro/carteraSIPAgrupacion.parametro.route");
const clasificadorComunRoute = require("./parametro/clasificadorComun.parametro.route");
const clasificadorComunGrupoRoute = require("./parametro/clasificadorComunGrupo.parametro.route");
const composicionSerieRoute = require("./parametro/composicionSerie.parametro.route");
const emisorRoute = require("./parametro/emisor.parametro.route");
const emisorVinculadoRoute = require("./parametro/emisorVinculado.parametro.route");
const feriadoRoute = require("./parametro/feriado.parametro.route");
const lugarNegociacionRoute = require("./parametro/lugarNegociacion.parametro.route");
const monedaRoute = require("./parametro/moneda.parametro.route");
const nivelPUCRoute = require("./parametro/nivelPUC.parametro.route");
const planCuentasRoute = require("./parametro/planCuentas.parametro.route");
const paisRoute = require("./parametro/pais.parametro.route");
const rangoPlazoRoute = require("./parametro/rangoPlazo.parametro.route");
const sectorEconomicoRoute = require("./parametro/sectorEconomico.parametro.route");
const tipoInstrumentoRoute = require("./parametro/tipoInstrumento.parametro.route");
const tipoOperacionRoute = require("./parametro/tipoOperacion.parametro.route");

// Rutas de Acceso (Se llama Acceso por la autenticacion)
const accessRoutes = require("./acceso/acceso.route");

//Rutas de Clasificador (Se llama Clasificador por la Base de datos)
const cBolsaValoresRoute = require("./clasificador/cBolsaValores.clasificador.route");

function routerApi(app) {
  const router = express.Router();
  app.use("/api", router);

  router.use("/Acceso", accessRoutes);
  // router.use('/AccesoExterno', )
  router.use("/Accion", accionRoute);
  router.use("/ActividadEconomica", actividadEconomicaRoute);
  router.use("/ArchivoK", archivoKRoute);
  router.use("/ArchivoL", archivoLRoute);
  router.use("/ArchivoN", archivoNRoute);
  router.use("/ArchivoP", archivoPRoute);
  router.use("/CargaArchivosBolsa", cargaArchivosBolsaRoute);
  router.use("/CarteraSIP", carteraSIPRoute);
  router.use("/CarteraSIPAgrupacion", carteraSIPAgrupacionRoute);
  router.use("/ClasificadorComun", clasificadorComunRoute);
  router.use("/ClasificadorComunGrupo", clasificadorComunGrupoRoute);
  router.use("/ComposicionSerie", composicionSerieRoute);
  router.use("/Critico", criticoRoute);
  router.use("/Emisor", emisorRoute);
  router.use("/EmisorPatrimonio", emisorPatrimonioRoute);
  router.use("/EmisorVinculado", emisorVinculadoRoute);
  router.use("/Feriado", feriadoRoute);
  router.use("/Institucion", institucionRoutes);
  router.use("/Log", logRoute);
  router.use("/LogDet", logDetRoute);
  router.use("/LugarNegociacion", lugarNegociacionRoute);
  router.use("/Modulo", moduloRoute);
  router.use("/Moneda", monedaRoute);
  router.use("/NivelPUC", nivelPUCRoute); //VERIFICAR
  router.use("/PlanCuentas", planCuentasRoute); //VERIFICAR
  router.use("/OtrosActivos", otrosActivosRoute);
  router.use("/OtrosActivosCupon", otrosActivosCuponRoute);
  router.use("/Pais", paisRoute);
  router.use("/Permiso", permisoRoutes);
  // router.use('/PersonaExt', )
  // router.use('/Prueba', )
  router.use("/RangoPlazo", rangoPlazoRoute);
  router.use("/RentaFija", rentaFijaRoute);
  router.use("/RentaFijaCupon", rentaFijaCuponRoute);
  router.use("/RentaVariable", rentaVariableRoute);
  router.use("/Rol", rolRoutes);
  router.use("/SectorEconomico", sectorEconomicoRoute);
  router.use("/Tabla", tablaRoutes);
  router.use("/TablaAccion", tablaAccionRoutes);
  router.use("/TipoCambio", tipoCambioRoute);
  router.use("/TipoInstrumento", tipoInstrumentoRoute);
  router.use("/TipoOperacion", tipoOperacionRoute);
  router.use("/Usuario", usuarioRoutes);
  router.use("/UsuarioRol", usuarioRolRoutes);
  // router.use('/WeatherForecast', )

  //Clasificador
  router.use("/cBolsaValores", cBolsaValoresRoute);
}

module.exports = routerApi;

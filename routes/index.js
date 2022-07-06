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
const gruposPUCRoute = require("./parametro/gruposPUC.parametro.route");
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

const cCalificacionSegurosRoute = require("./clasificador/cCalificacionSeguros.clasificador.route.js");
const cCalificacionFondosRoute = require("./clasificador/cCalificacionFondos.clasificador.route.js");
const cCalificacionEmisorRoute = require("./clasificador/cCalificacionEmisor.clasificador.route.js");
const cCalificacionRVariableRoute = require("./clasificador/cCalificacionRVariable.clasificador.route.js");
const cCalificacionRDeudaRoute = require("./clasificador/cCalificacionRDeuda.clasificador.route.js");
const cCalificadorasRNacionalRoute = require("./clasificador/cCalificadorasRNacional.clasificador.route.js");
const cCalificadorasNRSRORoute = require("./clasificador/cCalificadorasNRSRO.clasificador.route.js");
const cCustodioRoute = require("./clasificador/cCustodio.clasificador.route.js");
const cTipoMercadoRoute = require("./clasificador/cTipoMercado.clasificador.route.js");
const cGrupoTInstrumentoRoute = require("./clasificador/cGrupoTInstrumento.clasificador.route.js");
const cTipoRentaRoute = require("./clasificador/cTipoRenta.clasificador.route.js");
const cFondosInvRoute = require("./clasificador/cFondosInv.clasificador.route.js");
const cTipoLugarNegociacionRoute = require("./clasificador/cTipoLugarNegociacion.clasificador.route.js");
const cTipoCuentaRoute = require("./clasificador/cTipoCuenta.clasificador.route.js");
const cTipoTasaRoute = require("./clasificador/cTipoTasa.clasificador.route.js");
const cPeriodoEnvioRoute = require("./clasificador/cPeriodoEnvio.clasificador.route.js");
const cTendenciaMercadoRoute = require("./clasificador/cTendenciaMercado.clasificador.route.js");
const cCodigosValorCustodiaRoute = require("./clasificador/cCodigosValorCustodia.clasificador.route.js");
const cPrepagoRoute = require("./clasificador/cPrepago.clasificador.route.js");
const cSubordinadoRoute = require("./clasificador/cSubordinado.clasificador.route.js");
const cTipoValuacionRoute = require("./clasificador/cTipoValuacion.clasificador.route.js");
const cTipoInteresRoute = require("./clasificador/cTipoInteres.clasificador.route.js");
const cPeriodoVencimientoRoute = require("./clasificador/cPeriodoVencimiento.clasificador.route.js");
const cTipoAmortizacionRoute = require("./clasificador/cTipoAmortizacion.clasificador.route.js");
const cTipoEntidadSegurosRoute = require("./clasificador/cTipoEntidadSeguros.clasificador.route.js");
const cGrupoSectorEconomicoRoute = require("./clasificador/cGrupoSectorEconomico.clasificador.route.js");
const cTipoAccionRoute = require("./clasificador/cTipoAccion.clasificador.route.js");
const cTipoReporteRoute = require("./clasificador/cTipoReporte.clasificador.route.js");

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
  router.use("/GruposPUC", gruposPUCRoute);
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
  router.use("/cCalificacionSeguros", cCalificacionSegurosRoute);
  router.use("/cCalificacionFondos", cCalificacionFondosRoute);
  router.use("/cCalificacionEmisor", cCalificacionEmisorRoute);
  router.use("/cCalificacionRVariable", cCalificacionRVariableRoute);
  router.use("/cCalificacionRDeuda", cCalificacionRDeudaRoute);
  router.use("/cCalificadorasRNacional", cCalificadorasRNacionalRoute);
  router.use("/cCalificadorasNRSRO", cCalificadorasNRSRORoute);
  router.use("/cCustodio", cCustodioRoute);
  router.use("/cTipoMercado", cTipoMercadoRoute);
  router.use("/cGrupoTInstrumento", cGrupoTInstrumentoRoute);
  router.use("/cTipoRenta", cTipoRentaRoute);
  router.use("/cFondosInv", cFondosInvRoute);
  router.use("/cTipoLugarNegociacion", cTipoLugarNegociacionRoute);
  router.use("/cTipoCuenta", cTipoCuentaRoute);
  router.use("/cTipoTasa", cTipoTasaRoute);
  router.use("/cPeriodoEnvio", cPeriodoEnvioRoute);
  router.use("/cTendenciaMercado", cTendenciaMercadoRoute);
  router.use("/cCodigosValorCustodia", cCodigosValorCustodiaRoute);
  router.use("/cPrepago", cPrepagoRoute);
  router.use("/cSubordinado", cSubordinadoRoute);
  router.use("/cTipoValuacion", cTipoValuacionRoute);
  router.use("/cTipoInteres", cTipoInteresRoute);
  router.use("/cPeriodoVencimiento", cPeriodoVencimientoRoute);
  router.use("/cTipoAmortizacion", cTipoAmortizacionRoute);
  router.use("/cTipoEntidadSeguros", cTipoEntidadSegurosRoute);
  router.use("/cGrupoSectorEconomico", cGrupoSectorEconomicoRoute);
  router.use("/cTipoAccion", cTipoAccionRoute);
  router.use("/cTipoReporte", cTipoReporteRoute);
}

module.exports = routerApi;

function formatoArchivo(type) {
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
  } else {
    return null;
  }
}

module.exports = {
  formatoArchivo,
};

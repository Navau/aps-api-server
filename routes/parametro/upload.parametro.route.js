const express = require("express");
const controller = require("../../controllers/parametro/upload.parametro.controller");
const md_auth = require("../../middleware/token.middleware");
const md_files = require("../../middleware/files.middleware");

const api = express.Router();

api.post(
  "/CargarArchivo",
  [md_auth.AsegurarAutenticacionConToken],
  (req, res) => {
    md_files.VerificarArchivo(controller.CargarArchivo(req, res));
  }
);
api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
api.post("/Buscar", [md_auth.AsegurarAutenticacionConToken], controller.Buscar);
api.post(
  "/Escoger",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Escoger
);
api.post(
  "/Insertar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Insertar
);
api.post(
  "/Actualizar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Actualizar
);
api.post(
  "/Deshabilitar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Deshabilitar
);

module.exports = api;

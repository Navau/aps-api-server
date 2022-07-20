const express = require("express");
const controller = require("../../controllers/clasificador/cPrepago.clasificador.controller");
const md_auth = require("../../middleware/token.middleware");

const api = express.Router();

api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
api.post(
  "/Escoger",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Escoger
);

module.exports = api;

const express = require("express");
const controller = require("../../controllers/acceso/acceso.controller");

const api = express.Router();

api.post("/Login", controller.Login);
api.post("/TokenConRol", controller.TokenConRol);
api.post("/refresh-access-token", controller.refreshAccessToken);

module.exports = api;

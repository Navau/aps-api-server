const jwt = require("../../services/jwt.services");
const moment = require("moment");
const pool = require("../../database");

function willExpiredToken(token) {
  const { exp } = jwt.decodedToken(token);

  const currentDate = moment().unix();

  if (currentDate > exp) {
    //VERIFICACION SI CADUCO EL TOKEN TRUE = CADUCADO, FALSE = NO CADUCADO
    return true;
  }
  return false;
}

function refreshAccessToken(req, res) {
  //FUNCTION QUE SE ENCARGA DE REFRESCAR EL ACCESS TOKEN
  const { refreshToken } = req.body;

  const isTokenExpired = willExpiredToken(refreshToken); //VERIFICAMOS EL REFRESH ACCESS TOKEN

  if (isTokenExpired) {
    res.status(404).send({
      resultado: 0,
      datos: null,
      mensaje: "El Refresh Token ha expirado.",
    });
  } else {
    const { id_usuario } = jwt.decodedToken(refreshToken);

    pool.query(
      `SELECT * 
    FROM public."APS_seg_usuario" 
    WHERE status = true AND id_usuario = ${id_usuario}`,
      (err, result) => {
        if (err) {
          res.status(500).send({
            resultado: 0,
            datos: null,
            mensaje: "Error del Servidor",
            err,
          });
        } else {
          if (!userStored) {
            res.status(404).send({
              resultado: 0,
              datos: null,
              mensaje: "Usuario no encontrado.",
            });
          } else {
            res.status(200).send({
              resultado: 1,
              datos: {
                accessToken: jwt.createAccessToken(result),
                refreshToken: refreshToken,
              },
              mensaje: "",
            });
          }
        }
      }
    );
  }
}

function Login(req, res) {
  const body = req.body;
  const user = body.usuario.toLowerCase();
  const password = body.password;

  let query = `SELECT * 
  FROM public."APS_seg_usuario" 
  WHERE usuario = '${user}' 
  AND password is NOT NULL 
  AND password = crypt('${password}', password);`;

  console.log(query);

  pool.query(query, (err, result) => {
    if (err) {
      res.status(500).send({
        resultado: 0,
        datos: null,
        mensaje: "Error del servidor.",
        err,
      });
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        res.status(404).send({
          resultado: 0,
          datos: null,
          mensaje: "Usuario no encontrado.",
        });
      } else {
        let queryRol = `SELECT id_rol 
        FROM public."APS_seg_usuario_rol" 
        WHERE id_usuario = ${result.rows[0].id_usuario} and status = true;`;

        console.log(queryRol);

        pool.query(queryRol, (err, result2) => {
          if (err) {
            res.status(500).send({
              resultado: 0,
              datos: null,
              mensaje: "Error del servidor.",
              err,
            });
          } else {
            if (!result2.rowCount || result2.rowCount < 1) {
              res.status(404).send({
                resultado: 0,
                datos: null,
                mensaje:
                  "Este usuario no cuenta con un Rol, favor asignar uno.",
              });
            } else {
              let resultAux = {
                id_usuario: result.rows[0].id_usuario,
                id_rol: result2.rows[0].id_rol,
              };
              if (result2.rowCount >= 2) {
                res.status(200).send({
                  resultado: 1,
                  datos: jwt.createAccessTokenWithRol(resultAux),
                  mensaje: "Usuario correcto. (Mas de 1 Rol)",
                  result2: result2.rows,
                  result: result.rows,
                });
              } else if (result2.rowCount === 1) {
                res.status(200).send({
                  resultado: 1,
                  datos: jwt.createAccessTokenWithRol(resultAux),
                  mensaje: "Usuario correcto. (Solo 1 Rol)",
                  result2: result2.rows,
                  result: result.rows,
                });
              } else {
                res.status(400).send({
                  resultado: 0,
                  datos: null,
                  mensaje: "Hubo un error al crear el token de autenticación.",
                });
              }
            }
          }
        });
      }
    }
  });
}

function TokenConRol(req, res) {
  const body = req.body;
  const { id_usuario, id_rol } = body;

  if (!id_usuario || !id_rol) {
    res.status(404).send({
      resultado: 0,
      datos: null,
      mensaje: "No se recibió la información suficiente.",
    });
  } else {
    let user = {
      id_usuario,
      id_rol,
    };
    res.status(200).send({
      resultado: 1,
      datos: jwt.createAccessTokenWithRol(user),
      mensaje: "Token con Rol creado correctamente.",
    });
  }
}

module.exports = {
  refreshAccessToken,
  Login,
  TokenConRol,
};

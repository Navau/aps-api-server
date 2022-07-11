const multer = require("multer");

exports.VerificarArchivo = () => {
  const storage = multer.diskStorage({
    destination: "uploads/",
    // filename: (req, res, files, cb) => {
    //   //   req.myUpload = { file, cb };
    //   //   cb(null, files.originalname);
    // },
  });

  const upload = multer({
    storage: storage,
  }).array("archivos", 1000);
  console.log("UPLOAD", upload);

  return upload;
};

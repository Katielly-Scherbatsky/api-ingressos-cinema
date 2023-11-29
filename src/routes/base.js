const express = require("express");
const router = express.Router();

// Configuração de rotas
// Rota principal
router.get("/", function (request, response) {
  return response.send("API Funcionando...");
});

router.get("/Autor", function (request, response) {
  return response.send("Autor: Katielly");
});

router.get("/sobre", function (repost, response) {
  const info = {
    nome: "Katielly Bordin Santos",
    email: "katielly@gmail.com",
    telefone: "(69) 99999-9999",
  };
  return response.json(info);
});

// Exportação da constante router código padrão
module.exports = router;

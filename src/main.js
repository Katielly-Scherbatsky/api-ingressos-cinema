const express = require("express");
const app = express();

// Importação do arquivos de configuração de rotas
const baseRouter = require("./routes/base");

app.use(express.json());

//Configuração de uso das rotas
app.use(baseRouter);

// Iniciando a aplicação na porta 3000
app.listen(3000, function () {
  console.log("API iniciada na porta: 3000");
});

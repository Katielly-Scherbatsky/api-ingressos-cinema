const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a sala correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  connection.query(
    "SELECT * FROM sala WHERE id_sala = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return res.status(500).json({
          erro: "Ocorreram erros ao tentar buscar a informação",
        });
      }

      if (resultado.length === 0) {
        return res
          .status(404)
          .json({ erro: `O código #${codigo} não foi encontrado!` });
      }

      return res.status(200).json(resultado[0]);
    }
  );
}

// Function list
function list(request, response) {
  connection.query("SELECT * FROM sala", function (err, resultado) {
    if (err) {
      return response
        .status(500)
        .json({ erro: "Ocorreram erros ao buscar os dados" });
    }
    return response.status(200).json({ dados: resultado });
  });
}

// Function create
function create(request, response) {
  const regras = {
    capacidade: "required|integer|min:20", // valor seja um número maior que 20
    nome_sala: "required|string|min:5",
    local_sala: "required|string",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const { capacidade, nome_sala, local_sala } = request.body;

  connection.query(
    "INSERT INTO sala (capacidade, nome_sala, local_sala) VALUES (?, ?, ?)",
    [capacidade, nome_sala, local_sala],
    function (err, resultado) {
      if (err) {
        return response.status(500).json({
          erro: "Ocorreram erros ao tentar salvar a informação",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.status(500).json({
          erro: "Ocorreram erros ao tentar salvar a informação",
        });
      }

      return response.status(201).json({
        capacidade,
        nome_sala,
        local_sala,
        id: resultado.insertId,
      });
    }
  );
}

// Function update
function update(request, response) {
  const codigo = request.params.codigo;

  const regras = {
    capacidade: "required|integer|min:20", // valor seja um número maior que 20
    nome_sala: "required|string|min:5",
    local_sala: "required|string",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Buscar o dado no BD
  connection.query(
    "SELECT * FROM sala WHERE id_sala = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a sala`,
        });
      }

      const { capacidade, nome_sala, local_sala } = request.body;

      // Atualizar a sala no BD
      connection.query(
        "UPDATE sala SET capacidade = ?, nome_sala = ?, local_sala = ? WHERE id_sala = ?",
        [capacidade, nome_sala, local_sala, codigo],
        function (err, resultadoUpdate) {
          if (err) {
            return response.status(500).json({
              erro: "Ocorreu um erro ao tentar atualizar a sala",
            });
          }

          if (resultadoUpdate.affectedRows === 0) {
            return response.status(500).json({
              erro: "Nenhuma sala foi atualizada",
            });
          }

          // Retorna a resposta JSON aqui
          return response.status(200).json({
            capacidade,
            nome_sala,
            local_sala,
            id: codigo,
          });
        }
      );
    }
  );
}

//function destroy
function destroy(request, response) {
  const codigo = request.params.codigo;

  connection.query(
    "DELETE FROM sala WHERE id_sala = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a sala",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Sala #${codigo} não foi encontrado`,
        });
      }

      return response.json({
        mensagem: `Sala ${codigo} foi deletado com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };

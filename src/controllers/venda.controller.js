const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a venda correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  connection.query(
    `SELECT v.id_venda, v.valor_venda, v.data_hora_venda, v.forma_pagamento, c.nome_cliente FROM venda v
      JOIN cliente c ON c.id_cliente = v.id_cliente
      WHERE v.id_venda = ?;`,
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
  connection.query(
    `SELECT v.id_venda, v.valor_venda, v.data_hora_venda, v.forma_pagamento, c.nome_cliente FROM venda v
      JOIN cliente c ON c.id_cliente = v.id_cliente;`,
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }
      return response.status(200).json({ dados: resultado });
    }
  );
}

// Function create
function create(request, response) {
  const regras = {
    valor_venda: "required|numeric|min:0.01", // valor seja um número maior que zero
    data_hora_venda: "required|date",
    forma_pagamento: "required|string",
    id_cliente: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const { valor_venda, data_hora_venda, forma_pagamento, id_cliente } =
    request.body;

  connection.query(
    "INSERT INTO venda (valor_venda, data_hora_venda, forma_pagamento, id_cliente) VALUES (?, ?, ?, ?)",
    [valor_venda, data_hora_venda, forma_pagamento, id_cliente],
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
        valor_venda,
        data_hora_venda,
        forma_pagamento,
        id_cliente,
        id: resultado.insertId,
      });
    }
  );
}

// Function update
function update(request, response) {
  const codigo = request.params.codigo;

  const regras = {
    valor_venda: "required|numeric|min:0.01",
    data_hora_venda: "required|date",
    forma_pagamento: "required|string",
    id_cliente: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Buscar o dado no BD
  connection.query(
    "SELECT * FROM venda WHERE id_venda = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a venda`,
        });
      }

      const { valor_venda, data_hora_venda, forma_pagamento, id_cliente } =
        request.body;

      connection.query(
        "UPDATE venda SET valor_venda = ?, data_hora_venda = ?, forma_pagamento = ?, id_cliente = ? WHERE id_venda = ?",
        [valor_venda, data_hora_venda, forma_pagamento, id_cliente, codigo],
        function (err, resultado) {
          if (err) {
            return response.status(500).json({
              erro: "Ocorreu um erro ao tentar atualizar a venda",
            });
          }

          if (resultado.affectedRows === 0) {
            return response.status(500).json({
              erro: "Nenhuma venda foi atualizad",
            });
          }
          return response.status(200).json({
            valor_venda,
            data_hora_venda,
            forma_pagamento,
            id_cliente,
            id: codigo,
          });
        }
      );
    }
  );
}

//function destroy
/* function destroy(request, response) {
  const codigo = request.params.codigo;

  connection.query(
    "DELETE FROM venda WHERE id_venda = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a venda",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Venda #${codigo} não foi encontrado`,
        });
      }

      return response.json({
        mensagem: `Venda ${codigo} foi deletada com sucesso`,
      });
    }
  );
}*/

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update /*destroy*/ };

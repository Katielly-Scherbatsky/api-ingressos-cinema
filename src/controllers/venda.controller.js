const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a venda correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (codigo == undefined) {
    return res.json({ erro: "Ocorreram erros ao buscar a informação" });
  }

  connection.query(
    "SELECT ven.*, cli.nome_cliente as nome_cliente FROM venda ven JOIN cliente cli ON ven.id_cliente = cli.id_cliente" +
      "WHERE ven.id_venda = ?;",
    [codigo],
    function (err, resultado) {
      if (err) {
        return res.json({
          erro: "Ocorreram erros ao tentar salvar a informação",
        });
      }

      if (resultado.length == 0) {
        return res.json({ erro: `O código #${codigo} não foi encontrado!` });
      }

      return res.json(resultado[0]);
    }
  );
}

//function list
function list(request, response) {
  connection.query(
    "SELECT ven.*, cli.nome_cliente as nome_cliente FROM venda ven JOIN cliente cli ON ven.id_cliente = cli.id_cliente" +
      "WHERE ven.id_venda = ?;",
    function (err, resultado) {
      if (err) {
        return response.json({ erro: "Ocorreram erros ao buscar os dados" });
      }
      return response.json({ dados: resultado });
    }
  );
}

//function create
function create(request, response) {
  const regras = {
    valor_venda: "required|min:5",
    data_hora_venda: "required|email",
    forma_pagamento: "required|integer",
    id_cliente: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.json(validacao.errors);
  }

  const valor_venda = request.body.valor_venda;
  const data_hora_venda = request.body.data_hora_venda;
  const forma_pagamento = request.body.forma_pagamento;
  const id_cliente = request.body.id_cliente;

  connection.query(
    "INSERT INTO venda (valor_venda, data_hora_venda, forma_pagamento, id_cliente) VALUES (?, ?, ?, ?)",
    [valor_venda, data_hora_venda, forma_pagamento, id_cliente],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreram erros ao tentar salvar a informação",
        });
      }

      if (resultado.affectedRows == 0) {
        return response.json({
          erro: `Ocorreram erros ao tentar salvar a informação`,
        });
      }

      return response.json({
        nome_cliente,
        email,
        rg,
        cpf,
        endereco,
        contato,
        id: resultado.insertId,
      });
    }
  );
}

//function update
function update(request, response) {
  const codigo = request.params.codigo;

  const regras = {
    nome_cliente: "required|min:5",
    email: "required|email",
    rg: "required|integer",
    cpf: "required|integer",
    endereco: "required",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.json(validacao.errors);
  }

  //buscar o dado no bd
  connection.query(
    "SELECT * FROM cliente WHERE id_cliente = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.json({
          erro: `não foi possivel encontrar o contato`,
        });
      }

      const nome_cliente = request.body.nome_cliente;
      const email = request.body.email;
      const rg = request.body.rg;
      const cpf = request.body.cpf;
      const endereco = request.body.endereco;
      const contato = request.body.contato;

      connection.query(
        "UPDATE cliente SET nome_cliente = ?, email = ?, rg = ?, cpf = ?, endereco = ?, contato = ? WHERE id_cliente = ?",
        [nome_cliente, email, rg, cpf, endereco, contato, codigo],
        function (err, resultado) {
          if (err) {
            return response.json({
              erro: "Ocorreu um erro ao tentar atualizar o contato",
            });
          }

          if (resultado.affectedRows === 0) {
            return response.json({
              erro: "Nenhum contato foi atualizado",
            });
          }
          return response.json({
            nome_cliente,
            email,
            rg,
            cpf,
            endereco,
            contato,
            id: resultado.insertId,
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
    "DELETE FROM cliente WHERE id_cliente = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir o contato",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Contato #${codigo} não foi encontrado`,
        });
      }

      return response.json({
        mensagem: `Contato ${codigo} foi deletado com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };

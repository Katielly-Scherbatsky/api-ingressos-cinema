const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar o ingresso correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  connection.query(
    `SELECT i.id_ingresso, i.valor_ingresso, i.data_hora_ingresso, c.nome_cliente, sa.nome_sala, sa.local_sala, f.titulo FROM ingresso i
    JOIN venda v ON v.id_venda = i.id_venda
    JOIN sessao s ON s.id_sessao = i.id_sessao
	  JOIN filme f ON f.id_filme = s.id_filme
    JOIN cliente c ON c.id_cliente = v.id_cliente
	  JOIN sala sa ON sa.id_sala = s.id_sala
    WHERE i.id_ingresso = ?;`,
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
    `SELECT i.id_ingresso, i.valor_ingresso, i.data_hora_ingresso, c.nome_cliente, sa.nome_sala, sa.local_sala, f.titulo FROM ingresso i
    JOIN venda v ON v.id_venda = i.id_venda
    JOIN sessao s ON s.id_sessao = i.id_sessao
	  JOIN filme f ON f.id_filme = s.id_filme
    JOIN cliente c ON c.id_cliente = v.id_cliente
	  JOIN sala sa ON sa.id_sala = s.id_sala;`,
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
    valor_ingresso: "required|numeric|min:0.01", // valor seja um número maior que zero
    data_hora_ingresso: "required|date",
    id_venda: "required|integer",
    id_sessao: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const { valor_ingresso, data_hora_ingresso, id_venda, id_sessao } =
    request.body;

  // Verificar se a venda com o id_venda já existe
  connection.query(
    "SELECT COUNT(*) AS totalVenda FROM venda WHERE id_venda = ?",
    [id_venda],
    function (errVerificacaoVenda, resultadoVerificacaoVenda) {
      if (errVerificacaoVenda) {
        return response.status(500).json({
          erro: "Ocorreram erros ao verificar a existência da venda",
        });
      }

      if (resultadoVerificacaoVenda[0].totalVenda > 0) {
        return response.status(400).json({
          erro: `A venda com o id_venda ${id_venda} já existe no sistema.`,
        });
      }

      // Verificar se a sessão com o id_sessao já existe
      connection.query(
        "SELECT COUNT(*) AS totalSessao FROM sessao WHERE id_sessao = ?",
        [id_sessao],
        function (errVerificacaoSessao, resultadoVerificacaoSessao) {
          if (errVerificacaoSessao) {
            return response.status(500).json({
              erro: "Ocorreram erros ao verificar a existência da sessão",
            });
          }

          if (resultadoVerificacaoSessao[0].totalSessao > 0) {
            return response.status(400).json({
              erro: `A sessão com o id_sessao ${id_sessao} já existe no sistema.`,
            });
          }

          // Se a venda e a sessão não existirem, prosseguir com a inserção
          connection.query(
            "INSERT INTO ingresso (valor_ingresso, data_hora_ingresso, id_venda, id_sessao) VALUES (?, ?, ?, ?)",
            [valor_ingresso, data_hora_ingresso, id_venda, id_sessao],
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
                valor_ingresso,
                data_hora_ingresso,
                id_venda,
                id_sessao,
                id: resultado.insertId,
              });
            }
          );
        }
      );
    }
  );
}

// Function update
function update(request, response) {
  const codigo = request.params.codigo;

  const regras = {
    valor_ingresso: "required|numeric|min:0.01", // valor seja um número maior que zero
    data_hora_ingresso: "required|date",
    id_venda: "required|integer",
    id_sessao: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Buscar o dado no BD
  connection.query(
    "SELECT * FROM ingresso WHERE id_ingresso = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar o ingresso`,
        });
      }

      const { valor_ingresso, data_hora_ingresso, id_venda, id_sessao } =
        request.body;

      connection.query(
        "UPDATE ingresso SET valor_ingresso = ?, data_hora_ingresso = ?, id_venda = ?, id_sessao = ? WHERE id_ingresso = ?",
        [valor_ingresso, data_hora_ingresso, id_venda, id_sessao, codigo],
        function (err, resultado) {
          if (err) {
            return response.status(500).json({
              erro: "Ocorreu um erro ao tentar atualizar o ingresso",
            });
          }

          if (resultado.affectedRows === 0) {
            return response.status(500).json({
              erro: "Nenhum imgresso foi atualizad",
            });
          }
          return response.status(200).json({
            valor_ingresso,
            data_hora_ingresso,
            id_venda,
            id_sessao,
            codigo,
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
    "DELETE FROM ingresso WHERE id_ingresso = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir o ingresso",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Ingresso #${codigo} não foi encontrado`,
        });
      }

      return response.json({
        mensagem: `Ingresso ${codigo} foi deletado com sucesso`,
      });
    }
  );
}*/

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update /*destroy*/ };

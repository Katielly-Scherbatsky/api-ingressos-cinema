const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a sessao correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  connection.query(
    `SELECT s.id_sessao, s.hora_inicio, s.hora_fim, s.data_sessao, s.valor_sessao, sa.nome_sala, f.titulo FROM sessao s
    JOIN sala sa ON sa.id_sala = s.id_sala
    JOIN filme f ON f.id_filme = s.id_filme
    WHERE s.id_sessao = ?;`,
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
    `SELECT s.id_sessao, s.hora_inicio, s.hora_fim, s.data_sessao, s.valor_sessao, sa.nome_sala, f.titulo FROM sessao s
    JOIN sala sa ON sa.id_sala = s.id_sala
    JOIN filme f ON f.id_filme = s.id_filme;`,
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
    hora_inicio: "required",
    hora_fim: "required",
    data_sessao: "required|date",
    valor_sessao: "required|numeric|min:0.01", // valor seja um número maior que zero,
    id_sala: "required|integer",
    id_filme: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const {
    hora_inicio,
    hora_fim,
    data_sessao,
    valor_sessao,
    id_sala,
    id_filme,
  } = request.body;

  // Verifica se a sala e o filme existem no sistema
  connection.query(
    "SELECT COUNT(*) as total FROM sala WHERE id_sala = ?",
    [id_sala],
    function (errSala, resultadoSala) {
      if (errSala) {
        return response.status(500).json({
          erro: "Ocorreram erros ao verificar a existência da sala",
        });
      }

      if (resultadoSala[0].total === 0) {
        return response.status(404).json({
          erro: "A sala especificada não existe no sistema.",
        });
      }

      connection.query(
        "SELECT COUNT(*) as total FROM filme WHERE id_filme = ?",
        [id_filme],
        function (errFilme, resultadoFilme) {
          if (errFilme) {
            return response.status(500).json({
              erro: "Ocorreram erros ao verificar a existência do filme",
            });
          }

          if (resultadoFilme[0].total === 0) {
            return response.status(404).json({
              erro: "O filme especificado não existe no sistema.",
            });
          }

          // Se a sala e o filme existirem, realiza a inserção da sessão
          connection.query(
            "INSERT INTO sessao (hora_inicio, hora_fim, data_sessao, valor_sessao, id_sala, id_filme) VALUES (?, ?, ?, ?, ?, ?)",
            [
              hora_inicio,
              hora_fim,
              data_sessao,
              valor_sessao,
              id_sala,
              id_filme,
            ],
            function (err, resultadoInsercao) {
              if (err) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao tentar salvar a informação",
                });
              }

              if (resultadoInsercao.affectedRows === 0) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao tentar salvar a informação",
                });
              }

              return response.status(201).json({
                hora_inicio,
                hora_fim,
                data_sessao,
                valor_sessao,
                id_sala,
                id_filme,
                id_sessao: resultadoInsercao.insertId,
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
    hora_inicio: "required",
    hora_fim: "required",
    data_sessao: "required|date",
    valor_sessao: "required|numeric|min:0.01", // valor seja um número maior que zero,
    id_sala: "required|integer",
    id_filme: "required|integer",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Buscar a sessão no BD
  connection.query(
    "SELECT * FROM sessao WHERE id_sessao = ?",
    [codigo],
    function (err, resultadoSessao) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados da sessão" });
      }

      if (resultadoSessao.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a sessão`,
        });
      }

      const sessaoExistente = resultadoSessao[0];
      const {
        hora_inicio,
        hora_fim,
        data_sessao,
        valor_sessao,
        id_sala,
        id_filme,
      } = request.body;

      // Verifica se a sala e o filme existem no sistema
      connection.query(
        "SELECT COUNT(*) as totalSala FROM sala WHERE id_sala = ?",
        [id_sala],
        function (errSala, resultadoSala) {
          if (errSala) {
            return response.status(500).json({
              erro: "Ocorreram erros ao verificar a existência da sala",
            });
          }

          if (resultadoSala[0].totalSala === 0) {
            return response.status(404).json({
              erro: "A sala especificada não existe no sistema.",
            });
          }

          connection.query(
            "SELECT COUNT(*) as totalFilme FROM filme WHERE id_filme = ?",
            [id_filme],
            function (errFilme, resultadoFilme) {
              if (errFilme) {
                return response.status(500).json({
                  erro: "Ocorreram erros ao verificar a existência do filme",
                });
              }

              if (resultadoFilme[0].totalFilme === 0) {
                return response.status(404).json({
                  erro: "O filme especificado não existe no sistema.",
                });
              }

              // Se a sala e o filme existirem, realiza a atualização da sessão
              connection.query(
                "UPDATE sessao SET hora_inicio = ?, hora_fim = ?, data_sessao = ?, valor_sessao = ?, id_sala = ?, id_filme = ? WHERE id_sessao = ?",
                [
                  hora_inicio,
                  hora_fim,
                  data_sessao,
                  valor_sessao,
                  id_sala,
                  id_filme,
                  codigo,
                ],
                function (errAtualizacao, resultadoAtualizacao) {
                  if (errAtualizacao) {
                    return response.status(500).json({
                      erro: "Ocorreu um erro ao tentar atualizar a sessão",
                    });
                  }

                  if (resultadoAtualizacao.affectedRows === 0) {
                    return response.status(500).json({
                      erro: "Nenhuma sessão foi atualizada",
                    });
                  }

                  return response.status(200).json({
                    hora_inicio,
                    hora_fim,
                    data_sessao,
                    valor_sessao,
                    id_sala,
                    id_filme,
                    id_sessao: codigo,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
}

//function destroy
function destroy(request, response) {
  const codigo = request.params.codigo;

  connection.query(
    "DELETE FROM sessao WHERE id_sessao = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a sessão",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Sessão #${codigo} não foi encontrada`,
        });
      }

      return response.json({
        mensagem: `Sessão ${codigo} foi deletada com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };

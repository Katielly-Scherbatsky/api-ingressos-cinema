const Validator = require("validatorjs");
const connection = require("../configs/mysql.config");

// Função que deve receber um identificador (código) e retornar a poltrona correspondente
function show(req, res) {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ erro: "Identificador não fornecido" });
  }

  connection.query(
    "SELECT * FROM poltrona WHERE id_poltrona = ?",
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

      // Mapeia o valor de status_poltrona para 'ocupado' ou 'livre'
      const poltrona = resultado[0];
      poltrona.status_poltrona =
        poltrona.status_poltrona === 1 ? "Ocupado" : "Livre";

      return res.status(200).json(poltrona);
    }
  );
}

// Function list
function list(request, response) {
  connection.query("SELECT * FROM poltrona", function (err, resultado) {
    if (err) {
      return response
        .status(500)
        .json({ erro: "Ocorreram erros ao buscar os dados" });
    }

    // Mapeia o valor de status_poltrona para 'ocupado' ou 'livre'
    const poltronas = resultado.map((poltrona) => {
      poltrona.status_poltrona =
        poltrona.status_poltrona === 1 ? "Ocupado" : "Livre";
      return poltrona;
    });

    return response.status(200).json({ dados: poltronas });
  });
}

// Function create
function create(request, response) {
  const regras = {
    numero_poltrona: "required|integer",
    fileira: "required|string",
    status_poltrona: "required|boolean",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  const { numero_poltrona, fileira, status_poltrona } = request.body;

  // Verifica se a poltrona já existe na fileira antes de realizar a inserção
  connection.query(
    "SELECT COUNT(*) as total FROM poltrona WHERE numero_poltrona = ? AND fileira = ?",
    [numero_poltrona, fileira],
    function (err, resultadoConsulta) {
      if (err) {
        return response.status(500).json({
          erro: "Ocorreram erros ao verificar a duplicidade da poltrona na fileira",
        });
      }

      const totalPoltronasNaFileira = resultadoConsulta[0].total;

      if (totalPoltronasNaFileira > 0) {
        return response.status(400).json({
          erro: "Essa poltrona já existe na fileira. Escolha um número único para a fileira.",
        });
      }

      // Se a poltrona não existir na fileira, realiza a inserção
      connection.query(
        "INSERT INTO poltrona (numero_poltrona, fileira, status_poltrona) VALUES (?, ?, ?)",
        [numero_poltrona, fileira, status_poltrona],
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
            numero_poltrona,
            fileira,
            status_poltrona,
            id: resultadoInsercao.insertId,
          });
        }
      );
    }
  );
}

// Function update
function update(request, response) {
  const codigo = request.params.codigo;

  const regras = {
    numero_poltrona: "required|integer",
    fileira: "required|string",
    status_poltrona: "required|boolean",
  };

  const validacao = new Validator(request.body, regras);

  if (validacao.fails()) {
    return response.status(400).json(validacao.errors);
  }

  // Buscar o dado no BD
  connection.query(
    "SELECT * FROM poltrona WHERE id_poltrona = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response
          .status(500)
          .json({ erro: "Ocorreram erros ao buscar os dados" });
      }

      if (resultado.length === 0) {
        return response.status(404).json({
          erro: `Não foi possível encontrar a poltrona`,
        });
      }

      const poltronaExistente = resultado[0];
      const { numero_poltrona, fileira, status_poltrona } = request.body;

      // Verifica se a nova poltrona já existe na mesma fileira
      connection.query(
        "SELECT COUNT(*) as total FROM poltrona WHERE numero_poltrona = ? AND fileira = ? AND id_poltrona != ?",
        [numero_poltrona, fileira, codigo],
        function (err, resultadoConsulta) {
          if (err) {
            return response.status(500).json({
              erro: "Ocorreram erros ao verificar a duplicidade da poltrona na fileira",
            });
          }

          const totalPoltronasNaFileira = resultadoConsulta[0].total;

          if (totalPoltronasNaFileira > 0) {
            return response.status(400).json({
              erro: "Essa poltrona já existe na fileira. Escolha um número único para a fileira.",
            });
          }

          // Se a nova poltrona não existir na mesma fileira, realiza a atualização
          connection.query(
            "UPDATE poltrona SET numero_poltrona = ?, fileira = ?, status_poltrona = ? WHERE id_poltrona = ?",
            [numero_poltrona, fileira, status_poltrona, codigo],
            function (err, resultadoAtualizacao) {
              if (err) {
                return response.status(500).json({
                  erro: "Ocorreu um erro ao tentar atualizar a poltrona",
                });
              }

              if (resultadoAtualizacao.affectedRows === 0) {
                return response.status(500).json({
                  erro: "Nenhuma poltrona foi atualizada",
                });
              }

              return response.status(200).json({
                numero_poltrona,
                fileira,
                status_poltrona,
                id: codigo,
              });
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
    "DELETE FROM poltrona WHERE id_poltrona = ?",
    [codigo],
    function (err, resultado) {
      if (err) {
        return response.json({
          erro: "Ocorreu um erro ao tentar excluir a poltrona",
        });
      }

      if (resultado.affectedRows === 0) {
        return response.json({
          erro: `Poltrona #${codigo} não foi encontrada`,
        });
      }

      return response.json({
        mensagem: `Poltrona ${codigo} foi deletada com sucesso`,
      });
    }
  );
}

// Module exports sempre no final do arquivo
module.exports = { show, list, create, update, destroy };

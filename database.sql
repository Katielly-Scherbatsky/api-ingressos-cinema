CREATE DATABASE api_ingressos_cinema;

use api_ingressos_cinema;

CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome_cliente VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    rg VARCHAR(20) NOT NULL UNIQUE,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    endereco VARCHAR(50) NOT NULL,
    contato VARCHAR(50)
);

INSERT INTO cliente (id_cliente, nome_cliente, email, rg, cpf, endereco, contato) VALUES
    (1, 'Roderic', 'rsalomon0@multiply.com', '132168170', '12452763284', 'PO Box 24693', '(398) 8552543'),
    (2, 'Lelia', 'lwhyteman1@hatena.ne.jp', '217927427', '03327665869', '13th Floor', '(149) 5862856'),
    (3, 'Margalo', 'mwurst2@twitter.com', '438062620', '47788338567', 'Room 1639', '(494) 5188696'),
    (4, 'Dyann', 'dpayle3@ocn.ne.jp', '415898250', '34886363806', 'Apt 747', '(238) 2510143'),
    (5, 'Glyn', 'gwheelan4@discuz.net', '157034264', '65285547229', 'PO Box 37057', '(283) 1815234');

CREATE TABLE venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    valor_venda DECIMAL(8,2),
    data_hora_venda DATETIME,
    forma_pagamento VARCHAR(20),
    id_cliente INT,
	FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

INSERT INTO venda (id_venda, valor_venda, data_hora_venda, forma_pagamento, id_cliente) VALUES
    (1, '20.14', '2023/12/23', 'dinheiro', 1),
    (2, '20.61', '2023/12/21', 'cartão crédito', 2),
    (3, '12.86', '2023/12/02', 'pix', 3),
    (4, '15.37', '2023/12/11', 'cartão débito', 5),
    (5, '18.63', '2023/12/23', 'dinheiro', 4);

CREATE TABLE poltrona (
    id_poltrona INT AUTO_INCREMENT PRIMARY KEY,
    numero_poltrona INT,
    fileira VARCHAR(4),
    status_poltrona BOOLEAN
);

INSERT INTO poltrona (id_poltrona, numero_poltrona, fileira, status_poltrona) VALUES
    (1, 1, '1A', true),
    (2, 2, '2B', false),
    (3, 3, '3B', true),
    (4, 4, '4E', false),
    (5, 5, '54', false);

CREATE TABLE sala (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    capacidade INT,
    nome_sala VARCHAR(50),
    local_sala VARCHAR(50)
);

INSERT INTO sala (id_sala, capacidade, nome_sala, local_sala) VALUES
    (1, 58, 'Plambee', '316'),
    (2, 64, 'Tagtune', '756'),
    (3, 59, 'Dynava', '47491'),
    (4, 54, 'Quinu', '4'),
    (5, 75, 'Omba', '44');

CREATE TABLE filme (
    id_filme INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(50),
    sinopse VARCHAR(255),
    atores VARCHAR(255),
    diretor VARCHAR(50),
    tempo INT
);

INSERT INTO filme (id_filme, titulo, sinopse, atores, diretor, tempo) VALUES
    (1, 'Victory Through Air Power', 'Animation|Documentary|War', 'Lawrence Watkinson', 'Eada Wickson', 1),
    (2, 'Breakfast at Tiffany''s', 'Drama|Romance', 'Kiele Strickler', 'Welby Kmieciak', 2),
    (3, 'Caribe', 'Drama|Mystery|Romance', 'Riobard Teffrey', 'Munroe Ranscome', 3),
    (4, 'Message, The (a.k.a. Mohammad: Messenger of God)', 'Adventure|Drama|War', 'Raychel Studholme', 'Judye Christer', 2),
    (5, 'Necessary Roughness', 'Comedy', 'Estel Claige', 'Andrea Macauley', 2);

CREATE TABLE sessao (
    id_sessao INT AUTO_INCREMENT PRIMARY KEY,
    hora_inicio TIME,
    hora_fim TIME,
    data_sessao DATE,
    valor_sessao DECIMAL(8,2),
    id_sala INT,
    id_filme INT,
    FOREIGN KEY (id_sala) REFERENCES sala(id_sala),
    FOREIGN KEY (id_filme) REFERENCES filme(id_filme)
);

INSERT INTO sessao (id_sessao, hora_inicio, hora_fim, data_sessao, valor_sessao, id_sala, id_filme) VALUES
    (1, '18:30', '19:45', '2023-12-01', '5.21', 1, 2),
    (2, '16:30', '17:50', '2023-12-07', '3.44', 3, 3),
    (3, '13:00', '14:30', '2023-12-23', '27.23', 4, 1),
    (4, '16:30', '17:50', '2023-12-21', '1.63', 5, 4),
    (5, '18:30', '19:45', '2023-12-04', '13.21', 2, 5);

CREATE TABLE ingresso (
    id_ingresso INT AUTO_INCREMENT PRIMARY KEY,
    valor_ingresso DECIMAL(8,2),
    data_hora_ingresso DATETIME,
    id_venda INT,
    id_sessao INT,
    FOREIGN KEY (id_venda) REFERENCES venda(id_venda),
    FOREIGN KEY (id_sessao) REFERENCES sessao(id_sessao)
);

INSERT INTO ingresso (id_ingresso, valor_ingresso, data_hora_ingresso, id_venda, id_sessao) VALUES
    (1, '3.50', '2023/12/19', 1, 1),
    (2, '17.78', '2023/12/12', 5, 4),
    (3, '19.53', '2023/12/30', 3, 3),
    (4, '12.89', '2023/12/07', 4, 2),
    (5, '25.52', '2023/12/16', 2, 5);

drop database if exists cinema_ingresso_db;
create database cinema_ingresso_db;
use cinema_ingresso_db;

create table cliente (
    id_cli int primary key auto_increment,
    nome varchar(300),
    sexo varchar(100),
    data_nascimento date,
    cpf varchar(100),
    rg varchar(100),
    email varchar(300),
    telefone varchar(300),
    tipagem_sanguinea varchar(2),
    fator_rh varchar(1)
);

SELECT * FROM cliente;

INSERT INTO cliente VALUES (1, 'João Teixeira', 'Masculino', '1986-11-13', '123.456.789-96', '53644', 'joao@gmail.com', '(69) 99632-9999', 'O', '+');

create table filme (
    id_fil int primary key auto_increment,
    titulo varchar(300),
    sinopse varchar(500),
    atores varchar(300),
    diretor varchar(300),
    genero varchar(300),
    classificacao_indicativa varchar(300),
    duracao time
);

INSERT INTO filme VALUES (1, 'John Wick 3', 'John Wick 3 ...', 'Keanu Reeves, Ian McShane, ...', 'Chad Stahelski', 'ação e suspense', '16 anos', '01:53:00');

SELECT * FROM filme;

SELECT * FROM filme WHERE id_fil = 1;

create table sala (
    id_sal int primary key auto_increment,
    nome varchar(300),
    numero int,
    capacidade varchar(300)
);

SELECT COUNT(*) as total FROM sala WHERE id_sal = 1;

INSERT INTO sala VALUES (1, 'Sala A', 1, 20);

create table poltrona (
    id_pol int primary key auto_increment,
    numero int,
    fileira varchar(1),
    status varchar(100),
    sala_id int,
    foreign key(sala_id) references sala (id_sal)
);

INSERT INTO poltrona VALUES (1, 1, 'A', 'Liberada', 1);
INSERT INTO poltrona VALUES (2, 2, 'A', 'Liberada', 1);
INSERT INTO poltrona VALUES (3, 3, 'A', 'Liberada', 1);
INSERT INTO poltrona VALUES (4, 4, 'A', 'Liberada', 1);
INSERT INTO poltrona VALUES (5, 5, 'A', 'Liberada', 1);

SELECT * FROM poltrona;

create table sessao (
    id_ses int primary key auto_increment,
    data date not null,
    horario_inicio time not null,
    horario_fim time not null,
    sala_id int not null,
    filme_id int not null,
    foreign key(sala_id) references sala (id_sal),
    foreign key(filme_id) references filme (id_fil)
);
    
INSERT INTO sessao VALUES (1, '2023-12-12', '19:00:00', '21:00:00', 1, 1);
INSERT INTO sessao VALUES (2, '2023-12-12', '21:15:00', '23:15:00', 1, 1);

SELECT * FROM sessao;

SELECT * FROM sessao, filme, sala WHERE filme_id = id_fil AND sala_id = id_sal;

SELECT s.id_ses, s.data, s.horario_inicio, s.horario_fim, sa.nome, f.titulo FROM sessao s
    JOIN sala sa ON sa.id_sal = s.sala_id
    JOIN filme f ON f.id_fil = s.filme_id
    WHERE s.id_ses = 1;

create table ingresso (
    id_ing int primary key auto_increment,
    codigo varchar(20),
    valor decimal(12, 2),
    data_hora datetime,
    sessao_id int not null,
    poltrona_id int not null,
    foreign key(sessao_id) references sessao (id_ses),
    foreign key(poltrona_id) references poltrona (id_pol)
);

INSERT INTO ingresso VALUES (1, '21ACO34', 30.00, '2023-12-12 17:00:00', 1, 1);
INSERT INTO ingresso VALUES ('21ACO35', 40.00, '2023-12-12 17:00:00', 1, 2);

SELECT i.id_ing, i.codigo, i.valor, i.data_hora, s.id_ses, p.numero, p.fileira FROM ingresso i
    JOIN sessao s ON s.id_ses = i.sessao_id
    JOIN poltrona p ON p.id_pol = i.poltrona_id
    WHERE i.id_ing = 1;

SELECT * FROM ingresso;

create table venda (
    id_ven int primary key auto_increment,
    valor decimal(12, 2),
    data_hora datetime,
    forma_pagamento varchar(200) not null,
    situacao varchar(20) not null default 'pendente',
    ingresso_id int not null,
    cliente_id int not null,
    foreign key(ingresso_id) references ingresso(id_ing),
    foreign key(cliente_id) references cliente(id_cli)
);

SELECT v.id_ven, v.valor, v.data_hora, v.forma_pagamento, v.situacao, c.nome, i.codigo, i.data_hora FROM venda v
      JOIN cliente c ON c.id_cli = v.cliente_id
      JOIN ingresso i ON i.id_ing = v.ingresso_id
      WHERE v.id_ven = 1;

INSERT INTO venda VALUES (1, 30.00, '2023-12-12 17:05:00', 'pix', 'pago', 1, 1);

SELECT * FROM venda;

SELECT * FROM venda, ingresso, cliente WHERE ingresso_id = id_ing AND cliente_id = id_cli;
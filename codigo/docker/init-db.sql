-- init-db.sql

-- Criar tabelas
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    cpf VARCHAR(20) UNIQUE,
    endereco VARCHAR(255)
);

CREATE TABLE vendedores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    cpf VARCHAR(20) UNIQUE
);

CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    preco DECIMAL,
    estoque INT
);

-- Inserir dados iniciais
INSERT INTO clientes (nome, cpf, endereco) VALUES
('Jailson', '111.222.333-44', 'Endereço 1'),
('Carlos', '555.666.777-88', 'Endereço 2'),
('Roberto', '777.888.999-00', 'Endereço 3');

INSERT INTO vendedores (nome, cpf) VALUES
('Alberto', '111.111.111-11'),
('Suzana', '222.222.222-22');

INSERT INTO produtos (nome, preco, estoque) VALUES
('feijão', 10.00, 100),
('arroz', 20.00, 50),
('macarrão', 30.00, 75);

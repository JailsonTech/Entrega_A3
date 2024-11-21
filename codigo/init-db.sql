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
    item VARCHAR(255),
    preco DECIMAL,
    estoque INT
);

-- Inserir dados iniciais
INSERT INTO clientes (nome, cpf, endereco) VALUES
('Jailson', '11122233344', 'Endereço 1'),
('Carlos', '55566677788', 'Endereço 2'),
('Roberto', '77788899900', 'Endereço 3'),
('Julia', '24589878908', 'Endereço 3'),
('Larissa', '73484894940', 'Endereço 4');

INSERT INTO vendedores (nome, cpf) VALUES
('Alberto', '15717715861'),
('Suzana', '27285229226');

INSERT INTO produtos (item, preco, estoque) VALUES
('feijão', 6.99, 100),
('arroz', 4.00, 90),
('macarrão', 4.49, 75),
('farinha', 8.99, 95),
('sal', 2.79, 58),
('açúcar', 5.99, 12),
('vinagre', 9.99, 25),
('azeite', 28.99, 48),
('tapioca', 4.99, 36),
('detergente', 2.29, 66);

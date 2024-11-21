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
('Jailson', '111.222.333-44', 'Endereço 1'),
('Carlos', '555.666.777-88', 'Endereço 2'),
('Roberto', '777.888.999-00', 'Endereço 3'),
('Julia', '245.898.789-08', 'Endereço 3'),
('Larissa', '734.848.949-40', 'Endereço 4');

INSERT INTO vendedores (nome, cpf) VALUES
('Alberto', '157.177.158-61'),
('Suzana', '272.852.292-26');

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

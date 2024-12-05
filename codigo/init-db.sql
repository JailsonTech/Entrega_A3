--INIB-DB.SQL....

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
    cpf VARCHAR(20) UNIQUE,
    endereco VARCHAR(255)
);

CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    preco DECIMAL(10, 2),
    estoque INT
);

-- Criar funções de formatação de nome para clientes, vendedores e produtos

-- Função para formatar nome do cliente
CREATE OR REPLACE FUNCTION formatar_nome_cliente()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nome := TRIM(REGEXP_REPLACE(NEW.nome, '\s+', ' ', 'g'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para formatar nome do vendedor
CREATE OR REPLACE FUNCTION formatar_nome_vendedor()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nome := TRIM(REGEXP_REPLACE(NEW.nome, '\s+', ' ', 'g'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para formatar nome do produto
CREATE OR REPLACE FUNCTION formatar_nome_produto()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nome := TRIM(REGEXP_REPLACE(NEW.nome, '\s+', ' ', 'g'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para chamar as funções

-- Trigger para clientes
CREATE TRIGGER trigger_formatar_nome_cliente
BEFORE INSERT OR UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION formatar_nome_cliente();

-- Trigger para vendedores
CREATE TRIGGER trigger_formatar_nome_vendedor
BEFORE INSERT OR UPDATE ON vendedores
FOR EACH ROW
EXECUTE FUNCTION formatar_nome_vendedor();

-- Trigger para produtos
CREATE TRIGGER trigger_formatar_nome_produto
BEFORE INSERT OR UPDATE ON produtos
FOR EACH ROW
EXECUTE FUNCTION formatar_nome_produto();

-- Inserir dados iniciais
INSERT INTO clientes (nome, cpf, endereco) VALUES
('Jailson', '111.222.333-44', 'Endereço 1'),
('Carlos', '555.666.777-88', 'Endereço 2'),
('Roberto', '777.888.999-00', 'Endereço 3'),
('Julia', '245.898.789-08', 'Endereço 3'),
('Larissa', '734.848.949-40', 'Endereço 4');

INSERT INTO vendedores (nome, cpf, endereco) VALUES
('Alberto', '157.177.158-61', 'Endereço A'),
('Suzana', '272.852.292-26', 'Endereço B');

INSERT INTO produtos (nome, preco, estoque) VALUES
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

DROP TABLE IF EXISTS vendas;

CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    clienteId INT NOT NULL,
    vendedorId INT NOT NULL,
    produtoId INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    data_venda TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clienteId) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (vendedorId) REFERENCES vendedores(id) ON DELETE CASCADE,
    FOREIGN KEY (produtoId) REFERENCES produtos(id) ON DELETE CASCADE
);


-- Inserir dados iniciais de vendas
INSERT INTO vendas (clienteId, vendedorId, produtoId, quantidade, total, data_venda) VALUES
(1, 1, 1, 10, 69.90, '2024-11-01'),
(2, 2, 2, 5, 20.00, '2024-11-02'),
(3, 1, 3, 8, 35.92, '2024-11-03');

-- Criar tabela relatorios
CREATE TABLE relatorios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Ex: consumo-medio, por_cliente, mais_vendidos
    dados JSONB NOT NULL, 
    data_relatorio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

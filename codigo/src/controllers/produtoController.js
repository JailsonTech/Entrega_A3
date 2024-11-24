const { Op } = require('sequelize');
const Produtos = require('../models/produtos'); 

const {
    validarNomeProduto,
    validarPreco,
    validarEstoque,
    validarCamposObrigatoriosProduto,
    validarIdProduto,
    verificarProdutoExistente
} = require('../utils/validacoes'); // Importando as funções de validação

// Função para criar um novo produto
exports.criarProduto = async (req, res) => {
    try {
        const { nome, preco, estoque } = req.body;

        // Validação de campos obrigatórios
        const camposInvalidos = validarCamposObrigatoriosProduto(nome, preco, estoque);
        if (camposInvalidos) {
            return res.status(400).json({ message: camposInvalidos });
        }

        // Validação do nome do produto (apenas letras e espaços)
        if (!validarNomeProduto(nome)) {  // Erro aqui, falta o parêntese de fechamento
            return res.status(400).json({ message: 'Nome do produto inválido. Apenas letras e espaços são permitidos.' });
        }

        // Validação do preço (deve ser maior que 0)
        if (!validarPreco(preco)) {
            return res.status(400).json({ message: 'Preço deve ser um número positivo maior que zero.' });
        }

        // Validação de estoque (deve ser um número inteiro não negativo)
        if (!validarEstoque(estoque)) {
            return res.status(400).json({ message: 'Estoque deve ser um número inteiro não negativo.' });
        }

        // Verificar se o produto já existe no banco de dados
        const produtoExistente = await verificarProdutoExistente(Produtos, nome);
        if (produtoExistente) {
            return res.status(400).json({ message: 'Produto já cadastrado com esse nome.' });
        }

        // Criando o novo produto
        const novoProduto = await Produtos.create({ nome, preco, estoque });

        res.status(201).json({
            message: 'Produto criado com sucesso!',
            produto: novoProduto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar produto.', error });
    }
};

// Função para obter todos os produtos
exports.obterProdutos = async (req, res) => {
    try {
        const produtos = await Produtos.findAll();

        if (produtos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado.' });
        }

        res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter produtos.', error });
    }
};

// Função para obter um produto por nome
exports.obterProdutoPorNome = async (req, res) => {
    try {
        const { nome } = req.params;

        if (!nome) {
            return res.status(400).json({ message: 'Parâmetro "nome" é obrigatório.' });
        }

        // Validando o nome do produto (apenas letras e espaços)
        if (!validarNomeProduto(nome)) {
            return res.status(400).json({ message: 'Nome de produto inválido. Apenas letras e espaços são permitidos.' });
        }

        // Busca insensível a maiúsculas e minúsculas
        const produtos = await Produtos.findAll({
            where: {
                nome: {
                    [Op.iLike]: `%${nome}%`, // Busca insensível a maiúsculas/minúsculas
                },
            },
        });

        if (produtos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado com esse nome.' });
        }

        res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produto por nome.', error });
    }
};

// Função para obter um produto por ID
exports.obterProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Validação do ID (verifica se é um número inteiro positivo)
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({ message: 'ID inválido. O ID deve ser um número inteiro positivo.' });
        }

        // Buscar produto pelo ID
        const produto = await Produtos.findByPk(id); // Encontra o produto pelo ID

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        res.status(200).json(produto); // Retorna o produto encontrado
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produto por ID.', error });
    }
};

// Função para atualizar um produto
exports.atualizarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, preco, estoque } = req.body;

        // Verificar se pelo menos um campo foi informado
        if (!nome && preco === undefined && estoque === undefined) {
            return res.status(400).json({ message: 'Pelo menos um campo deve ser informado: nome, preco ou estoque.' });
        }

        // Validação de preço e estoque
        if (preco && !validarPreco(preco)) {
            return res.status(400).json({ message: 'Preço deve ser um número positivo maior que zero.' });
        }

        if (estoque && !validarEstoque(estoque)) {
            return res.status(400).json({ message: 'Estoque deve ser um número inteiro não negativo.' });
        }

        // Validação do nome do produto (se fornecido)
        if (nome && !validarNomeProduto(nome)) {
            return res.status(400).json({ message: 'Nome do produto inválido. Apenas letras e espaços são permitidos.' });
        }

        const produto = await Produtos.findByPk(id);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Atualizando os campos fornecidos
        if (nome) produto.nome = nome;
        if (preco) produto.preco = preco;
        if (estoque) produto.estoque = estoque;

        await produto.save();

        res.status(200).json({
            message: 'Produto atualizado com sucesso.',
            produto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto.', error });
    }
};

// Função para deletar um produto
exports.deletarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const produto = await Produtos.findByPk(id);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        await produto.destroy();

        res.status(200).json({ message: 'Produto deletado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar produto.', error });
    }
};

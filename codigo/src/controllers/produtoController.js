// src/controllers/produtoController.js
const Produto = require('../models/produtos'); // Importa o modelo de Produtos

// Função para criar um novo produto
exports.criarProduto = async (req, res) => {
    try {
        const { nome, preco, estoque } = req.body; // Pegando os dados do corpo da requisição

        // Verificar se todos os campos obrigatórios foram fornecidos
        if (!nome || preco === undefined || estoque === undefined) {
            return res.status(400).json({ message: 'Nome, preço e estoque são obrigatórios' });
        }

        // Criação do produto no banco de dados
        const novoProduto = await Produto.create({ nome, preco, estoque });

        // Retornando o produto criado com status 201 (Created)
        res.status(201).json(novoProduto);
    } catch (error) {
        // Em caso de erro, retornamos uma mensagem de erro
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar produto', error });
    }
};

// Função para obter todos os produtos
exports.obterProdutos = async (req, res) => {
    try {
        const produtos = await Produto.findAll(); // Buscar todos os produtos no banco

        if (produtos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado' });
        }

        // Retornando os produtos encontrados com status 200 (OK)
        res.status(200).json(produtos);
    } catch (error) {
        // Em caso de erro, retornamos uma mensagem de erro
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter produtos', error });
    }
};

// Função para atualizar um produto
exports.atualizarProduto = async (req, res) => {
    try {
        const { id } = req.params; // Pegando o id da URL
        const { nome, preco, estoque } = req.body; // Pegando os dados do corpo da requisição

        // Encontrando o produto pelo id
        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // Atualizando os dados do produto
        produto.nome = nome || produto.nome;  // Mantém o valor atual se não for fornecido
        produto.preco = preco || produto.preco; // Mantém o valor atual se não for fornecido
        produto.estoque = estoque || produto.estoque; // Mantém o valor atual se não for fornecido

        // Salvando as mudanças no banco de dados
        await produto.save();

        // Retornando o produto atualizado
        res.status(200).json(produto);
    } catch (error) {
        // Em caso de erro, retornamos uma mensagem de erro
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto', error });
    }
};

// Função para deletar um produto
exports.deletarProduto = async (req, res) => {
    try {
        const { id } = req.params; // Pegando o id da URL

        // Encontrando o produto pelo id
        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // Deletando o produto
        await produto.destroy();

        // Retornando resposta sem conteúdo (status 204)
        res.status(204).send();
    } catch (error) {
        // Em caso de erro, retornamos uma mensagem de erro
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar produto', error });
    }
};
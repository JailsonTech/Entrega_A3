// controllers/produtoController.js
const Produto = require('../models/produtos'); // Importa o modelo de Produtos
const { Sequelize } = require('sequelize'); // Importa Sequelize para o operador Op

// Função para criar um novo produto
exports.criarProduto = async (req, res) => {
    try {
        const { item, preco, estoque } = req.body; // Pegando os dados do corpo da requisição

        // Verificar se todos os campos obrigatórios foram fornecidos
        if (!item || preco === undefined || estoque === undefined) {
            return res.status(400).json({ message: 'Item, preço e estoque são obrigatórios' });
        }

        // Criação do produto no banco de dados
        const novoProduto = await Produto.create({ item, preco, estoque });

        // Retornando o produto criado com status 201 (Created)
        res.status(201).json({
            message: 'Produto criado com sucesso!',
            produto: novoProduto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar produto', error });
    }
};

// Função para obter todos os produtos ou buscar produtos pelo item
exports.obterProdutos = async (req, res) => {
    try {
        const { item } = req.params; // Pegando o item da URL (se existir)

        let produtos;

        if (item) {
            // Se o parâmetro 'item' foi passado, filtra os produtos pelo item
            produtos = await Produto.findAll({
                where: {
                    item: {
                        [Sequelize.Op.iLike]: `%${item}%`, // Usando iLike para busca insensível a maiúsculas/minúsculas
                    },
                },
            });
        } else {
            // Caso contrário, retorna todos os produtos
            produtos = await Produto.findAll();
        }

        if (produtos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado' });
        }

        // Retornando os produtos encontrados com status 200 (OK)
        res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter produtos', error });
    }
};

// Função para atualizar um produto
exports.atualizarProduto = async (req, res) => {
    try {
        const { id, item } = req.params; // Pegando id e item da URL
        const { preco, estoque } = req.body; // Pegando os dados do corpo da requisição

        let produto;

        // Se o id foi fornecido e é um número válido, busca pelo id
        if (id && !isNaN(Number(id))) {
            produto = await Produto.findByPk(Number(id)); // Busca pelo id numérico
        } 
        // Se o item foi fornecido, busca pelo item
        else if (item) {
            produto = await Produto.findOne({
                where: {
                    item: {
                        [Sequelize.Op.iLike]: `%${item}%`, // Busca insensível a maiúsculas/minúsculas
                    },
                },
            });
        }

        // Se nenhum produto foi encontrado, retorna erro
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // Atualizando os dados do produto (se foram fornecidos no corpo da requisição)
        produto.preco = preco !== undefined ? preco : produto.preco;
        produto.estoque = estoque !== undefined ? estoque : produto.estoque;

        // Salvando as mudanças no banco de dados
        await produto.save();

        // Retornando o produto atualizado com uma mensagem de sucesso
        res.status(200).json({
            message: 'Produto atualizado com sucesso!',
            produto: produto,
        });
    } catch (error) {
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

        // Retornando uma mensagem de sucesso após o deletamento
        res.status(200).json({
            message: 'Produto deletado com sucesso!',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar produto', error });
    }
};

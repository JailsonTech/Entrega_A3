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
        const { id, item } = req.params;  // Pegando id e item da URL
        const { preco, estoque } = req.body; // Pegando os dados do corpo da requisição

        let produto;

        // Se o id for passado, buscar pelo id
        if (id && !isNaN(Number(id))) {
            produto = await Produto.findByPk(Number(id));  // Busca pelo id numérico
        }
        // Se o item for passado, buscar pelo item
        else if (item) {
            produto = await Produto.findOne({
                where: {
                    item: {
                        [Sequelize.Op.iLike]: item  // Busca pelo nome do item (case insensitive)
                    },
                },
            });
        }

        // Se o produto não for encontrado
        if (!produto) {
            return res.status(404).json({ message: `Produto "${item}" não encontrado` });
        }

        // Validando o preço
        if (preco !== undefined) {
            // Substituir vírgula por ponto para garantir que é um número válido
            const precoFloat = parseFloat(preco.replace(',', '.'));

            if (isNaN(precoFloat) || precoFloat <= 0) {
                return res.status(400).json({
                    message: 'Preço inválido. Por favor, forneça um número válido para o preço (ex: 9.99).'
                });
            }
            produto.preco = precoFloat; // Atualiza o preço se for válido
        }

        // Validando o estoque
        if (estoque !== undefined) {
            const estoqueInt = parseInt(estoque);

            if (isNaN(estoqueInt) || estoqueInt < 0) {
                return res.status(400).json({
                    message: 'Estoque inválido. Por favor, forneça um número inteiro válido para o estoque (ex: 100).'
                });
            }
            produto.estoque = estoqueInt; // Atualiza o estoque se for válido
        }

        // Salvando as alterações no banco de dados
        await produto.save();

        // Retornando o produto atualizado
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

// Função para buscar o estoque de um produto específico
exports.buscarProdutoPorItem = async (req, res) => {
    try {
        const { item } = req.params; // Pegando o nome do item da URL

        // Buscar o produto pelo nome (item)
        const produto = await Produto.findOne({
            where: {
                item: {
                    [Sequelize.Op.iLike]: `%${item}%`, // Usando iLike para buscar insensível a maiúsculas/minúsculas
                },
            },
        });

        if (!produto) {
            return res.status(404).json({ message: `Produto "${item}" não encontrado no estoque.` });
        }

        // Retorna o produto encontrado e seu estoque
        res.status(200).json({
            item: produto.item,
            estoque: produto.estoque,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produto no estoque.', error });
    }
};

// Função para obter o estoque de um produto específico
exports.obterEstoque = async (req, res) => {
    try {
        const { item } = req.params; // Pegando o nome do produto da URL

        // Buscar o produto pelo nome
        const produto = await Produto.findOne({
            where: {
                item: {
                    [Sequelize.Op.iLike]: item, // Busca insensível a maiúsculas/minúsculas
                },
            },
        });

        if (!produto) {
            return res.status(404).json({ message: `Produto "${item}" não encontrado.` });
        }

        // Retornando o estoque do produto
        res.status(200).json({
            item: produto.item,
            estoque: produto.estoque,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter estoque do produto', error });
    }
};


// controllers/produtoController.js

/// Função para listar todos os produtos e seus estoques
exports.listarEstoque = async (req, res) => {
    try {
        // Buscar todos os produtos
        const produtos = await Produto.findAll();

        console.log(produtos); // Verifique o que é retornado aqui

        // Verificar se não há produtos no banco
        if (produtos.length === 0) {
            return res.status(200).json({ message: 'Nenhum produto no estoque.' });
        }

        // Retornar todos os produtos com seus estoques
        res.status(200).json(produtos.map(produto => ({
            item: produto.item,
            estoque: produto.estoque,
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao listar estoques dos produtos', error });
    }
};






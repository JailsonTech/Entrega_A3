//codigo/src/controllers/vendaController.js

const Cliente = require('../models/clientes');  // Ajuste o caminho conforme necessário
const Vendedor = require('../models/vendedores'); // Ajuste o caminho conforme necessário
const Produto = require('../models/produtos');   // Ajuste o caminho conforme necessário
const Vendas = require('../models/vendas');     // Ajuste o caminho conforme necessário

const { Op } = require('sequelize');

const criarVenda = async (req, res) => {
    const { clienteNome, vendedorNome, produtoNome, quantidade } = req.body;

    try {
        // Buscar cliente, vendedor e produto
        const cliente = await Cliente.findOne({ where: { nome: clienteNome } });
        const vendedor = await Vendedor.findOne({ where: { nome: vendedorNome } });
        const produto = await Produto.findOne({ where: { nome: { [Op.iLike]: produtoNome } } });

        if (!produto) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        // Verificar se o estoque é suficiente
        if (produto.estoque < quantidade) {
            return res.status(400).json({ mensagem: 'Estoque insuficiente para completar a venda.' });
        }

        // Calcular o total com 2 casas decimais e manter como número
        const total = Math.round((produto.preco * quantidade) * 100) / 100;

        // Criar a venda com os dados
        const venda = await Vendas.create({
            clienteId: cliente ? cliente.id : null,
            vendedorId: vendedor ? vendedor.id : null,
            produtoId: produto ? produto.id : null,
            quantidade,
            total,  // Passar o total já arredondado
        });

        // Atualizar estoque
        produto.estoque -= quantidade;
        await produto.save();

        // Retornar a venda criada com os dados de cliente, vendedor e produto
        return res.status(201).json({
            clienteNome: cliente ? cliente.nome : 'Indefinido',
            vendedorNome: vendedor ? vendedor.nome : 'Indefinido',
            produtoNome: produto ? produto.nome : 'Indefinido',
            quantidade,
            total,  // Retornar o total já arredondado como número
        });

    } catch (error) {
        console.error('Erro ao criar venda:', error);
        return res.status(500).json({
            mensagem: 'Erro ao criar venda.',
            erro: error.message,  // Mostrar a mensagem de erro completa
            stack: error.stack,   // Mostrar a pilha de erros para diagnóstico
        });
    }
};

module.exports = {
    criarVenda,
};

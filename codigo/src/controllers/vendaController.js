// src/controllers/vendaController.js
const Vendas = require('../models/vendas');
const Cliente = require('../models/clientes');
const Vendedor = require('../models/vendedores');
const Produto = require('../models/produtos');

// Função para criar uma venda
const criarVenda = async (req, res) => {
    const { clienteNome, vendedorNome, item, quantidade } = req.body;

    try {
        // Verificar se o cliente existe
        const cliente = await Cliente.findOne({ where: { nome: clienteNome } });
        if (!cliente) {
            return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
        }

        // Verificar se o vendedor existe
        const vendedor = await Vendedor.findOne({ where: { nome: vendedorNome } });
        if (!vendedor) {
            return res.status(404).json({ mensagem: 'Vendedor não encontrado.' });
        }

        // Verificar se o produto existe
        const produto = await Produto.findOne({ where: { item } });
        if (!produto) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        // Verificando se há estoque suficiente
        if (produto.estoque < quantidade) {
            return res.status(400).json({ mensagem: 'Estoque insuficiente para realizar a venda.' });
        }

        // Calcular o total
        const total = produto.preco * quantidade;

        // Criar a venda com nomes ao invés de IDs
        const venda = await Vendas.create({
            cliente_nome: cliente.nome,     // Usar o nome do cliente
            vendedor_nome: vendedor.nome,   // Usar o nome do vendedor
            produto_item: produto.item,     // Usar o nome do produto
            quantidade,
            total,  // Passar o total calculado explicitamente
        });

        // Atualizar o estoque do produto
        produto.estoque -= quantidade;
        await produto.save();

        // Retornar a venda criada
        return res.status(201).json({
            clienteNome: cliente.nome,
            vendedorNome: vendedor.nome,
            item: produto.item,
            quantidade,
            total,  // Retornar o total calculado
        });

    } catch (error) {
        console.error('Erro ao criar venda:', error.message);
        return res.status(500).json({ mensagem: 'Erro ao criar venda.' });
    }
};

module.exports = {
    criarVenda,
};

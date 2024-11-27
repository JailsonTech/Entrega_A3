//pedidoCompraController.js

const Produtos = require('../models/produtos'); // Importando o modelo de Produto

// Função para receber um pedido de compra (aumentando o estoque)
exports.receberPedidoCompra = async (req, res) => {
    const { idProduto, quantidade } = req.body;

    if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade inválida.' });
    }

    try {
        const produto = await Produtos.findByPk(idProduto);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        produto.estoque += quantidade;
        await produto.save();
        res.status(200).json({ message: 'Pedido de compra recebido e estoque atualizado.', produto });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar pedido de compra.', error });
    }
};

// Função para cancelar um pedido de compra (diminuindo o estoque)
exports.cancelarPedidoCompra = async (req, res) => {
    const { idProduto, quantidade } = req.body;

    if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade inválida.' });
    }

    try {
        const produto = await Produtos.findByPk(idProduto);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        if (produto.estoque < quantidade) {
            return res.status(400).json({ message: 'Estoque insuficiente para cancelar o pedido.' });
        }

        produto.estoque -= quantidade;
        await produto.save();
        res.status(200).json({ message: 'Pedido de compra cancelado e estoque ajustado.', produto });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar cancelamento de pedido.', error });
    }
};

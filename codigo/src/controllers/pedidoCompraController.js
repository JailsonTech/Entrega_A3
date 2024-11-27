// pedidoCompraController.js

const {    
    validarId
} = require('../utils/validacoes'); // Importando a função de validação

const Produtos = require('../models/produtos'); // Importando o modelo de Produto

// Função para receber um pedido de compra (aumentando o estoque)
exports.receberPedidoCompra = async (req, res) => {
    const { idProduto, quantidade } = req.body;

    // Validação do ID do produto
    const idValido = validarId(idProduto);
    if (idValido) {
        return res.status(400).json({ message: idValido }); // Envia a mensagem de erro de validação
    }

    // Validação da quantidade
    if (isNaN(quantidade) || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade inválida.' });
    }

    try {
        // Buscar o produto no banco de dados
        const produto = await Produtos.findByPk(idProduto);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Atualizando o estoque do produto
        produto.estoque += quantidade;
        await produto.save();

        // Resposta de sucesso
        res.status(200).json({ message: 'Compra realizada e estoque atualizado.', produto });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar pedido de compra.', error: error.message });
    }
};

// Função para cancelar um pedido de compra (diminuindo o estoque)
exports.cancelarPedidoCompra = async (req, res) => {
    const { idProduto, quantidade } = req.body;

    // Validação do ID do produto
    const idValido = validarId(idProduto);
    if (idValido) {
        return res.status(400).json({ message: idValido }); // Envia a mensagem de erro de validação
    }

    // Validação da quantidade
    if (isNaN(quantidade) || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade inválida.' });
    }

    try {
        // Buscar o produto no banco de dados
        const produto = await Produtos.findByPk(idProduto);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Verificar se a quantidade a ser cancelada não é maior que o estoque
        if (produto.estoque < quantidade) {
            return res.status(400).json({ message: 'O valor de cancelamento é maior do que o estoque.' });
        }

        // Atualizando o estoque após cancelamento
        produto.estoque -= quantidade;
        await produto.save();

        // Resposta de sucesso
        res.status(200).json({ message: 'Compra cancelada e estoque ajustado.', produto });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar cancelamento de pedido.', error: error.message });
    }
};

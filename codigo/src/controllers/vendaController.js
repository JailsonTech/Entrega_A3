const Cliente = require('../models/clientes');  // Certifique-se de que o caminho está correto
const Vendedor = require('../models/vendedores'); // Certifique-se de que o caminho está correto
const Produto = require('../models/produtos');   // Certifique-se de que o caminho está correto
const Vendas = require('../models/vendas');     // Certifique-se de que o caminho está correto
const { Op } = require('sequelize');
const { validarNome, validarNomeProduto, validarQuantidade } = require('../utils/validacoes'); // Importe a função de validação de nome

const criarVenda = async (req, res) => {
    const { clienteNome, vendedorNome, produtoNome, quantidade } = req.body;

    try {
        // Validações para clienteNome, vendedorNome, produtoNome e quantidade
        const erroClienteNome = validarNome(clienteNome);
        const erroVendedorNome = validarNome(vendedorNome);
        const erroProdutoNome = validarNomeProduto(produtoNome);
        const { valid: quantidadeValida, message: erroQuantidade } = validarQuantidade(quantidade);  // Validação de quantidade

        if (erroClienteNome) {
            return res.status(400).json({ mensagem: erroClienteNome });
        }
        if (erroVendedorNome) {
            return res.status(400).json({ mensagem: erroVendedorNome });
        }
        if (erroProdutoNome) {
            return res.status(400).json({ mensagem: erroProdutoNome });
        }
        if (!quantidadeValida) {
            return res.status(400).json({ mensagem: erroQuantidade });
        }

        // Buscar cliente, vendedor e produto
        const cliente = await Cliente.findOne({ where: { nome: clienteNome } });
        if (!cliente) {
            return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
        }

        const vendedor = await Vendedor.findOne({ where: { nome: vendedorNome } });
        if (!vendedor) {
            return res.status(404).json({ mensagem: 'Vendedor não encontrado.' });
        }

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
            clienteId: cliente.id,
            vendedorId: vendedor.id,
            produtoId: produto.id,
            quantidade,
            total,  // Passar o total já arredondado
        });

        // Atualizar estoque
        produto.estoque -= quantidade;
        await produto.save();

        // Retornar a venda criada com os dados de cliente, vendedor e produto
        return res.status(201).json({
            clienteNome: cliente.nome,
            vendedorNome: vendedor.nome,
            produtoNome: produto.nome,
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

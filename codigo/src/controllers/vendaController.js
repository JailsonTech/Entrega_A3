const Cliente = require('../models/clientes');  // Ajuste o caminho conforme necessário
const Vendedor = require('../models/vendedores'); // Ajuste o caminho conforme necessário
const Produto = require('../models/produtos');   // Ajuste o caminho conforme necessário
const Vendas = require('../models/vendas');     // Ajuste o caminho conforme necessário

const { Op } = require('sequelize');

const criarVenda = async (req, res) => {
    const { clienteNome, vendedorNome, produtoNome, quantidade } = req.body;

    try {
        // Criar a venda diretamente, sem validação dos dados
        const cliente = await Cliente.findOne({ where: { nome: clienteNome } });
        const vendedor = await Vendedor.findOne({ where: { nome: vendedorNome } });
        const produto = await Produto.findOne({ where: { nome: { [Op.iLike]: produtoNome } } });

        // Criar a venda com os dados sem verificação
        const venda = await Vendas.create({
            clienteId: cliente ? cliente.id : null,    // Usar o ID do cliente ou null
            vendedorId: vendedor ? vendedor.id : null,  // Usar o ID do vendedor ou null
            produtoId: produto ? produto.id : null,    // Usar o ID do produto ou null
            quantidade,
            total: produto ? produto.preco * quantidade : 0,  // Calcular total mesmo sem produto
        });

        // Atualizar estoque sem validação
        if (produto) {
            produto.estoque -= quantidade;
            await produto.save();
        }

        // Retornar a venda criada com os dados de cliente, vendedor e produto
        return res.status(201).json({
            clienteNome: cliente ? cliente.nome : 'Indefinido',
            vendedorNome: vendedor ? vendedor.nome : 'Indefinido',
            produtoNome: produto ? produto.nome : 'Indefinido',
            quantidade,
            total: produto ? produto.preco * quantidade : 0,  // Retornar o total calculado
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

//controllers/vendaController.js

const Cliente = require('../models/clientes');  
const Vendedor = require('../models/vendedores');  
const Produto = require('../models/produtos');  
const Venda = require('../models/vendas');  

const criarVenda = async (req, res) => {
    const { clienteNome, vendedorNome, produtoNome, quantidade } = req.body;

    try {
        // Verificar se o 'produtoNome' foi fornecido
        if (!produtoNome) {
            return res.status(400).json({ mensagem: 'Nome do produto não foi fornecido.' });
        }

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
        const produto = await Produto.findOne({ where: { nome: produtoNome } });
        if (!produto) {
            return res.status(404).json({ mensagem: 'Produto não encontrado.' });
        }

        // Verificando se há estoque suficiente
        if (produto.estoque < quantidade) {
            return res.status(400).json({ mensagem: 'Estoque insuficiente para realizar a venda.' });
        }

        // Criar a venda com IDs
        const venda = await Vendas.create({
            clienteId: cliente.id,     // Usar o ID do cliente
            vendedorId: vendedor.id,   // Usar o ID do vendedor
            produtoNome,               // Passando o nome do produto
            quantidade,
            total: produto.preco * quantidade,  // Calculando o total aqui
        });

        // Atualizar o estoque do produto
        produto.estoque -= quantidade;
        await produto.save();

        // Retornar a venda criada
        return res.status(201).json({
            clienteNome: cliente.nome,
            vendedorNome: vendedor.nome,
            produtoNome: produto.nome,
            quantidade,
            total: venda.total,  // Retornar o total calculado
        });

    } catch (error) {
        console.error('Erro ao criar venda:', error);
        return res.status(500).json({
            mensagem: 'Erro ao criar venda.',
            erro: error.message,
            stack: error.stack,
        });
    }
};

module.exports = {
    criarVenda,
};
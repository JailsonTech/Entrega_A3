const Cliente = require('../models/clientes');  // Ajuste o caminho conforme necessário
const Vendedor = require('../models/vendedores'); // Ajuste o caminho conforme necessário
const Produto = require('../models/produtos');   // Ajuste o caminho conforme necessário
const Vendas = require('../models/vendas');     // Ajuste o caminho conforme necessário

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
        const produto = await Produto.findOne({ where: { nome: produtoNome } });  // Alterado para 'produtoNome'
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
            produto_nome: produto.nome,     // Usar o nome do produto
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
            nome: produto.nome,
            quantidade,
            total,  // Retornar o total calculado
        });

    } catch (error) {
        console.error('Erro ao criar venda:', error);
        // Retornar informações detalhadas sobre o erro
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

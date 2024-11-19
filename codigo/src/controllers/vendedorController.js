// src/controllers/vendedorController.js
const Vendedor = require('../models/vendedores'); // Importa o modelo de Vendedores

// Função para criar um novo vendedor
exports.criarVendedor = async (req, res) => {
    try {
        const { nome, cpf } = req.body; // Pegando os dados do corpo da requisição

        // Verificar se todos os campos obrigatórios foram fornecidos
        if (!nome || !cpf) {
            return res.status(400).json({ message: 'Nome e CPF são obrigatórios' });
        }

        // Criação do vendedor no banco de dados
        const novoVendedor = await Vendedor.create({ nome, cpf });

        // Retornando o vendedor criado com status 201 (Created)
        res.status(201).json(novoVendedor);
    } catch (error) {
        // Em caso de erro, retornamos uma mensagem de erro
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar vendedor', error });
    }
};

// Função para obter todos os vendedores
exports.obterVendedores = async (req, res) => {
    try {
        const vendedores = await Vendedor.findAll(); // Buscar todos os vendedores no banco

        if (vendedores.length === 0) {
            return res.status(404).json({ message: 'Nenhum vendedor encontrado' });
        }

        // Retornando os vendedores encontrados com status 200 (OK)
        res.status(200).json(vendedores);
    } catch (error) {
        // Em caso de erro, retornamos uma mensagem de erro
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter vendedores', error });
    }
};

// Função para atualizar um vendedor
exports.atualizarVendedor = async (req, res) => {
    try {
        const { id } = req.params; // Pegando o id da URL
        const { nome, cpf } = req.body; // Pegando os dados do corpo da requisição

        // Encontrando o vendedor pelo id
        const vendedor = await Vendedor.findByPk(id);

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        // Atualizando os dados do vendedor
        vendedor.nome = nome || vendedor.nome;  // Mantém o valor atual se não for fornecido
        vendedor.cpf = cpf || vendedor.cpf; // Mantém o valor atual se não for fornecido

        // Salvando as mudanças no banco de dados
        await vendedor.save();

        // Retornando o vendedor atualizado
        res.status(200).json(vendedor);
    } catch (error) {
        // Em caso de erro, retornamos uma mensagem de erro
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar vendedor', error });
    }
};

// Função para deletar um vendedor
exports.deletarVendedor = async (req, res) => {
    try {
        const { id } = req.params; // Pegando o id da URL

        // Encontrando o vendedor pelo id
        const vendedor = await Vendedor.findByPk(id);

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        // Deletando o vendedor
        await vendedor.destroy();

        // Retornando resposta sem conteúdo (status 204)
        res.status(204).send();
    } catch (error) {
        // Em caso de erro, retornamos uma mensagem de erro
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar vendedor', error });
    }
};

// src/controllers/relatorioController.js

const Relatorios = require('../models/relatorios');
const { Op } = require('sequelize');
const Venda = require('../models/venda'); 
const Produtos = require('../models/produtos');
const Clientes = require('../models/clientes');

// Função para obter todos os relatórios.
const obterRelatorios = async (req, res) => {
    try {
        const relatorios = await Relatorios.findAll();
        return res.status(200).json(relatorios);
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ error: 'Erro ao buscar' });
    }
};

// Função para gerar relatório de produtos com baixo estoque
const relatorioBaixoEstoque = async (req, res) => {
    try {
        const LIMITE_ESTOQUE = 25; 
        const BaixoEstoque = await Produtos.findAll({
            where: {
                estoque: {
                    [Op.lt]: LIMITE_ESTOQUE, 
                }
            },
            limit: 5, 
            order: [['estoque', 'ASC']]  // Ordenar os produtos com menor estoque primeiro
        });

        const relatorio = await Relatorios.create({
            nome: 'Produtos com Baixo Estoque',
            tipo: 'baixo_estoque',
            dados: BaixoEstoque,
        });

        return res.status(200).json(relatorio);
    } catch (error) {
        console.error('Erro', error);
        return res.status(500).json({ error: 'Erro ao gerar' });
    }
};

// Função para deletar relatório
const deletarRelatorio = async (req, res) => {
    try {
        const { id } = req.params;
        const relatorio = await Relatorios.destroy({
            where: {
                id
            }
        });

        if (relatorio === 0) {
            return res.status(404).json({ error: 'Relatório não encontrado' });
        }

        return res.status(200).json({ message: `Relatório com ID ${id} deletado com sucesso` });
    } catch (error) {
        console.error('Erro', error);
        return res.status(500).json({ error: 'Erro' });
    }
};

module.exports = {
    relatorioBaixoEstoque,
    deletarRelatorio,
    obterRelatorios  
};

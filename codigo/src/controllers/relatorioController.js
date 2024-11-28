// src/controllers/relatorioController.js
const Relatorios = require('../models/relatorios');
const { Op } = require('sequelize');
const Produtos = require('../models/produtos');

// Função para obter todos os relatórios.
const obterRelatorios = async (req, res) => {
    try {
        const relatorios = await Relatorios.findAll();
        if (relatorios.length === 0) {
            return res.status(404).json({ message: 'Nenhum relatório encontrado.' });
        }
        return res.status(200).json(relatorios);
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ error: 'Erro ao buscar relatórios.' });
    }
};

// Função para gerar relatório de produtos com baixo estoque
const relatorioBaixoEstoque = async (req, res) => {
    try {
        const LIMITE_ESTOQUE = 30; 
        const BaixoEstoque = await Produtos.findAll({
            where: {
                estoque: {
                    [Op.lt]: LIMITE_ESTOQUE, 
                }
            },
            limit: 5, 
            order: [['estoque', 'ASC']]
        });

        // Verificar se já existe um relatório do tipo 'baixo_estoque'
        const relatorioExistente = await Relatorios.findOne({
            where: {
                tipo: 'baixo_estoque'
            }
        });

        if (relatorioExistente) {
            // Atualizar o relatório existente
            relatorioExistente.dados = BaixoEstoque; // Atualizar os dados do relatório
            await relatorioExistente.save();
            return res.status(200).json(relatorioExistente); 
        } else {
            // Criar um novo relatório
            const relatorio = await Relatorios.create({
                nome: 'Produtos com Baixo Estoque',
                tipo: 'baixo_estoque',
                dados: BaixoEstoque,
            });
            return res.status(200).json(relatorio); 
        }
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ error: 'Erro ao gerar ou atualizar o relatório' });
    }
};

// Função para deletar relatório
const deletarRelatorio = async (req, res) => {
    try {
        const { id } = req.params;
        const relatorio = await Relatorios.destroy({
            where: { id }
        });

        if (relatorio === 0) {
            return res.status(404).json({ error: 'Relatório não encontrado.' });
        }

        return res.status(200).json({ message: `Relatório com ID ${id} deletado com sucesso.` });
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ error: 'Erro ao deletar relatório.' });
    }
};

module.exports = {
    relatorioBaixoEstoque,
    deletarRelatorio,
    obterRelatorios, 
};
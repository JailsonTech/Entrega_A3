const Relatorios = require('../models/relatorios');
const { Sequelize, Op } = require('sequelize');
const sequelize = require('../utils/database');

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

// Função para obter um relatório específico por ID
const obterRelatorioPorId = async (req, res) => {
    try {
        const { id } = req.params;  // Obtém o ID da URL

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido ou nulo. Por favor, forneça um ID válido.' });
        }

        const relatorio = await Relatorios.findByPk(id);  // Busca o relatório pelo ID
        if (!relatorio) {
            return res.status(404).json({ message: 'Relatório não encontrado.' });
        }

        return res.status(200).json(relatorio);
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ error: 'Erro ao buscar o relatório.' });
    }
};

// Função para gerar relatório de produtos com baixo estoque
const relatorioBaixoEstoque = async (req, res) => {
    try {
        const LIMITE_ESTOQUE = 30;

        // Consulta direta ao banco de dados para buscar produtos com baixo estoque
        const BaixoEstoque = await sequelize.query(
            `SELECT * FROM produtos WHERE estoque < :limite ORDER BY estoque ASC LIMIT 5`,
            {
                replacements: { limite: LIMITE_ESTOQUE },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        // Verificar se já existe um relatório do tipo 'baixo_estoque'
        const relatorioExistente = await Relatorios.findOne({
            where: {
                tipo: { [Op.eq]: 'baixo-estoque' },
            },
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
                tipo: 'baixo-estoque',
                dados: BaixoEstoque,
            });
            return res.status(200).json(relatorio);
        }
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ error: 'Erro ao gerar ou atualizar o relatório' });
    }
};

const relatorioConsumoMedioId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido ou nulo. Por favor, forneça um ID válido.' });
        }

        const ConsumoMedio = await sequelize.query(
            `
            SELECT 
                c.id AS cliente_id,
                c.nome AS cliente_nome,
                COUNT(v.id) AS total_vendas,
                ROUND(SUM(v.total), 2) AS total_gasto,
                SUM(v.quantidade) AS total_produtos,
                COALESCE(ROUND(AVG(v.total), 2), 0) AS consumo_medio_valor,
                COALESCE(ROUND(AVG(v.quantidade), 0), 0) AS consumo_medio_produtos
            FROM clientes c
            INNER JOIN vendas v ON c.id = v.clienteId
            WHERE c.id = :clienteId
            GROUP BY c.id, c.nome
            ORDER BY total_gasto DESC;
            `,
            { 
                replacements: { clienteId: id },
                type: Sequelize.QueryTypes.SELECT 
            }
        );

        if (ConsumoMedio.length === 0) {
            return res.status(404).json({ message: 'Nenhuma relação de consumo encontrada para este cliente.' });
        }

        const relatorioExistente = await Relatorios.findOne({
            where: {
                tipo: { [Op.eq]: `consumo-medio-${id}` },
            },
        });

        if (relatorioExistente) {
            relatorioExistente.dados = ConsumoMedio;
            await relatorioExistente.save();
            return res.status(200).json(relatorioExistente);
        } else {
            const relatorio = await Relatorios.create({
                nome: `Relatório de Consumo Médio para Cliente ${id}`,
                tipo: `consumo-medio-${id}`,
                dados: ConsumoMedio,
            });
            return res.status(200).json(relatorio);
        }
    } catch (error) {
        console.error('Erro ao gerar relatório de consumo médio:', error);
        return res.status(500).json({ error: 'Erro ao gerar relatório de consumo médio.' });
    }
};

const relatorioConsumoMedio = async (req, res) => {
    try {
        const ConsumoMedio = await sequelize.query(
            `
            SELECT 
                c.id AS cliente_id,
                c.nome AS cliente_nome,
                COUNT(v.id) AS total_vendas,
                ROUND(SUM(v.total), 2) AS total_gasto,
                SUM(v.quantidade) AS total_produtos,
                COALESCE(ROUND(AVG(v.total), 2), 0) AS consumo_medio_valor,
                COALESCE(ROUND(AVG(v.quantidade), 0), 0) AS consumo_medio_produtos
            FROM clientes c
            INNER JOIN vendas v ON c.id = v.clienteId 
            GROUP BY c.id, c.nome
            ORDER BY total_gasto DESC;
            `,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (ConsumoMedio.length === 0) {
            return res.status(404).json({ message: 'Nenhuma relação de consumo encontrada para os clientes.' });
        }
        

        // Organiza os dados, colocando cliente_id e cliente_nome primeiro
        const relatorioFormatado = ConsumoMedio.map(cliente => {
            const consumo_medio = {
                total_vendas: cliente.total_vendas,
                total_gasto: cliente.total_gasto,
                total_produtos: cliente.total_produtos,
                consumo_medio_valor: cliente.consumo_medio_valor,
                consumo_medio_produtos: cliente.consumo_medio_produtos
            };

            return {
                cliente_id: cliente.cliente_id,
                cliente_nome: cliente.cliente_nome,
                consumo_medio // A chave 'consumo_medio' ficará por último
            };
        });

        const relatorioExistente = await Relatorios.findOne({
            where: {
                tipo: { [Op.eq]: 'consumo-medio' },
            },
        });

        if (relatorioExistente) {
            relatorioExistente.dados = relatorioFormatado;
            await relatorioExistente.save();
            return res.status(200).json(relatorioExistente);
        } else {
            const relatorio = await Relatorios.create({
                nome: 'Consumo Médio dos Clientes',
                tipo: 'consumo-medio',
                dados: relatorioFormatado,
            });
            return res.status(200).json(relatorio);
        }
    } catch (error) {
        console.error('Erro ao gerar relatório de consumo médio:', error);
        return res.status(500).json({ error: 'Erro ao gerar relatório de consumo médio.' });
    }
};

const relatorioProdutosCliente = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido ou nulo. Por favor, forneça um ID válido.' });
        }

        const ProdutosClientes = await sequelize.query(
            `
            SELECT 
                c.id AS cliente_id,
                c.nome AS cliente_nome,
                p.id AS produto_id,
                p.nome AS produto_nome,
                COUNT(v.id) AS total_compras,
                SUM(v.quantidade) AS quantidade_total
            FROM vendas v
            INNER JOIN clientes c ON v.clienteId = c.id
            INNER JOIN produtos p ON v.produtoId = p.id
            WHERE c.id = :clienteId
            GROUP BY c.id, c.nome, p.id, p.nome
            ORDER BY p.id;
            `,
            { 
                replacements: { clienteId: id },
                type: Sequelize.QueryTypes.SELECT 
            }
        );

        if (ProdutosClientes.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado para este cliente.' });
        }

        const relatorioFormatado = ProdutosClientes.map(cliente => ({
            cliente_id: cliente.cliente_id,
            cliente_nome: cliente.cliente_nome,
            produtos: ProdutosClientes.filter(produto => produto.cliente_id === cliente.cliente_id).map(produto => ({
                produto_id: produto.produto_id,
                produto_nome: produto.produto_nome,
                total_compras: produto.total_compras,
                quantidade_total: produto.quantidade_total,
            })),
        }))[0]; 

        const relatorioExistente = await Relatorios.findOne({
            where: {
                tipo: { [Op.eq]: `produto-cliente-${id}` },
            },
        });

        if (relatorioExistente) {
            relatorioExistente.dados = relatorioFormatado;
            await relatorioExistente.save();
            return res.status(200).json(relatorioExistente);
        } else {
            const relatorio = await Relatorios.create({
                nome: `Relatório de Produtos para Cliente ${id}`,
                tipo: `produto-cliente-${id}`,
                dados: relatorioFormatado,
            });
            return res.status(200).json(relatorio);
        }
    } catch (error) {
        console.error('Erro ao gerar relatório de produtos por cliente:', error);
        return res.status(500).json({ error: 'Erro ao gerar relatório de produtos por cliente.' });
    }
};


const relatorioMaisVendidos = async (req, res) => {
    try {
        const MaisVendidos = await sequelize.query(
            `
            SELECT 
                p.id AS produto_id,
                p.nome AS produto_nome,
                SUM(v.quantidade) AS quantidade_total,
                COUNT(v.id) AS total_vendas
            FROM vendas v
            INNER JOIN produtos p ON v.produtoId = p.id
            GROUP BY p.id, p.nome
            ORDER BY quantidade_total DESC
            LIMIT 3;
            `,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (MaisVendidos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto vendido encontrado.' });
        }

        const relatorioExistente = await Relatorios.findOne({
            where: {
                tipo: { [Op.eq]: 'mais-vendidos' },
            },
        });

        if (relatorioExistente) {
            relatorioExistente.dados = MaisVendidos;
            await relatorioExistente.save();
            return res.status(200).json(relatorioExistente);
        } else {
            const relatorio = await Relatorios.create({
                nome: 'Relatório de Produtos Mais Vendidos',
                tipo: 'mais-vendidos',
                dados: MaisVendidos,
            });
            return res.status(200).json(relatorio);
        }
    } catch (error) {
        console.error('Erro ao gerar relatório de produtos mais vendidos:', error);
        return res.status(500).json({ error: 'Erro ao gerar relatório de produtos mais vendidos.' });
    }
};

// Função para deletar relatório
const deletarRelatorio = async (req, res) => {
    try {
        const { id } = req.params;
        const relatorio = await Relatorios.destroy({
            where: { id },
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
    relatorioProdutosCliente,
    relatorioMaisVendidos,
    relatorioConsumoMedio,
    relatorioConsumoMedioId,
    relatorioBaixoEstoque,
    deletarRelatorio,
    obterRelatorios,
    obterRelatorioPorId,
};
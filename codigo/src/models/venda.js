// src/models/venda.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/database'); // Conexão com o DB
const Cliente = require('./clientes');  // Importa o modelo de Cliente
const Vendedor = require('./vendedores');  // Importa o modelo de Vendedor
const Produto = require('./produtos');  // Importa o modelo de Produto

// Definição do modelo de Vendas
const Venda = sequelize.define('venda', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1, // Garantir que a quantidade seja no mínimo 1
        },
    },
    total: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            min: 0.01, // Garante que o total seja maior que 0
        },
        // Cálculo do total baseado no preço do produto e quantidade
        get() {
            const quantidade = this.getDataValue('quantidade');
            const produtoId = this.getDataValue('produtoId');
            const produto = Produto.findByPk(produtoId); // Pega o produto pelo ID
            if (produto) {
                return produto.preco * quantidade;  // Calcula o total baseado no preço do produto
            }
            return 0;  // Retorna 0 se o produto não for encontrado
        },
    },
    data_venda: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Define a data da venda como a data atual
    },
}, {
    tableName: 'vendas',
    timestamps: false,  // Desativa os campos createdAt e updatedAt
});

// Definindo os relacionamentos
Venda.belongsTo(Cliente, { foreignKey: 'clienteId' });
Venda.belongsTo(Vendedor, { foreignKey: 'vendedorId' });
Venda.belongsTo(Produto, { foreignKey: 'produtoId' });

module.exports = Venda;

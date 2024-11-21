// src/models/Produtos.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/database'); // Conexão com o DB

// Definição do modelo de Produtos
const Produtos = sequelize.define('produtos', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    item: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    preco: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            min: 0.01, // Garante que o preço seja maior que 0
        },
    },
    estoque: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0, // Garante que o estoque não seja negativo
        },
    }
}, {
    tableName: 'produtos',  // Tabela com o nome em minúsculo
    timestamps: false,      // Desativa os campos createdAt e updatedAt
});

module.exports = Produtos;

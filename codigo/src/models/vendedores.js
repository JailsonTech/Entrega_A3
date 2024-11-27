// src/models/Vendedores.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/database'); // Conexão com o DB

// Definição do modelo de Vendedores
const Vendedores = sequelize.define('vendedores', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    endereco: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'vendedores',  // Tabela com o nome em minúsculo
    timestamps: false,        // Desativa os campos createdAt e updatedAt
});

module.exports = Vendedores;

// src/models/Clientes.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/database'); // Conexão com o DB

// Definição do modelo de Clientes
const Clientes = sequelize.define('clientes', { 
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
    tableName: 'clientes',  // Tabela com o nome em minúsculo
    timestamps: false,      // Desativa o gerenciamento automático de createdAt e updatedAt
});

module.exports = Clientes;

// src/models/relatorios.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Relatorios = sequelize.define('Relatorios', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,  // Tipo pode ser mais_vendidos, por_cliente, e etc.
    allowNull: false,
  },
  dados: {
    type: DataTypes.JSONB,  
    allowNull: false,
  },
});

module.exports = Relatorios;
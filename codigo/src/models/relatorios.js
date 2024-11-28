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
    type: DataTypes.STRING,  // Tipo pode ser mais_vendidos, por_cliente, etc.
    allowNull: false,
  },
  dados: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  data_relatorio: {
    type: DataTypes.DATEONLY,  
    allowNull: false,
    defaultValue: Sequelize.NOW,  
    get() {
      const data = this.getDataValue('data_relatorio');
      if (data && typeof data === 'string' && data.split) { // Erro com JSON Stringify, Corrigido validando a data.
        const [ano, mes, dia] = data.split('-');
        return `${dia}-${mes}-${ano}`; 
      }
      return data; 
    },
    set(value) {
        const [dia, mes, ano] = value.split('-');
        const formattedValue = `${ano}-${mes}-${dia}`;  
        this.setDataValue('data_relatorio', formattedValue);
      }
  },
}, {
  tableName: 'relatorios',
  timestamps: false,  
});

module.exports = Relatorios;

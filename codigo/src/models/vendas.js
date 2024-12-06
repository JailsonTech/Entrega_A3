const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');  // Conexão do Sequelize

// Definição do modelo 'Vendas'
const Vendas = sequelize.define('Vendas', {
    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clientes',  // Refere-se à tabela 'clientes'
            key: 'id'
        }
    },
    vendedorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'vendedores',  // Refere-se à tabela 'vendedores'
            key: 'id'
        }
    },
    produtoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'produtos',  // Refere-se à tabela 'produtos'
            key: 'id'
        }
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'vendas',  // Nome da tabela no banco de dados
    timestamps: false,     // Desabilitar timestamps
    underscored: true      // Garante que o Sequelize use a convenção snake_case para as colunas
});

module.exports = Vendas;

//models/vendas.js

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
    },
    data_venda: {
        type: DataTypes.DATEONLY, // Utiliza DATEONLY para armazenar somente a data
        allowNull: false,
        defaultValue: Sequelize.NOW, // Define a data da venda como a data atual
        get() {
            const data = this.getDataValue('data_venda'); // Recupera a data
            if (data) {
                const [ano, mes, dia] = data.split('-');
                return `${dia}-${mes}-${ano}`; // Formato d-m-a
            }
            return data; // Caso a data não exista, retorna undefined ou nulo
        },
        set(value) {
            // Força o formato para o banco de dados ser armazenado como 'YYYY-MM-DD'
            const [dia, mes, ano] = value.split('-');
            const formattedValue = `${ano}-${mes}-${dia}`; // Formato do banco de dados
            this.setDataValue('data_venda', formattedValue);
        }
    },
}, {
    tableName: 'vendas',
    timestamps: false,  // Desativa os campos createdAt e updatedAt
});

Venda.beforeCreate(async (venda, options) => {
    // Garantir que o total seja calculado corretamente
    const produto = await Produto.findOne({ where: { nome: venda.produtoNome } });
    if (!produto) {
        throw new Error('Produto não encontrado.');
    }
    venda.produtoId = produto.id;
    
    // Calcular o total da venda
    if (!venda.total) {
        venda.total = produto.preco * venda.quantidade;
    }
});

// Relacionamentos
Venda.belongsTo(Cliente, { foreignKey: 'clienteId', onDelete: 'CASCADE' });
Venda.belongsTo(Vendedor, { foreignKey: 'vendedorId', onDelete: 'CASCADE' });
Venda.belongsTo(Produto, { foreignKey: 'produtoId', onDelete: 'CASCADE' });

module.exports = Venda;

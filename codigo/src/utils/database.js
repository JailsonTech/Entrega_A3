// src/utils/database.js
const { Sequelize } = require('sequelize');

// Criação da instância do Sequelize, passando a URL de conexão com o banco de dados
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
});
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Função para conectar ao banco de dados
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        // Verificar o nome do banco de dados ao qual estamos conectando
        const [results, metadata] = await sequelize.query('SELECT current_database()');
        console.log('Conectado ao banco de dados:', results[0].current_database);
    } catch (err) {
        console.error('Não foi possível conectar ao banco de dados:', err);
        process.exit(1); // Encerra o processo em caso de erro de conexão
    }
};


connectDB();

module.exports = sequelize;

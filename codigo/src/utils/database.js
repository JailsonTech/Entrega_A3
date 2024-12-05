// src/utils/database.js
const { Sequelize } = require('sequelize');

// Criação da instância do Sequelize, passando a URL de conexão com o banco de dados
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,  // Desativa o log de SQL, pode ser ativado se necessário
});

// Função para conectar ao banco de dados
const connectDB = async () => {
    try {
        // Tenta autenticar a conexão com o banco
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        // Verificar o nome do banco de dados ao qual estamos conectando
        const [results, metadata] = await sequelize.query('SELECT current_database()');
        console.log('Conectado ao banco de dados:', results[0].current_database);

        // Sincronizar os modelos com o banco de dados
        await sequelize.sync({ force: false });  // Defina force: true apenas para desenvolvimento, para reiniciar o banco
        console.log('Modelos sincronizados com o banco de dados.');

    } catch (err) {
        console.error('Não foi possível conectar ao banco de dados:', err);
        process.exit(1); // Encerra o processo em caso de erro de conexão
    }
};

// Chama a função para conectar ao banco
connectDB();

module.exports = sequelize;
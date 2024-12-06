const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,  // Desativa o log de SQL
    pool: {
        max: 5,        // Máximo de 5 conexões simultâneas
        min: 0,        // Mínimo de 0 conexões simultâneas
        acquire: 30000, // Tempo máximo para tentar obter uma conexão antes de falhar
        idle: 10000     // Tempo máximo que uma conexão pode ficar ociosa antes de ser fechada
    },
});

const connectDB = async () => {
    try {
        // Conexão com o banco de dados
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        // Sincronização do banco de dados (sem force: true)
        const isDev = process.env.NODE_ENV === 'development';
        await sequelize.sync({ force: isDev });  // Use force: true apenas em desenvolvimento
        console.log('Modelos sincronizados com o banco de dados.');
    } catch (err) {
        console.error('Não foi possível conectar ao banco de dados:', err);
        process.exit(1); // Encerra o processo em caso de erro de conexão
    }
};

connectDB();

module.exports = sequelize;

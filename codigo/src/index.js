//src/index.js

const express = require('express');
const cors = require('cors');
const clienteRoutes = require('./routes/clienteRoutes');
const vendedorRoutes = require('./routes/vendedorRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const sequelize = require('./utils/database');

const app = express();

// Middlewares
app.use(cors());            // Permite requisições de outros domínios
app.use(express.json());    // Faz o parse do corpo da requisição como JSON

// Rotas
app.use('/api/clientes', clienteRoutes);    // Rota para clientes
app.use('/api/vendedores', vendedorRoutes); // Rota para vendedores
app.use('/api/produtos', produtoRoutes);   // Rota para produtos

// Função para verificar a conexão com o banco
const checkDbConnection = async () => {
    try {
        await sequelize.authenticate(); // Testa a conexão com o banco
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
    } catch (err) {
        console.error('Não foi possível conectar ao banco de dados:', err);
        process.exit(1); // Encerra o processo em caso de falha na conexão
    }
};

// Função para sincronizar o banco de dados
const syncDbAndStartServer = async () => {
    try {
        // Verifica a conexão com o banco antes de tentar sincronizar
        await checkDbConnection();

        // Sincroniza o banco de dados
        await sequelize.sync(); 

        // Inicia o servidor na porta configurada ou na porta 3000
        const port = process.env.PORT || 3000; 
        app.listen(port, () => {
            console.log(`Servidor rodando na porta ${port}`);
        });
    } catch (error) {
        console.error('Erro ao sincronizar com o banco de dados:', error);
        process.exit(1); // Encerra o processo se houver erro na sincronização com o DB
    }
};

// Inicia o servidor e sincroniza o banco
syncDbAndStartServer();

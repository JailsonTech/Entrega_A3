const express = require('express');
const cors = require('cors');

const sequelize = require('./utils/database');

const relatorioRoutes = require('./routes/relatorioRoutes');
const Relatorios = require ('./models/relatorios');

// Inicializa o servidor Express
const app = express();


// Middleware para processar JSON
app.use(express.json());  // Ao invés de bodyParser.json()
app.use(cors());            // Permite requisições de outros domínios

// Middleware para capturar erros de sintaxe JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) { // Se o erro for de sintaxe JSON
        return res.status(400).json({ message: 'Erro no formato do JSON. Certifique-se de que os dados estão corretos' });
    }
    next(); // Se o erro não for de sintaxe, passa para o próximo middleware ou controlador
});


// Rotas
app.use('/relatorios', relatorioRoutes);

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

// Função para sincronizar o banco de dados e iniciar o servidor
const syncDbAndStartServer = async () => {
    try {
        // Verifica a conexão com o banco antes de tentar sincronizar
        await checkDbConnection();

        // Sincroniza o banco de dados (não recria tabelas, caso já existam)
        await sequelize.sync({ force: false });

        // Inicia o servidor na porta configurada ou na porta 3030
        const port = process.env.PORT || 3030;
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
const express = require('express');
const cors = require('cors');
const clienteRoutes = require('./routes/clienteRoutes');
const vendedorRoutes = require('./routes/vendedorRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes'); // Importando as rotas de vendas
const pedidoCompraRoutes = require('./routes/pedidoCompraRoutes'); // Importando as rotas de pedidos de compra
const sequelize = require('./utils/database');  // Conexão com o banco de dados

const app = express();

// Middlewares
app.use(cors());            // Permite requisições de outros domínios
app.use(express.json());    // Faz o parse do corpo da requisição como JSON

// Middleware para capturar erros de sintaxe JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) { // Se o erro for de sintaxe JSON
        return res.status(400).json({ message: 'Erro no formato do JSON. Certifique-se de que os dados estão corretos' });
    }
    next(); // Se o erro não for de sintaxe, passa para o próximo middleware ou controlador
});

// Rotas
app.use('/clientes', clienteRoutes);    // Rota para clientes
app.use('/vendedores', vendedorRoutes); // Rota para vendedores
app.use('/produtos', produtoRoutes);   // Rota para produtos
app.use('/vendas', vendaRoutes);       // Rota para vendas
app.use('/pedidos', pedidoCompraRoutes); // Rota para pedidos de compra

// Middleware para capturar métodos HTTP incorretos em qualquer rota "/clientes/*"
app.all('/clientes/*', (req, res) => {
    res.status(405).json({ message: `Método HTTP ${req.method} não permitido para esta rota. Use o método correto de acordo com a tabela de rotas. Leia o readme.md` });
});

// Middleware para capturar métodos HTTP incorretos em qualquer rota "/vendedores/*"
app.all('/vendedores/*', (req, res) => {
    res.status(405).json({ message: `Método HTTP ${req.method}  não permitido para esta rota. Use o método correto de acordo com a tabela de rotas. Leia o readme.md` });
});

// Middleware para capturar métodos HTTP incorretos em qualquer rota "/produtos/*"
app.all('/produtos/*', (req, res) => {
    res.status(405).json({ message: `Método HTTP ${req.method} não permitido para esta rota. Use o método correto de acordo com a tabela de rotas. Leia o readme.md` });
});

// Middleware para capturar métodos HTTP incorretos em qualquer rota "/pedidos/*"
app.all('/pedidos/*', (req, res) => {
    res.status(405).json({ message: `Método HTTP ${req.method} não permitido para esta rota. Use o método correto de acordo com a tabela de rotas. Leia o readme.md` });
});

// Middleware para capturar métodos HTTP incorretos em qualquer rota "/vendas/*"
app.all('/vendas/*', (req, res) => {
    res.status(405).json({ message: `Método HTTP ${req.method} não permitido para esta rota. Use o método correto de acordo com a tabela de rotas. Leia o readme.md` });
});

// Middleware para capturar métodos HTTP incorretos em qualquer rota "/relatorios/*"
app.all('/relatorios/*', (req, res) => {
    res.status(405).json({ message: `Método HTTP ${req.method} não permitido para esta rota. Use o método correto de acordo com a tabela de rotas. Leia o readme.md` });
});

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

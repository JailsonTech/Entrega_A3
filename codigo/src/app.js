const express = require('express');
const cors = require('cors');
const clienteRoutes = require('./routes/clienteRoutes');
const vendedorRoutes = require('./routes/vendedorRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes'); // Importando as rotas de vendas
const sequelize = require('./utils/database');
const Clientes = require('./models/clientes');
const Vendedores = require('./models/vendedores');
const Produtos = require('./models/produtos');

const app = express();

// Middlewares
app.use(cors());            // Permite requisições de outros domínios
app.use(express.json());    // Faz o parse do corpo da requisição como JSON

// Rotas
app.use('/clientes', clienteRoutes);    // Rota para clientes
app.use('/vendedores', vendedorRoutes); // Rota para vendedores
app.use('/produtos', produtoRoutes);   // Rota para produtos
app.use('/vendas', vendaRoutes);       // Rota para vendas

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

// Função para inserir dados iniciais nas tabelas, caso não existam
const inserirDadosIniciais = async () => {
    // Verificar se há clientes
    const clientesCount = await Clientes.count();
    if (clientesCount === 0) {
        await Clientes.bulkCreate([
            { nome: 'Jailson', cpf: '111.222.333-44', endereco: 'Endereço 1' },
            { nome: 'Carlos', cpf: '555.666.777-88', endereco: 'Endereço 2' },
            { nome: 'Roberto', cpf: '777.888.999-00', endereco: 'Endereço 3' },
            { nome: 'Julia', cpf: '245.898.789-08', endereco: 'Endereço 3' },
            { nome: 'Larissa', cpf: '734.848.949-40', endereco: 'Endereço 4' }
        ]);
        console.log('Dados de clientes inseridos.');
    }

    // Verificar se há vendedores
    const vendedoresCount = await Vendedores.count();
    if (vendedoresCount === 0) {
        await Vendedores.bulkCreate([
            { nome: 'Alberto', cpf: '157.177.158-61' },
            { nome: 'Suzana', cpf: '272.852.292-26' }
        ]);
        console.log('Dados de vendedores inseridos.');
    }

    // Verificar se há produtos
    const produtosCount = await Produtos.count();
    if (produtosCount === 0) {
        await Produtos.bulkCreate([
            { item: 'feijão', preco: 6.99, estoque: 100 },
            { item: 'arroz', preco: 4.00, estoque: 90 },
            { item: 'macarrão', preco: 4.49, estoque: 75 },
            { item: 'farinha', preco: 8.99, estoque: 95 },
            { item: 'sal', preco: 2.79, estoque: 58 },
            { item: 'açúcar', preco: 5.99, estoque: 12 },
            { item: 'vinagre', preco: 9.99, estoque: 25 },
            { item: 'azeite', preco: 28.99, estoque: 48 },
            { item: 'tapioca', preco: 4.99, estoque: 36 },
            { item: 'detergente', preco: 2.29, estoque: 66 }
        ]);
        console.log('Dados de produtos inseridos.');
    }
};

// Função para sincronizar o banco de dados e iniciar o servidor
const syncDbAndStartServer = async () => {
    try {
        // Verifica a conexão com o banco antes de tentar sincronizar
        await checkDbConnection();

        // Sincroniza o banco de dados (não recria tabelas, caso já existam)
        await sequelize.sync({ force: false }); 

        // Inserir os dados iniciais
        await inserirDadosIniciais();

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

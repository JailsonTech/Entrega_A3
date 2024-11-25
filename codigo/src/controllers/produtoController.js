const { Op } = require('sequelize');
const Produtos = require('../models/produtos'); 

const {
    validarNomeProduto,
    validarPreco,
    validarEstoque,
    validarCamposObrigatoriosProduto,
    validarIdProduto,
    verificarProdutoExistente,
    formatarPreco 
} = require('../utils/validacoes'); // Importando as funções de validação

// Função para criar um novo produto
exports.criarProduto = async (req, res) => {
    try {
        const { nome, preco, estoque } = req.body;

        // Validação de campos obrigatórios
        const camposInvalidos = validarCamposObrigatoriosProduto(nome, preco, estoque);
        if (camposInvalidos) {
            return res.status(400).json({ message: camposInvalidos });
        }

        // Validação do nome do produto (apenas letras e espaços)
        if (!validarNomeProduto(nome)) {
            return res.status(400).json({ message: 'Nome do produto inválido. Apenas letras e espaços são permitidos.' });
        }

        // Validação do preço (deve ser maior que 0)
        const precoValidado = validarPreco(preco);
        if (!precoValidado.valid) {
            return res.status(400).json({ message: precoValidado.message });
        }

        // Validação de estoque (deve ser um número inteiro não negativo)
        if (!validarEstoque(estoque)) {
            return res.status(400).json({ message: 'Estoque deve ser um número inteiro não negativo.' });
        }

        // Verificar se o produto já existe no banco de dados
        const produtoExistente = await verificarProdutoExistente(Produtos, nome);
        if (produtoExistente) {
            return res.status(400).json({ message: 'Produto já cadastrado com esse nome.' });
        }

        // Formatar o preço para garantir 2 casas decimais
        const precoFormatado = formatarPreco(preco);

        // Criando o novo produto
        const novoProduto = await Produtos.create({ nome, preco: precoFormatado, estoque });

        res.status(201).json({
            message: 'Produto criado com sucesso!',
            produto: novoProduto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar produto.', error });
    }
};

// Função para obter todos os produtos
exports.obterProdutos = async (req, res) => {
    try {
        const produtos = await Produtos.findAll();

        if (produtos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado.' });
        }

        res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter produtos.', error });
    }
};

// Função para obter um produto por nome
exports.obterProdutoPorNome = async (req, res) => {
    try {
        const { nome } = req.params;

        if (!nome) {
            return res.status(400).json({ message: 'Parâmetro "nome" é obrigatório.' });
        }

        // Validando o nome do produto (apenas letras e espaços)
        if (!validarNomeProduto(nome)) {
            return res.status(400).json({ message: 'Nome de produto inválido. Apenas letras e espaços são permitidos.' });
        }

        // Busca insensível a maiúsculas e minúsculas
        const produtos = await Produtos.findAll({
            where: {
                nome: {
                    [Op.iLike]: `%${nome}%`, // Busca insensível a maiúsculas/minúsculas
                },
            },
        });

        if (produtos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado com esse nome.' });
        }

        res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produto por nome.', error });
    }
};

// Função para obter um produto por ID
exports.obterProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Validação do ID (verifica se é um número inteiro positivo)
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({ message: 'ID inválido. O ID deve ser um número inteiro positivo.' });
        }

        // Buscar produto pelo ID
        const produto = await Produtos.findByPk(id); // Encontra o produto pelo ID

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        res.status(200).json(produto); // Retorna o produto encontrado
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produto por ID.', error });
    }
};

// Função para atualizar um produto pelo id
exports.atualizarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, preco, estoque } = req.body;

        // Verificar se pelo menos um campo foi informado
        if (!nome && preco === undefined && estoque === undefined) {
            return res.status(400).json({ message: 'Pelo menos um campo deve ser informado: nome, preco ou estoque.' });
        }

        // Buscar o produto pelo ID
        const produto = await Produtos.findByPk(id);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Variável para armazenar a mensagem de sucesso
        let mensagem = '';
        let nenhumaAlteracao = true; // Flag para verificar se houve alteração

        // Comparar e verificar alterações no nome
        if (nome && nome !== produto.nome) {
            produto.nome = nome;
            mensagem += 'Nome do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Comparar e verificar alterações no preço
        if (preco !== undefined && preco !== produto.preco) {
            produto.preco = formatarPreco(preco); // Formatar preço antes de salvar
            mensagem += 'Preço do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Comparar e verificar alterações no estoque
        if (estoque !== undefined && estoque !== produto.estoque) {
            produto.estoque = estoque;
            mensagem += 'Estoque do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Se não houve alteração, retornar mensagem de nenhuma alteração
        if (nenhumaAlteracao) {
            return res.status(200).json({
                message: 'Nenhuma alteração realizada.',
                produto,
            });
        }

        // Salvar as alterações
        await produto.save();

        // Retornando a mensagem caso haja alteração
        res.status(200).json({
            message: mensagem.trim(), // Remove espaços extras no final da mensagem
            produto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto.', error });
    }
};

// Função para atualizar um produto pelo nome
exports.atualizarProdutoPorNome = async (req, res) => {
    try {
        const { nome } = req.params;
        const { nome: novoNome, preco, estoque } = req.body;

        // Verificar se pelo menos um campo foi informado
        if (!novoNome && preco === undefined && estoque === undefined) {
            return res.status(400).json({ message: 'Pelo menos um campo deve ser informado: nome, preco ou estoque.' });
        }

        // Buscando o produto pelo nome
        const produto = await Produtos.findOne({ where: { nome } });
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Variável para armazenar a mensagem de sucesso
        let mensagem = '';
        let nenhumaAlteracao = true; // Flag para verificar se houve alteração

        // Comparar e verificar alterações no nome
        if (novoNome && novoNome !== produto.nome) {
            produto.nome = novoNome;
            mensagem += 'Nome do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Comparar e verificar alterações no preço
        if (preco !== undefined && preco !== produto.preco) {
            produto.preco = formatarPreco(preco); // Formatar preço antes de salvar
            mensagem += 'Preço do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Comparar e verificar alterações no estoque
        if (estoque !== undefined && estoque !== produto.estoque) {
            produto.estoque = estoque;
            mensagem += 'Estoque do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Se não houve alteração, retornar mensagem de nenhuma alteração
        if (nenhumaAlteracao) {
            return res.status(200).json({
                message: 'Nenhuma alteração realizada.',
                produto,
            });
        }

        // Salvar as alterações
        await produto.save();

        // Retornando a mensagem caso haja alteração
        res.status(200).json({
            message: mensagem.trim(), // Remove espaços extras no final da mensagem
            produto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto.', error });
    }
};


// Função para deletar um produto
exports.deletarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const produto = await Produtos.findByPk(id);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        await produto.destroy();

        res.status(200).json({ message: 'Produto deletado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar produto.', error });
    }
};

// Função para deletar um produto pelo nome
exports.deletarProdutoPorNome = async (req, res) => {
    try {
        const { nome } = req.params;  // Pegando o nome do produto via parâmetros da URL

        // Buscando o produto pelo nome
        const produto = await Produtos.findOne({ where: { nome } });

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Deletando o produto
        await produto.destroy();

        res.status(200).json({ message: 'Produto deletado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar produto.', error });
    }
};

exports.deletarTodosProdutos = async (req, res) => {
    try {
        // Deletar os produtos da tabela 'produtos'
        await Produtos.destroy({
            where: {}, // Condição vazia para deletar todos os registros
            force: true, // Forçar a exclusão dos dados
        });

        res.status(200).json({ message: 'Todos os produtos foram deletados com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar produtos.', error });
    }
};





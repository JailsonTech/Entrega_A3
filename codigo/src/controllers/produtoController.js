//src/controllers/produtoController.js

const { Op } = require('sequelize');
const Produtos = require('../models/produtos'); 

const {
    validarNomeProduto,
    validarPreco,
    validarEstoque,
    validarId

} = require('../utils/validacoes'); // Importando as funções de validação


// Função para criar um novo produto
exports.criarProduto = async (req, res) => {
    try {
        const { nome, preco, estoque } = req.body;

        // Validação de campos obrigatórios (nome, preco e estoque devem ser informados)
        if (!req.body.hasOwnProperty('nome') || !nome) {
            return res.status(400).json({ message: "Chave 'nome' errada ou ausente." });
        }

        if (!req.body.hasOwnProperty('preco') || !preco) {
            return res.status(400).json({ message: "Chave 'preco' errada ou ausente." });
        }

        if (!req.body.hasOwnProperty('estoque') || estoque === undefined) {
            return res.status(400).json({ message: "Chave 'estoque' errada ou ausente." });
        }

        // Validando o nome do produto (apenas letras e espaços)
        const erroNomeProduto = validarNomeProduto(nome);  // Função que valida o nome
        if (erroNomeProduto) {
            return res.status(400).json({ message: erroNomeProduto });
        }

        // Verificar se o produto já existe no banco de dados
        const produtoExistente = await Produtos.findOne({ where: { nome } });
        if (produtoExistente) {
            return res.status(400).json({ message: 'Produto já cadastrado com esse nome.' });
        }

        // Validar o preço
        const validacaoPreco = validarPreco(preco);  // Função que valida o preço
        if (!validacaoPreco.valid) {
            return res.status(400).json({ message: validacaoPreco.message });
        }
        const precoFloat = validacaoPreco.precoNumerico;

        // Validar o estoque
        const validacaoEstoque = validarEstoque(estoque);  // Função que valida o estoque

        // Verificar se a validação falhou (valid: false)
        if (!validacaoEstoque.valid) {
            return res.status(400).json({ message: validacaoEstoque.message });
        }

        // Criar o produto diretamente no banco de dados
        const novoProduto = await Produtos.create({
            nome,
            preco: precoFloat,  // Armazenando o preço como número
            estoque
        });

        // Retornar a resposta com sucesso
        res.status(201).json({
            message: 'Produto criado com sucesso!',
            produto: novoProduto,
        });
    } catch (error) {
        console.error(error);
        // Tratar erro de violação de chave única
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Produto já cadastrado com esse nome.' });
        }

        // Para outros erros
        res.status(500).json({ message: 'Erro ao criar produto.', error: error.message });
    }
};

exports.atualizarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;  // ID do produto vindo da URL
        const { nome, preco, estoque } = req.body;  // Dados a serem atualizados

        // Validar o ID
        const erroId = validarId(id);  // Função que valida o ID
        if (erroId) {
            return res.status(400).json({ message: erroId });
        }

        // Verificar se o corpo da requisição contém chaves erradas 
        const chavesValidas = ['nome', 'preco', 'estoque'];
        const chavesRecebidas = Object.keys(req.body);
        
        // Se houver chaves não válidas no corpo
        for (let chave of chavesRecebidas) {
            if (!chavesValidas.includes(chave)) {
                return res.status(400).json({ message: `Chave '${chave}' errada ou ausente.` });
            }
        }

        // Verificar se o produto existe
        const produto = await Produtos.findByPk(id);
        if (!produto) {
            return res.status(404).json({ message: `Produto com o ID ${id} não encontrado.` });
        }

        // Variável para armazenar as mensagens de sucesso
        let mensagensAlteradas = [];
        let nenhumaAlteracao = true; // Flag para verificar se houve alteração

        // Comparar e verificar alterações no nome
        if (nome && nome !== produto.nome) {
            // Validando o nome do produto (apenas letras e espaços)
            const erroNomeProduto = validarNomeProduto(nome);  // Função que valida o nome
            if (erroNomeProduto) {
                return res.status(400).json({ message: erroNomeProduto });
            }
            produto.nome = nome;
            mensagensAlteradas.push("Nome do produto alterado com sucesso!");
            nenhumaAlteracao = false;
        }

        // Comparar e verificar alterações no preço
        if (preco !== undefined && preco !== produto.preco) {
            const validacaoPreco = validarPreco(preco);
            if (!validacaoPreco.valid) {
                return res.status(400).json({ message: validacaoPreco.message });
            }
            produto.preco = validacaoPreco.precoNumerico;  // Atualizando o preço
            mensagensAlteradas.push("Preço do produto alterado com sucesso!");
            nenhumaAlteracao = false;
        }

        // Validar o estoque antes de atualizar
        if (estoque !== undefined && estoque !== produto.estoque) {
            const validacaoEstoque = validarEstoque(estoque);
            if (!validacaoEstoque.valid) {
                return res.status(400).json({ message: validacaoEstoque.message });
            }
            produto.estoque = estoque;  // Atualizando o estoque
            mensagensAlteradas.push("Estoque do produto alterado com sucesso!");
            nenhumaAlteracao = false;
        }

        // Se não houve alteração, retornar mensagem de nenhuma alteração
        if (nenhumaAlteracao) {
            return res.status(200).json({
                message: 'Nenhuma alteração realizada.',
                produto,
            });
        }

        // Salvar as alterações no banco de dados
        await produto.save();

        // Se os campos foram alterados, cria a mensagem combinada
        const mensagemSucesso = mensagensAlteradas.join(" "); // Junta todas as mensagens

        // Retornar a resposta com a mensagem de sucesso e os dados atualizados
        res.status(200).json({
            message: mensagemSucesso,
            produto: {
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                estoque: produto.estoque // Incluir o estoque atualizado
            }
        });

    } catch (error) {
        console.error("Erro ao atualizar produto:", error);

        // Caso o erro seja um objeto e tenha uma mensagem
        const mensagemErro = error.message || 'Erro desconhecido ao atualizar produto';

        // Retorne a resposta com a mensagem de erro detalhada
        return res.status(500).json({
            message: mensagemErro,
            error: error
        });
    }
};

/// Função para atualizar produto por nome
exports.atualizarProdutoPorNome = async (req, res) => {
    try {
        const { nome } = req.params; // Nome do produto para localizar
        const { nome: novoNome, preco, estoque } = req.body; // Novos valores para o produto

        // Validação das chaves para garantir que não há chaves inesperadas
        const chavesValidas = ['nome', 'preco', 'estoque'];
        const chavesRecebidas = Object.keys(req.body);
        const chavesInvalidas = chavesRecebidas.filter(chave => !chavesValidas.includes(chave));

        if (chavesInvalidas.length > 0) {
            return res.status(400).json({ message: `Chave(s) inválida(s): ${chavesInvalidas.join(', ')}` });
        }

        // Buscar o produto pelo nome
        const produto = await Produtos.findOne({ where: { nome } });
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Variável para armazenar a mensagem de sucesso
        let mensagem = '';
        let nenhumaAlteracao = true; // Flag para verificar se houve alteração

        // Validar o novo nome do produto, se foi informado
        if (novoNome !== undefined && novoNome !== produto.nome) {
            // Verificar se já existe outro produto com o novo nome
            const produtoComMesmoNome = await Produtos.findOne({ where: { nome: novoNome } });
            if (produtoComMesmoNome) {
                return res.status(400).json({ message: 'Produto com esse nome já existe.' });
            }

            // Validando o nome do produto usando a função de validação externa
            const erroNomeProduto = validarNomeProduto(novoNome);  // Função que valida o nome
            if (erroNomeProduto) {
                return res.status(400).json({ message: erroNomeProduto });
            }

            produto.nome = novoNome;
            mensagem += 'Nome do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Validar o preço, se foi informado
        if (preco !== undefined && preco !== produto.preco) {
            const validacaoPreco = validarPreco(preco);  // Função que valida o preço
            if (!validacaoPreco.valid) {
                return res.status(400).json({ message: validacaoPreco.message });
            }
            produto.preco = validacaoPreco.precoNumerico; // Atualiza o preço
            mensagem += 'Preço do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Validar o estoque, se foi informado
        if (estoque !== undefined && estoque !== produto.estoque) {
            const validacaoEstoque = validarEstoque(estoque);  // Função que valida o estoque
            if (!validacaoEstoque.valid) {
                return res.status(400).json({ message: validacaoEstoque.message });
            }
            produto.estoque = estoque;  // Atualiza o estoque
            mensagem += 'Estoque do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Se não houve alteração, retornar mensagem de nenhuma alteração
        if (nenhumaAlteracao) {
            return res.status(200).json({
                message: 'Nenhuma atualização foi feita.',
                produto,
            });
        }

        // Atualizar as alterações no banco de dados diretamente com o Sequelize
        await produto.update({
            nome: produto.nome,
            preco: produto.preco,
            estoque: produto.estoque,
        });

        res.status(200).json({
            message: mensagem.trim(),  // A mensagem é retornada sem espaços extras
            produto, // Retorna o produto atualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto.', error: error.message });
    }
};

// Função para deletar um produto
exports.deletarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Validação do ID usando a função de validação
        const erroValidacaoId = validarId(id);
        if (erroValidacaoId) {
            return res.status(400).json({ message: erroValidacaoId });
        }

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
        const { nome } = req.params;

        // Validando o nome do produto (apenas letras e espaços)
        const erroNomeProduto = validarNomeProduto(nome);  // Função que valida o nome
        if (erroNomeProduto) {
            return res.status(400).json({ message: erroNomeProduto });
        }

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
        const erroNomeProduto = validarNomeProduto(nome);  // Função que valida o nome
        if (erroNomeProduto) {
            return res.status(400).json({ message: erroNomeProduto });
        }

        // Busca insensível a maiúsculas e minúsculas
        const produtos = await Produtos.findAll({
            where: {
                nome: {
                    [Op.iLike]: `%${nome}%`,
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

        // Validação do ID usando a função de validação
        const erroValidacaoId = validarId(id);
        if (erroValidacaoId) {
            return res.status(400).json({ message: erroValidacaoId });
        }

        const produto = await Produtos.findByPk(id);

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        res.status(200).json(produto);
    } catch (error) {
        console.error('Erro ao buscar produto por ID:', error); // Mensagem de erro mais detalhada
        res.status(500).json({ message: 'Erro ao buscar produto por ID.', error: error.message }); // Exibindo a mensagem de erro
    }
};

// Função para obter o estoque de um produto por nome
exports.obterEstoquePorNome = async (req, res) => {
    try {
        const { nome } = req.params; // Nome do produto

        if (!nome) {
            return res.status(400).json({ message: 'Parâmetro "nome" é obrigatório.' });
        }        

        // Buscar o produto pelo nome
        const produto = await Produtos.findOne({
            where: { nome },
            attributes: ['nome', 'estoque'] // Retorna apenas nome e estoque
        });

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // Retornar apenas o nome e o estoque do produto
        res.status(200).json({
            nome: produto.nome,
            estoque: produto.estoque
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar estoque do produto.', error: error.message });
    }
};



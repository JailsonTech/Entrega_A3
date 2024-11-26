const { Op } = require('sequelize');
const Produtos = require('../models/produtos'); 

const {
    validarNomeProduto,
    validarPreco,
    validarEstoque,
    validarCamposObrigatoriosProduto,
    validarIdProduto,
    verificarProdutoExistente

} = require('../utils/validacoes'); // Importando as funções de validação

// Função para criar um novo produto
exports.criarProduto = async (req, res) => {
    try {
        const { nome, preco, estoque } = req.body;

        // Verifica se 'nome' é uma string
        if (typeof nome !== 'string') {
            return res.status(400).json({ message: `'${nome}' deve ser uma string válida.` });
        }

        // Validação de campos obrigatórios
        const camposInvalidos = validarCamposObrigatoriosProduto(nome, preco, estoque);
        if (camposInvalidos) {
            return res.status(400).json({ message: camposInvalidos });
        }

        // Validando o nome do produto
        if (!validarNomeProduto(nome)) {
            return res.status(400).json({ message: 'Nome de produto inválido. Apenas letras e espaços são permitidos.' });
        }

        // Verificar se o produto já existe no banco de dados
        const produtoExistente = await verificarProdutoExistente(Produtos, nome);
        if (produtoExistente) {
            return res.status(400).json({ message: 'Produto já cadastrado com esse nome.' });
        }

        // Validar o preço
        const validacaoPreco = validarPreco(preco);
        if (!validacaoPreco.valid) {
            return res.status(400).json({ message: validacaoPreco.message });
        }
        const precoFloat = validacaoPreco.precoNumerico;

        // Validar o estoque
        const validacaoEstoque = validarEstoque(estoque);
        if (!validacaoEstoque.valid) {
            return res.status(400).json({ message: validacaoEstoque.message });
        }

        // Criar o produto diretamente no banco de dados
        const novoProduto = await Produtos.create({
            nome,
            preco: precoFloat, // Armazenando o preço como número
            estoque
        });

        res.status(201).json({
            message: 'Produto criado com sucesso!',
            produto: novoProduto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar produto.', error: error.message });
    }
};

// Função para atualizar produto por ID
exports.atualizarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, preco, estoque } = req.body;

        // Validação de campos obrigatórios (no caso de nome, preco ou estoque estarem presentes)
        const camposInvalidos = validarCamposObrigatoriosProduto(nome, preco, estoque);
        if (camposInvalidos) {
            return res.status(400).json({ message: camposInvalidos });
        }

        // Validação do ID usando a função de validação
        const erroValidacaoId = validarIdProduto(id);
        if (erroValidacaoId) {
            return res.status(400).json({ message: erroValidacaoId });
        }

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
            const produtoComMesmoNome = await Produtos.findOne({ where: { nome } });
            if (produtoComMesmoNome) {
                return res.status(400).json({ message: 'Produto com esse nome já existe.' });
            }
            produto.nome = nome;
            mensagem += 'Nome do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Comparar e verificar alterações no preço
        if (preco !== undefined && preco !== produto.preco) {
            const validacaoPreco = validarPreco(preco);
            if (!validacaoPreco.valid) {
                return res.status(400).json({ message: validacaoPreco.message });
            }
            produto.preco = validacaoPreco.precoNumerico; // Atualizando o preço
            mensagem += 'Preço do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Validar o estoque antes de atualizar
        if (estoque !== undefined && estoque !== produto.estoque) {
            const validacaoEstoque = validarEstoque(estoque);
            if (!validacaoEstoque.valid) {
                return res.status(400).json({ message: validacaoEstoque.message });
            }
            produto.estoque = estoque; // Atualiza o estoque
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
            estoque: produto.estoque
        });

        res.status(200).json({
            message: mensagem.trim(),
            produto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto.', error: error.message });
    }
};

// Função para atualizar produto por nome
exports.atualizarProdutoPorNome = async (req, res) => {
    try {
        const { nome } = req.params; // Nome do produto para localizar
        const { nome: novoNome, preco, estoque } = req.body; // Novos valores para o produto

        // Validação de campos obrigatórios (no caso de nome, preco ou estoque estarem presentes)
        const camposInvalidos = validarCamposObrigatoriosProduto(novoNome, preco, estoque);
        if (camposInvalidos) {
            return res.status(400).json({ message: camposInvalidos });
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
        if (novoNome && novoNome !== produto.nome) {
            // Verificar se já existe outro produto com o novo nome
            const produtoComMesmoNome = await Produtos.findOne({ where: { nome: novoNome } });
            if (produtoComMesmoNome) {
                return res.status(400).json({ message: 'Produto com esse nome já existe.' });
            }

            // Validar o formato do novo nome
            if (!validarNomeProduto(novoNome)) {
                return res.status(400).json({ message: 'Nome de produto inválido. Apenas letras e espaços são permitidos.' });
            }

            produto.nome = novoNome;
            mensagem += 'Nome do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Validar o preço, se foi informado
        if (preco !== undefined && preco !== produto.preco) {
            const validacaoPreco = validarPreco(preco);
            if (!validacaoPreco.valid) {
                return res.status(400).json({ message: validacaoPreco.message });
            }
            produto.preco = validacaoPreco.precoNumerico; // Atualiza o preço
            mensagem += 'Preço do produto atualizado com sucesso. ';
            nenhumaAlteracao = false;
        }

        // Validar o estoque, se foi informado
        if (estoque !== undefined && estoque !== produto.estoque) {
            const validacaoEstoque = validarEstoque(estoque);
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

        // Atualizar as alterações no banco de dados diretamente
        await produto.update({
            nome: produto.nome,
            preco: produto.preco,
            estoque: produto.estoque
        });

        res.status(200).json({
            message: mensagem.trim(),
            produto,
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
        const erroValidacaoId = validarIdProduto(id);
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

        // Validar o nome do produto antes de tentar deletá-lo
        if (!validarNomeProduto(nome)) {
            return res.status(400).json({ message: 'Nome de produto inválido. Apenas letras e espaços são permitidos.' });
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

        // Validando o nome do produto
        if (!validarNomeProduto(nome)) {
            return res.status(400).json({ message: 'Nome de produto inválido. Apenas letras e espaços são permitidos.' });
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
        const erroValidacaoId = validarIdProduto(id);
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
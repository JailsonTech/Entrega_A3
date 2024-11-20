const { Sequelize } = require('sequelize'); // Importando Sequelize para usar os operadores
const Cliente = require('../models/clientes'); // Importando o modelo Cliente

// Função para criar um novo cliente
exports.criarCliente = async (req, res) => {
    try {
        const { nome, cpf, endereco } = req.body;

        // Verificar se todos os campos obrigatórios foram fornecidos
        if (!nome || !cpf) {
            return res.status(400).json({ message: 'Nome e CPF são obrigatórios' });
        }

        // Verificando se o CPF já existe
        const clienteExistente = await Cliente.findOne({ where: { cpf } });
        if (clienteExistente) {
            return res.status(400).json({ message: 'CPF já cadastrado, Insira outro.' });
        }

        // Criação do cliente no banco de dados
        const novoCliente = await Cliente.create({ nome, cpf, endereco });

        // Retornando o cliente criado com status 201 (Created) e mensagem de sucesso
        res.status(201).json({
            message: 'Cliente criado com sucesso', // Mensagem de sucesso
            cliente: novoCliente // Cliente criado
        });
    } catch (error) {
        console.error(error);

        // Tratando erro de violação de CPF único
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'CPF já cadastrado, Insira outro.' });
        }

        // Para outros erros
        res.status(500).json({ message: 'Erro ao criar cliente', error });
    }
};


// Função para obter clientes
exports.obterClientes = async (req, res) => {
    try {
        const { nome } = req.params; // Pegando o nome da URL, se fornecido

        let clientes;

        if (nome) {
            // Se o nome for fornecido, busca pelo nome de forma insensível a maiúsculas/minúsculas
            clientes = await Cliente.findAll({
                where: {
                    nome: {
                        [Sequelize.Op.iLike]: `%${nome}%` // iLike para busca insensível a maiúsculas e minúsculas
                    }
                }
            });
        } else {
            // Se não for fornecido, retorna todos os clientes
            clientes = await Cliente.findAll();
        }

        if (clientes.length === 0) {
            return res.status(404).json({ message: 'Nenhum cliente encontrado' });
        }

        res.status(200).json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter clientes', error });
    }
};

// Função para deletar um cliente pelo ID ou CPF
exports.deletarCliente = async (req, res) => {
    try {
        const { idOrCpf } = req.params; // Pegando o ID ou CPF da URL

        if (!idOrCpf) {
            return res.status(400).json({ message: 'Você deve informar o ID ou o CPF para deletar o cliente' });
        }

        let cliente;

        // Expressão regular para verificar se o valor é um CPF válido
        const regexCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

        // Verificar se o idOrCpf é um número (ID) ou CPF (que é uma string com o formato correto)
        if (!isNaN(idOrCpf)) {
            // Se for numérico, trata como ID
            cliente = await Cliente.findByPk(idOrCpf);
        } else if (regexCpf.test(idOrCpf)) {
            // Se for CPF válido, trata como CPF
            cliente = await Cliente.findOne({ where: { cpf: idOrCpf } });
        } else {
            return res.status(400).json({ message: 'Formato de ID ou CPF inválido' });
        }

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        // Guardar o nome do cliente antes de excluir
        const nomeClienteDeletado = cliente.nome;

        // Deletando o cliente
        await cliente.destroy();

        // Retornando mensagem de sucesso (status 200), incluindo o nome do cliente deletado
        res.status(200).json({ message: `Cliente '${nomeClienteDeletado}' deletado com sucesso` });

    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message || error });
    }
};

// Função para atualizar um cliente
exports.atualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cpf, endereco } = req.body;

        // Encontrando o cliente pelo id
        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        // Objeto para armazenar os dados alterados
        const dadosAlterados = {};

        // Verificando e registrando as alterações
        if (nome && nome !== cliente.nome) {
            dadosAlterados.nome = { antigo: cliente.nome, novo: nome };
            cliente.nome = nome;
        }
        if (cpf && cpf !== cliente.cpf) {
            const clienteExistente = await Cliente.findOne({ where: { cpf } });
            if (clienteExistente) {
                return res.status(400).json({ message: 'CPF já cadastrado. Insira outro' });
            }
            dadosAlterados.cpf = { antigo: cliente.cpf, novo: cpf };
            cliente.cpf = cpf;
        }
        if (endereco && endereco !== cliente.endereco) {
            dadosAlterados.endereco = { antigo: cliente.endereco, novo: endereco };
            cliente.endereco = endereco;
        }

        // Salvando as mudanças no banco de dados
        await cliente.save();

        // Se houver alterações, exibe os dados alterados
        if (Object.keys(dadosAlterados).length > 0) {
            res.status(200).json({
                message: 'Cliente atualizado com sucesso',
                dadosAlterados: dadosAlterados, // Exibe os dados alterados
                cliente: cliente // Retorna o cliente atualizado
            });
        } else {
            res.status(200).json({
                message: 'Nenhuma alteração detectada no cliente',
                cliente: cliente // Retorna o cliente, mesmo que sem alterações
            });
        }
    } catch (error) {
        console.error(error);

        // Tratando erro de violação de CPF único
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'CPF já cadastrado, Insira outro' });
        }

        // Para outros erros
        res.status(500).json({ message: 'Erro ao atualizar cliente', error });
    }
};


const { Sequelize, Op } = require('sequelize'); // Importando Sequelize para usar os operadores
const Cliente = require('../models/clientes'); // Importando o modelo Cliente
const { verificarCpfExistente, validarCpf, validarNome, validarCamposObrigatorios, validarNomeMinimo } = require('../utils/validacoes');


// Função para criar um novo cliente
exports.criarCliente = async (req, res) => {
    try {
        const { nome, cpf, endereco } = req.body;

        // Validação de campos obrigatórios (nome, cpf e endereco)
        const camposObrigatoriosError = validarCamposObrigatorios(nome, cpf, endereco);
        if (camposObrigatoriosError) {
            return res.status(400).json({ message: camposObrigatoriosError });
        }

        // Validação do nome (apenas letras e espaços)
        if (!validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        // Validação do CPF (formato 111.222.333-44)
        if (!validarCpf(cpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
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
            message: 'Cliente criado com sucesso',
            cliente: novoCliente
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

// Função para obter todos os clientes
exports.obterClientes = async (req, res) => {
    try {
        // Buscar todos os clientes no banco de dados
        const clientes = await Cliente.findAll(); 

        // Verifica se nenhum cliente foi encontrado
        if (clientes.length === 0) {
            return res.status(404).json({ message: 'Nenhum cliente encontrado' });
        }

        // Ajusta o formato da resposta para garantir que seja um objeto simples (plain)
        const clientesData = clientes.map(cliente => cliente.get({ plain: true }));

        // Retorna os clientes encontrados com status 200 (OK)
        res.status(200).json(clientesData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter clientes', error });
    }
};


// Função para obter clientes por nome
exports.obterClientesPorNome = async (req, res) => {
    try {
        const { nome } = req.params; // pegando o nome de req.params

        if (!nome) {
            return res.status(400).json({ message: 'O parâmetro "nome" é obrigatório.' });
        }

        // Validação do nome (apenas letras e espaços)
        if (!validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        // Buscando clientes que contenham o nome informado, ignorando maiúsculas e minúsculas
        const clientes = await Cliente.findAll({
            where: {
                nome: {
                    [Op.iLike]: `%${nome}%` // Busca insensível a maiúsculas e minúsculas
                }
            }
        });

        if (clientes.length === 0) {
            return res.status(404).json({ message: 'Nenhum cliente encontrado com o nome informado.' });
        }

        // Retorna os clientes encontrados
        res.status(200).json(clientes); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter clientes por nome', error });
    }
};

// Função para obter clientes por CPF
exports.obterClientesPorCpf = async (req, res) => {
    try {
        const { cpf } = req.params; 

        if (!cpf) {
            return res.status(400).json({ message: 'O parâmetro "cpf" é obrigatório.' });
        }

        // Validação do CPF
        if (!validarCpf(cpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        // Buscando clientes com o CPF informado
        const clientes = await Cliente.findAll({
            where: {
                cpf: cpf
            }
        });

        if (clientes.length === 0) {
            return res.status(404).json({ message: 'Nenhum cliente encontrado com o CPF informado.' });
        }

        // Retorna os clientes encontrados
        res.status(200).json(clientes); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter clientes por CPF', error });
    }
};

// Função para atualizar um cliente pelo ID
exports.atualizarClientePorId = async (req, res) => {
    try {
        const { id } = req.params; // Obtém o ID do cliente da URL
        const { nome, cpf, endereco } = req.body; // Obtém os dados para atualização

        // Verificar se pelo menos um dos campos foi enviado para atualizar
        if (!nome && !cpf && !endereco) {
            return res.status(400).json({ message: 'Chave incorreta deve ser um destes "nome", "cpf", "endereco"'});
        }

        // Validar nome
        if (nome && !validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        // Verificar o nome mínimo (se for fornecido)
        const nomeMinimoError = validarNomeMinimo(nome);
        if (nomeMinimoError) {
            return res.status(400).json({ message: nomeMinimoError });
        }

        // Validar CPF
        if (cpf && !validarCpf(cpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        // Buscar o cliente pelo ID
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        let mensagemSucesso = "";

        // Atualizar CPF se necessário
        if (cpf && cliente.cpf !== cpf) {
            // Verificar se o CPF já existe
            const cpfExistente = await verificarCpfExistente(Cliente, cpf);
            if (cpfExistente) {
                return res.status(400).json({ message: 'Já existe um cliente com esse CPF.' });
            }
            cliente.cpf = cpf;
            mensagemSucesso = "CPF alterado com sucesso!";
        }

        // Atualizar nome se necessário
        if (nome && cliente.nome !== nome) {
            cliente.nome = nome;
            if (!mensagemSucesso) {
                mensagemSucesso = "Nome alterado com sucesso!";
            }
        }

        // Atualizar endereço se necessário
        if (endereco && cliente.endereco !== endereco) {
            cliente.endereco = endereco;
            if (!mensagemSucesso) {
                mensagemSucesso = "Endereço alterado com sucesso!";
            }
        }

        // Se nenhum campo foi alterado
        if (!mensagemSucesso) {
            return res.status(400).json({ message: 'Nenhuma alteração detectada.' });
        }

        // Salvar as alterações
        await cliente.save();

        // Retornar a resposta com a mensagem de sucesso e os dados atualizados
        res.status(200).json({
            message: mensagemSucesso,
            cliente: cliente
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
    }
};

// Função para atualizar um cliente pelo CPF
exports.atualizarClientePorCpf = async (req, res) => {
    try {
        const { cpf } = req.params; // Obtém o CPF do cliente da URL
        const { nome, endereco, cpf: novoCpf } = req.body; // Obtém os dados para atualização do corpo da requisição

        // Verificar se pelo menos um dos campos foi enviado para atualização
        if (!nome && !endereco && !novoCpf) {
            return res.status(400).json({ message: 'Pelo menos um dos seguintes campos deve ser fornecido: "nome", "endereco", "cpf"' });
        }

        // Validar nome
        if (nome && !validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        // Verificar o nome mínimo (se for fornecido)
        const nomeMinimoError = validarNomeMinimo(nome);
        if (nomeMinimoError) {
            return res.status(400).json({ message: nomeMinimoError });
        }

        // Validar CPF se foi fornecido
        if (novoCpf && !validarCpf(novoCpf)) {
            return res.status(400).json({ message: 'Novo CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        // Se o novo CPF foi fornecido, verificar se já existe um cliente com esse CPF
        if (novoCpf) {
            const cpfExistente = await Cliente.findOne({ where: { cpf: novoCpf } });
            if (cpfExistente) {
                return res.status(400).json({ message: 'Já existe um cliente com esse CPF.' });
            }
        }

        // Buscar o cliente pelo CPF antigo
        const cliente = await Cliente.findOne({ where: { cpf } });
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado com esse CPF.' });
        }

        let mensagemSucesso = "";

        // Atualizar CPF se necessário
        if (novoCpf && cliente.cpf !== novoCpf) {
            // Atualiza o CPF para o novo CPF
            cliente.cpf = novoCpf;
            mensagemSucesso = "CPF alterado com sucesso!";
        }

        // Atualizar nome se necessário
        if (nome && cliente.nome !== nome) {
            cliente.nome = nome;
            if (!mensagemSucesso) {
                mensagemSucesso = "Nome alterado com sucesso!";
            }
        }

        // Atualizar endereço se necessário
        if (endereco && cliente.endereco !== endereco) {
            cliente.endereco = endereco;
            if (!mensagemSucesso) {
                mensagemSucesso = "Endereço alterado com sucesso!";
            }
        }

        // Se nenhum campo foi alterado
        if (!mensagemSucesso) {
            return res.status(400).json({ message: 'Nenhuma alteração detectada.' });
        }

        // Salvar as alterações no banco de dados
        await cliente.save();

        // Retornar a resposta com a mensagem de sucesso e os dados atualizados
        res.status(200).json({
            message: mensagemSucesso,
            cliente: cliente
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar cliente', error });
    }
};

// Função para deletar um cliente pelo ID
exports.deletarClientePorId = async (req, res) => {
    try {
        const { id } = req.params;  // Obtém o ID do cliente da URL
        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        const nomeCliente = cliente.nome; // Obtém o nome do cliente

        // Excluir o cliente
        await cliente.destroy();

        // Retornar resposta de sucesso com o nome do cliente
        res.status(200).json({ message: `Cliente ${nomeCliente} excluído com sucesso` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar cliente', error });
    }
};

// Função para deletar um cliente pelo CPF
exports.deletarClientePorCpf = async (req, res) => {
    try {
        const { cpf } = req.params;  // Obtém o CPF do cliente da URL

        // Validação do CPF (formato 111.222.333-44)
        if (!validarCpf(cpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        // Buscar o cliente pelo CPF
        const cliente = await Cliente.findOne({ where: { cpf } });

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado com esse CPF.' });
        }

        const nomeCliente = cliente.nome; // Obtém o nome do cliente

        // Excluir o cliente
        await cliente.destroy();

        // Retornar a resposta de sucesso com o nome do cliente
        res.status(200).json({ message: `Cliente ${nomeCliente} excluído com sucesso` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir cliente', error });
    }
};


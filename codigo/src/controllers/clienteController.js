//src/controllers/clienteController.js

const { Sequelize, Op } = require('sequelize'); // Importando Sequelize para usar os operadores
const Cliente = require('../models/clientes'); // Importando o modelo Cliente
const { 
    verificarCpfExistente, 
    validarCpf, validarNome, 
    validarNomeMinimo,
    validarId
} = require('../utils/validacoes');


// Função para criar um novo cliente
exports.criarCliente = async (req, res) => {
    try {
        const { nome, cpf, endereco } = req.body;

        // Verificar se as chaves esperadas existem no corpo da requisição e se não estão vazias
        if (!req.body.hasOwnProperty('nome') || !nome) {
            return res.status(400).json({ message: "Chave 'nome' errada ou ausente." });
        }

        if (!req.body.hasOwnProperty('cpf') || !cpf) {
            return res.status(400).json({ message: "Chave 'cpf' errada ou ausente." });
        }

        if (!req.body.hasOwnProperty('endereco') || !endereco) {
            return res.status(400).json({ message: "Chave 'endereco' errada ou ausente." });
        }

        // Validação do nome (apenas letras e espaços)
        const erroNome = validarNome(nome); // Função que valida o nome
        if (erroNome) {
            return res.status(400).json({ message: erroNome });
        }

        // Validação do CPF (formato 111.222.333-44)
        const erroCpf = validarCpf(cpf);  // Função que valida o CPF
        if (erroCpf) {
            return res.status(400).json({ message: erroCpf });
        }

        // Verificar se o CPF já existe no banco de dados
        const cpfExistente = await verificarCpfExistente(Cliente, cpf);
        if (cpfExistente) {
            return res.status(400).json({ message: cpfExistente });  // Retorna a mensagem de erro se o CPF já existir
        }

        // Validar o nome com mínimo de 2 caracteres
        const nomeMinimoError = validarNomeMinimo(nome);
        if (nomeMinimoError) {
            return res.status(400).json({ message: nomeMinimoError });
        }

        // Verificar o endereço (se fornecido)
        if (endereco && endereco.trim() === '') {
            return res.status(400).json({ message: 'Endereço não pode ser vazio' });
        }

        // Criação do cliente no banco de dados
        const novoCliente = await Cliente.create({ nome, cpf, endereco });

        // Retornar a resposta com a mensagem de sucesso
        res.status(201).json({
            message: 'Cliente cadastrado com sucesso!',
            cliente: novoCliente  // Retornando o cliente recém-criado
        });
    } catch (error) {
        console.error(error);
        
        // Para outros erros (incluindo erros inesperados)
        res.status(500).json({ message: 'Erro ao criar cliente', error });
    }
};

// Função para atualizar um cliente pelo ID
exports.atualizarClientePorId = async (req, res) => {
    try {
        const { id } = req.params;  // ID do cliente vindo da URL
        const { nome, cpf: novoCpf, endereco } = req.body;  // Dados a serem atualizados  

        // Validar o ID
        const erroId = validarId(id);  // Função que valida o ID
        if (erroId) {
            return res.status(400).json({ message: erroId });
        }

        // Verificar se o corpo da requisição contém chaves erradas (diferentes de "nome", "cpf", "endereco")
        const chavesValidas = ['nome', 'cpf', 'endereco'];
        const chavesRecebidas = Object.keys(req.body);

        // Se houver chaves não válidas no corpo
        for (let chave of chavesRecebidas) {
            if (!chavesValidas.includes(chave)) {
                return res.status(400).json({ message: `Chave errada -> '${chave}'` });
            }
        }

        // Validar nome, se fornecido
        if (nome) {
            const erroNome = validarNome(nome);  // Função que valida o nome
            if (erroNome) {
                return res.status(400).json({ message: erroNome });
            }

            const nomeMinimoError = validarNomeMinimo(nome);  // Validação do nome mínimo
            if (nomeMinimoError) {
                return res.status(400).json({ message: nomeMinimoError });
            }
        }

        // Validar CPF, se fornecido
        if (novoCpf) {
            const erroCpf = validarCpf(novoCpf);  // Função que valida o CPF
            if (erroCpf) {
                return res.status(400).json({ message: erroCpf });
            }

            // Verificar se o CPF já está cadastrado (caso o cliente esteja alterando o CPF)
            if (novoCpf !== req.body.cpf) {
                const clienteExistente = await Cliente.findOne({ where: { cpf: novoCpf } });
                if (clienteExistente) {
                    return res.status(400).json({ message: 'Já existe um cliente com esse CPF.' });
                }
            }
        }

        // Verificar se o cliente com o ID fornecido existe
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ message: `Cliente com o ID ${id} não encontrado.` });
        }

        // Variável para armazenar as mensagens de sucesso
        let mensagensAlteradas = [];

        // Atualizar CPF se necessário
        if (novoCpf && cliente.cpf !== novoCpf) {
            cliente.cpf = novoCpf;
            mensagensAlteradas.push("CPF alterado com sucesso!");
        }

        // Atualizar nome se necessário
        if (nome && cliente.nome !== nome) {
            cliente.nome = nome;
            mensagensAlteradas.push("Nome alterado com sucesso!");
        }

        // Atualizar endereço se necessário
        if (endereco && cliente.endereco !== endereco) {
            if (endereco.trim() === '') {
                return res.status(400).json({ message: 'Endereço não pode ser vazio' });
            }
            cliente.endereco = endereco;
            mensagensAlteradas.push("Endereço alterado com sucesso!");
        }

        // Se nenhum campo foi alterado
        if (mensagensAlteradas.length === 0) {
            return res.status(400).json({ message: 'Nenhuma alteração realizada.' });
        }

        // Salvar as alterações no banco de dados
        await cliente.save();

        // Se os campos foram alterados, cria a mensagem combinada
        const mensagemSucesso = mensagensAlteradas.join(" "); // Junta todas as mensagens

        // Retornar a resposta com a mensagem de sucesso e os dados atualizados
        res.status(200).json({
            message: mensagemSucesso,
            cliente: {
                id: cliente.id,
                nome: cliente.nome,
                cpf: cliente.cpf,
                endereco: cliente.endereco // Incluir o endereço atualizado
            }
        });

    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);

        // Caso o erro seja um objeto e tenha uma mensagem
        const mensagemErro = error.message || 'Erro desconhecido ao atualizar cliente';

        // Retorne a resposta com a mensagem de erro detalhada
        return res.status(500).json({
            message: mensagemErro,
            error: error
        });
    }
};


// Função para atualizar um cliente pelo CPF
exports.atualizarClientePorCpf = async (req, res) => {
    try {
        const { cpf } = req.params;
        const { nome, cpf: novoCpf, endereco } = req.body;

        // Verificar se o corpo da requisição contém chaves erradas (diferentes de "nome", "cpf", "endereco")
        const chavesValidas = ['nome', 'cpf', 'endereco'];
        const chavesRecebidas = Object.keys(req.body);

        // Se houver chaves não válidas no corpo
        for (let chave of chavesRecebidas) {
            if (!chavesValidas.includes(chave)) {
                return res.status(400).json({ message: `Chave errada -> '${chave}'` });
            }
        }

        // Buscar o cliente pelo CPF
        const cliente = await Cliente.findOne({ where: { cpf } });
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado com esse CPF.' });
        }

        // Variável para armazenar as mensagens de sucesso
        let mensagensAlteradas = [];

        // Validar nome, se fornecido
        if (nome) {
            const erroNome = validarNome(nome);  // Função que valida o nome
            if (erroNome) {
                return res.status(400).json({ message: erroNome });
            }

            const nomeMinimoError = validarNomeMinimo(nome);  // Validação do nome mínimo
            if (nomeMinimoError) {
                return res.status(400).json({ message: nomeMinimoError });
            }

            // Atualizar nome se necessário
            if (cliente.nome !== nome) {
                cliente.nome = nome;
                mensagensAlteradas.push("Nome alterado com sucesso!");
            }
        }

        // Validar CPF, se fornecido
        if (novoCpf) {
            const erroCpf = validarCpf(novoCpf);  // Função que valida o CPF
            if (erroCpf) {
                return res.status(400).json({ message: erroCpf });
            }

            // Verificar se o novo CPF já existe no banco
            if (cliente.cpf !== novoCpf) {
                await verificarCpfExistente(Cliente, novoCpf);
                cliente.cpf = novoCpf;
                mensagensAlteradas.push("CPF alterado com sucesso!");
            }
        }

        // Atualizar endereço se necessário
        if (endereco) {
            if (endereco.trim() === '') {
                return res.status(400).json({ message: 'Endereço não pode ser vazio' });
            }
            if (cliente.endereco !== endereco) {
                cliente.endereco = endereco;
                mensagensAlteradas.push("Endereço alterado com sucesso!");
            }
        }

        // Se nenhum campo foi alterado
        if (mensagensAlteradas.length === 0) {
            return res.status(400).json({ message: 'Nenhuma alteração realizada.' });
        }

        // Salvar as alterações no banco de dados
        await cliente.save();

        // Se os campos foram alterados, cria a mensagem combinada
        const mensagemSucesso = mensagensAlteradas.join(" "); // Junta todas as mensagens

        // Retornar a resposta com a mensagem de sucesso e os dados atualizados
        res.status(200).json({
            message: mensagemSucesso,
            cliente: {
                id: cliente.id,
                nome: cliente.nome,
                cpf: cliente.cpf,
                endereco: cliente.endereco // Incluir o endereço atualizado
            }
        });

    } catch (error) {
        // Capturar qualquer erro e retornar uma mensagem apropriada
        console.error(error);
        res.status(400).json({ message: error.message || 'Erro ao atualizar cliente', error });
    }
};

// Função para deletar um cliente pelo ID
exports.deletarClientePorId = async (req, res) => {
    try {
        const { id } = req.params;  // Obtém o ID do cliente da URL

        // Validar o ID
        const erroId = validarId(id);  // Função que valida o ID
        if (erroId) {
            return res.status(400).json({ message: erroId });
        }

        // Buscar o cliente pelo ID
        const cliente = await Cliente.findByPk(id);

        // Se o cliente não for encontrado
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado com esse ID.' });
        }

        // Armazenar o nome do cliente
        const nomeCliente = cliente.nome;

        // Excluir o cliente
        await cliente.destroy();

        // Retornar resposta de sucesso com o nome do cliente
        res.status(200).json({ message: `Cliente ${nomeCliente} excluído com sucesso` });
    } catch (error) {
        console.error(error);

        // Verificar o tipo de erro e fornecer mensagens mais detalhadas
        if (error instanceof Sequelize.DatabaseError) {
            return res.status(500).json({
                message: 'Erro no banco de dados',
                error: error.message,
                details: error.parent.sql || error.original.sql
            });
        }

        res.status(500).json({ message: 'Erro ao deletar cliente', error });
    }
};

// Função para deletar um cliente pelo CPF
exports.deletarClientePorCpf = async (req, res) => {
    try {
        const { cpf } = req.params;  // Obtém o CPF da URL

        // Validar o CPF (formato)
        const erroCpf = validarCpf(cpf);  // Se falhar, um erro será retornado
        if (erroCpf) {
            return res.status(400).json({ message: erroCpf });  // Retorna a mensagem de erro da validação
        }

        // Buscar o cliente pelo CPF
        const cliente = await Cliente.findOne({ where: { cpf } });

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado com esse CPF.' });
        }

        // Nome do cliente a ser excluído
        const nomeCliente = cliente.nome;

        // Excluir o cliente
        await cliente.destroy();

        // Retornar a resposta de sucesso com o nome do cliente excluído
        res.status(200).json({ message: `Cliente ${nomeCliente} excluído com sucesso` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir cliente', error });
    }
};

// Função para deletar todos os clientes
exports.deletarTodosClientes = async (req, res) => {
    try {
        // Deletar os clientes da tabela 'clientes'
        await Cliente.destroy({
            where: {}, // Condição vazia para deletar todos os registros
            force: true, // Forçar a exclusão dos dados
        });

        res.status(200).json({ message: 'Todos os clientes foram deletados com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar clientes.', error });
    }
};

// Função para obter clientes por nome
exports.obterClientesPorNome = async (req, res) => {
    try {
        const { nome } = req.params; // pegando o nome de req.params

        if (!nome) {
            return res.status(400).json({ message: 'O parâmetro "nome" é obrigatório.' });
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

// Função para obter clientes por ID
exports.obterclientePorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Validação do ID usando a função de validação
        const erroValidacaoId = validarId(id);
        if (erroValidacaoId) {
            return res.status(400).json({ message: erroValidacaoId });
        }

        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({ message: 'cliente não encontrado.' });
        }

        res.status(200).json(cliente);
    } catch (error) {
        console.error('Erro ao buscar cliente por ID:', error); // Mensagem de erro mais detalhada
        res.status(500).json({ message: 'Erro ao buscar cliente por ID.', error: error.message }); // Exibindo a mensagem de erro
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





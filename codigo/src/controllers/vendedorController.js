// src/controllers/vendedorController.js
const { Op } = require('sequelize');
const Vendedor = require('../models/vendedores');
const {
    validarCpf,
    validarNome,
    verificarCpfExistente,
    validarNomeMinimo
} = require('../utils/validacoes');

// Função para criar um novo vendedor
exports.criarVendedor = async (req, res) => {
    try {
        const { nome, cpf } = req.body;

        // Verificar se todos os campos obrigatórios foram fornecidos (nome e cpf)
        if (!nome || !cpf) {
            return res.status(400).json({ message: 'Nome e CPF são obrigatórios' });
        }

        // Validação do nome (apenas letras e espaços)
        if (!validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        // Validação do nome com mínimo de 2 caracteres
        const nomeMinimoError = validarNomeMinimo(nome);
        if (nomeMinimoError) {
            return res.status(400).json({ message: nomeMinimoError });
        }

        // Validação do CPF (formato)
        if (!validarCpf(cpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        // Verificar se o CPF já existe no banco
        const cpfExistente = await verificarCpfExistente(Vendedor, cpf);
        if (cpfExistente) {
            return res.status(400).json({ message: 'Já existe um vendedor com esse CPF.' });
        }

        // Criação do vendedor no banco de dados
        const novoVendedor = await Vendedor.create({ nome, cpf });

        // Retornando a resposta com a mensagem de sucesso
        res.status(201).json({
            message: 'Vendedor cadastrado com sucesso!',
            vendedor: novoVendedor  // Retornando o vendedor recém-criado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar vendedor', error });
    }
};


// GET - Função para obter todos os vendedores
exports.obterVendedores = async (req, res) => {
    try {
        const vendedores = await Vendedor.findAll(); // Buscar todos os vendedores no banco
        
        if (vendedores.length === 0) {
            return res.status(404).json({ message: 'Nenhum vendedor encontrado' });
        }

        // Ajusta o formato da resposta para garantir que seja um objeto simples
        const vendedoresData = vendedores.map(v => v.get({ plain: true }));

        // Retornando os vendedores encontrados com status 200 (OK)
        res.status(200).json(vendedoresData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter vendedores', error });
    }
};

// GET - Função para obter vendedores por CPF
exports.obterVendedoresPorCpf = async (req, res) => {
    try {
        const { cpf } = req.params;  // Pegando o parâmetro 'cpf' da URL

        // Validação do CPF (formato)
        if (!validarCpf(cpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        // Buscando vendedores pelo CPF
        const vendedores = await Vendedor.findAll({
            where: {
                cpf: {
                    [Op.eq]: cpf  // Busca exata pelo CPF fornecido
                }
            }
        });

        if (vendedores.length === 0) {
            return res.status(404).json({ message: `Nenhum vendedor encontrado com o CPF: ${cpf}` });
        }

        // Retornando os vendedores encontrados com status 200 (OK)
        res.status(200).json(vendedores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter vendedores por CPF', error });
    }
};

// GET - Função para obter vendedores por nome
exports.obterVendedoresPorNome = async (req, res) => {
    try {
        const { nome } = req.params;

        if (!nome) {
            return res.status(400).json({ message: 'O parâmetro nome é obrigatório.' });
        }

        if (!validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        // Buscando vendedores pelo nome usando ILIKE (case insensitive)
        const vendedores = await Vendedor.findAll({
            where: {
                nome: {
                    [Op.iLike]: `%${nome}%`  // Busca insensível a maiúsculas/minúsculas
                }
            }
        });

        if (vendedores.length === 0) {
            return res.status(404).json({ message: `Nenhum vendedor encontrado com o nome: ${nome}` });
        }

        res.status(200).json(vendedores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter vendedores por nome', error });
    }
};

// Função para atualizar um vendedor pelo ID
exports.atualizarVendedorPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cpf } = req.body;

        // Verificar se pelo menos um dos campos foi enviado para atualizar
        if (!nome && !cpf) {
            return res.status(400).json({ message: 'Nome ou CPF são obrigatórios para atualização' });
        }

        // Validar nome e CPF
        if (nome && !validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        const nomeMinimoError = validarNomeMinimo(nome);
        if (nomeMinimoError) {
            return res.status(400).json({ message: nomeMinimoError });
        }

        if (cpf && !validarCpf(cpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        // Buscar o vendedor pelo ID
        const vendedor = await Vendedor.findByPk(id);
        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        let mensagemSucesso = "";

        // Atualizar CPF se necessário
        if (cpf && vendedor.cpf !== cpf) {
            const cpfExistente = await verificarCpfExistente(Vendedor, cpf);
            if (cpfExistente) {
                return res.status(400).json({ message: 'Já existe um vendedor com esse CPF.' });
            }
            vendedor.cpf = cpf;
            mensagemSucesso = "CPF alterado com sucesso!";
        }

        // Atualizar nome se necessário
        if (nome && vendedor.nome !== nome) {
            vendedor.nome = nome;
            if (!mensagemSucesso) {
                mensagemSucesso = "Nome alterado com sucesso!";
            }
        }

        // Se nenhum campo foi alterado
        if (!mensagemSucesso) {
            return res.status(400).json({ message: 'Nenhuma alteração detectada.' });
        }

        // Salvar as alterações
        await vendedor.save();

        // Retornar a resposta com a mensagem de sucesso e os dados atualizados
        res.status(200).json({
            message: mensagemSucesso,
            vendedor: {
                id: vendedor.id,
                nome: vendedor.nome,
                cpf: vendedor.cpf
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar vendedor', error });
    }
};

// Função para atualizar um vendedor pelo CPF
exports.atualizarVendedorPorCpf = async (req, res) => {
    try {
        const { cpf } = req.params;
        const { nome, cpf: novoCpf } = req.body;

        // Verificar se pelo menos um dos campos foi enviado para atualizar
        if (!nome && !novoCpf) {
            return res.status(400).json({ message: 'Nome ou CPF são obrigatórios para atualização' });
        }

        // Validar nome e CPF
        if (nome && !validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        const nomeMinimoError = validarNomeMinimo(nome);
        if (nomeMinimoError) {
            return res.status(400).json({ message: nomeMinimoError });
        }

        if (novoCpf && !validarCpf(novoCpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        // Buscar o vendedor pelo CPF
        const vendedor = await Vendedor.findOne({ where: { cpf } });
        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado com esse CPF.' });
        }

        let mensagemSucesso = "";

        // Atualizar CPF se necessário
        if (novoCpf && vendedor.cpf !== novoCpf) {
            const cpfExistente = await verificarCpfExistente(Vendedor, novoCpf);
            if (cpfExistente) {
                return res.status(400).json({ message: 'Já existe um vendedor com esse CPF.' });
            }
            vendedor.cpf = novoCpf;
            mensagemSucesso = "CPF alterado com sucesso!";
        }

        // Atualizar nome se necessário
        if (nome && vendedor.nome !== nome) {
            vendedor.nome = nome;
            if (!mensagemSucesso) {
                mensagemSucesso = "Nome alterado com sucesso!";
            }
        }

        // Se nenhum campo foi alterado
        if (!mensagemSucesso) {
            return res.status(400).json({ message: 'Nenhuma alteração detectada.' });
        }

        // Salvar as alterações
        await vendedor.save();

        // Retornar a resposta com a mensagem de sucesso e os dados atualizados
        res.status(200).json({
            message: mensagemSucesso,
            vendedor: vendedor
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar vendedor', error });
    }
};

// Função para deletar um vendedor pelo ID
exports.deletarVendedorPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const vendedor = await Vendedor.findByPk(id);

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        await vendedor.destroy();

        res.status(200).json({ message: 'Vendedor excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar vendedor', error });
    }
};

// Função para deletar um vendedor pelo CPF
exports.deletarVendedorPorCpf = async (req, res) => {
    try {
        const { cpf } = req.params;  // Obtém o CPF da URL

        // Validação do CPF (formato)
        if (!validarCpf(cpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        // Buscar o vendedor pelo CPF
        const vendedor = await Vendedor.findOne({ where: { cpf } });

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado com esse CPF.' });
        }

        // Excluir o vendedor
        await vendedor.destroy();

        // Retornar a resposta de sucesso
        res.status(200).json({ message: 'Vendedor excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir vendedor', error });
    }
};

// Função para deletar todos os vendedors
exports.deletarTodosVendedores = async (req, res) => {
    try {
        // Deletar os vendedores da tabela 'vendedores'
        await Vendedor.destroy({
            where: {}, // Condição vazia para deletar todos os registros
            force: true, // Forçar a exclusão dos dados
        });

        res.status(200).json({ message: 'Todos os vendedores foram deletados com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar vendedores.', error });
    }
};

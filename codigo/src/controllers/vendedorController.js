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

        // Retornando o vendedor criado com status 201 (Created)
        res.status(201).json(novoVendedor);
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

        if (!nome && !cpf) {
            return res.status(400).json({ message: 'Nome ou CPF são obrigatórios para atualização' });
        }

        if (nome && !validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        if (nome) {
            const nomeMinimoError = validarNomeMinimo(nome);
            if (nomeMinimoError) {
                return res.status(400).json({ message: nomeMinimoError });
            }
        }

        if (cpf && !validarCpf(cpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        const vendedor = await Vendedor.findByPk(id);

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        // Variável para armazenar a mensagem de sucesso
        let mensagemSucesso = "";

        // Atualizar o CPF, se for fornecido e diferente do atual
        if (cpf && vendedor.cpf !== cpf) {
            const cpfExistente = await verificarCpfExistente(Vendedor, cpf);
            if (cpfExistente) {
                return res.status(400).json({ message: 'Já existe um vendedor com esse CPF.' });
            }
            vendedor.cpf = cpf;  // Atualiza o CPF
            mensagemSucesso = "CPF atualizado com sucesso!"; // Mensagem de sucesso para o CPF
        }

        // Atualizar o nome, se for fornecido e diferente do atual
        if (nome && vendedor.nome !== nome) {
            vendedor.nome = nome;  // Atualiza o nome
            // Se o nome também foi alterado, atualizamos a mensagem de sucesso
            if (!mensagemSucesso) {
                mensagemSucesso = "Nome atualizado com sucesso!"; // Mensagem de sucesso para o nome
            }
        }

        // Se nenhum dos campos foi alterado, não há necessidade de salvar
        if (!mensagemSucesso) {
            return res.status(400).json({ message: 'Nenhuma alteração detectada.' });
        }

        // Salvando o vendedor atualizado
        await vendedor.save();

        // Retornando a resposta de sucesso com o vendedor atualizado
        res.status(200).json({
            message: mensagemSucesso, // Mensagem de sucesso dependendo do campo alterado
            vendedor: {
                id: vendedor.id,
                nome: vendedor.nome,
                cpf: vendedor.cpf
            }  // Retornando o vendedor atualizado
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

        if (!nome && !novoCpf) {
            return res.status(400).json({ message: 'Nome ou CPF são obrigatórios para atualização' });
        }

        if (nome && !validarNome(nome)) {
            return res.status(400).json({ message: 'Nome inválido. Apenas letras e espaços são permitidos.' });
        }

        if (nome) {
            const nomeMinimoError = validarNomeMinimo(nome);
            if (nomeMinimoError) {
                return res.status(400).json({ message: nomeMinimoError });
            }
        }

        if (novoCpf && !validarCpf(novoCpf)) {
            return res.status(400).json({ message: 'CPF inválido. O formato deve ser 111.222.333-44.' });
        }

        const vendedor = await Vendedor.findOne({ where: { cpf } });

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado com esse CPF.' });
        }

        if (novoCpf && vendedor.cpf !== novoCpf) {
            const cpfExistente = await verificarCpfExistente(Vendedor, novoCpf);
            if (cpfExistente) {
                return res.status(400).json({ message: 'Já existe um vendedor com esse CPF.' });
            }
        }

        vendedor.nome = nome || vendedor.nome;
        vendedor.cpf = novoCpf || vendedor.cpf;

        await vendedor.save();

        res.status(200).json(vendedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar vendedor', error });
    }
};

// Função para deletar um vendedor pelo ID
exports.deletarVendedor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendedor = await Vendedor.findByPk(id);

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        await vendedor.destroy();

        res.status(200).json({ message: 'Vendedor deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar vendedor', error });
    }
};

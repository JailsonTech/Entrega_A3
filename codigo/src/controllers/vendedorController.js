// src/controllers/vendedorController.js
const { Op } = require('sequelize');
const Vendedor = require('../models/vendedores');
const {
    validarCpf,
    validarNome,
    verificarCpfExistente,
    validarNomeMinimo,
    validarId
} = require('../utils/validacoes');

// Função para criar um novo vendedor
exports.criarVendedor = async (req, res) => {
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
         const erroNome = validarNome(nome);
         if (erroNome) {
             return res.status(400).json({ message: erroNome });
         }
 
         // Validação do CPF (formato correto)
         const erroCpf = validarCpf(cpf);
         if (erroCpf) {
             return res.status(400).json({ message: erroCpf });
         }

        // Verificar se o CPF já existe no banco
        await verificarCpfExistente(Vendedor, cpf);  // Se já existir, erro será lançado

        // Validação do nome com mínimo de 2 caracteres
        const nomeMinimoError = validarNomeMinimo(nome);
        if (nomeMinimoError) {
            return res.status(400).json({ message: nomeMinimoError });
        }        

        // Verificar o endereço (se fornecido)
        if (endereco && endereco.trim() === '') {
            return res.status(400).json({ message: 'Endereço não pode ser vazio' });
        }

        // Criação do vendedor no banco de dados
        const novoVendedor = await Vendedor.create({ nome, cpf, endereco });

        // Retornando a resposta com a mensagem de sucesso
        res.status(201).json({
            message: 'Vendedor cadastrado com sucesso!',
            vendedor: novoVendedor  // Retornando o vendedor recém-criado
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message }); // Retorna a mensagem de erro gerada nas validações
    }
};

// Função para atualizar um vendedor pelo ID
exports.atualizarVendedorPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cpf, endereco } = req.body;

        // Verificar se pelo menos um dos campos foi enviado para atualizar
        if (!nome && !cpf && !endereco) {
            return res.status(400).json({ message: 'Nome, CPF ou Endereço são obrigatórios para atualização' });
        }

        // Validar nome e CPF
        if (nome) {
            validarNome(nome);  // Se falhar, um erro será lançado
            const nomeMinimoError = validarNomeMinimo(nome);
            if (nomeMinimoError) {
                return res.status(400).json({ message: nomeMinimoError });
            }
        }

        if (cpf) {
            validarCpf(cpf);  // Se falhar, um erro será lançado
        }

        // Buscar o vendedor pelo ID
        const vendedor = await Vendedor.findByPk(id);
        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        // Variável para montar a mensagem de sucesso
        let mensagensAlteradas = [];

        // Atualizar CPF se necessário
        if (cpf && vendedor.cpf !== cpf) {
            await verificarCpfExistente(Vendedor, cpf);  // Verifica se o CPF já existe
            vendedor.cpf = cpf;
            mensagensAlteradas.push("CPF alterado com sucesso!");
        }

        // Atualizar nome se necessário
        if (nome && vendedor.nome !== nome) {
            vendedor.nome = nome;
            mensagensAlteradas.push("Nome alterado com sucesso!");
        }

        // Atualizar endereço se necessário
        if (endereco && vendedor.endereco !== endereco) {
            // Verificar se o endereço não está vazio
            if (endereco.trim() === '') {
                return res.status(400).json({ message: 'Endereço não pode ser vazio' });
            }
            vendedor.endereco = endereco;
            mensagensAlteradas.push("Endereço alterado com sucesso!");
        }

        // Se nenhum campo foi alterado
        if (mensagensAlteradas.length === 0) {
            return res.status(400).json({ message: 'Nenhuma alteração detectada.' });
        }

        // Salvar as alterações
        await vendedor.save();

        // Se os três campos foram alterados, exibe uma mensagem combinada
        const mensagemSucesso = mensagensAlteradas.join(" "); // Junta as mensagens de sucesso

        // Retornar a resposta com a mensagem de sucesso e os dados atualizados
        res.status(200).json({
            message: mensagemSucesso,
            vendedor: {
                id: vendedor.id,
                nome: vendedor.nome,
                cpf: vendedor.cpf,
                endereco: vendedor.endereco // Incluir o endereço atualizado
            }
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message }); // Retorna a mensagem de erro gerada nas validações
    }
};


// Função para atualizar um vendedor pelo CPF
exports.atualizarVendedorPorCpf = async (req, res) => {
    try {
        const { cpf } = req.params;
        const { nome, cpf: novoCpf, endereco } = req.body;

        // Verificar se pelo menos um dos campos foi enviado para atualizar
        if (!nome && !novoCpf && !endereco) {
            return res.status(400).json({ message: 'Chaves Nome, CPF ou Endereço errado ou ausente' });
        }

         // Validação do nome (apenas letras e espaços)
         const erroNome = validarNome(nome);
         if (erroNome) {
             return res.status(400).json({ message: erroNome });
         }

        // Validar nome, se fornecido
        if (nome) {
            validarNome(nome);  // Se falhar, um erro será lançado
            const nomeMinimoError = validarNomeMinimo(nome);
            if (nomeMinimoError) {
                return res.status(400).json({ message: nomeMinimoError });
            }
        }

        // Validar CPF (formato)
        if (novoCpf) {

            // Validação do CPF (formato)
            const erroCpf = validarCpf(novoCpf);  // Se falhar, um erro será retornado
            if (erroCpf) {
                return res.status(400).json({ message: erroCpf });  // Retorna a mensagem de erro da validação
            }
        }

        // Buscar o vendedor pelo CPF
        const vendedor = await Vendedor.findOne({ where: { cpf } });
        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado com esse CPF.' });
        }

        // Variável para armazenar as mensagens de sucesso
        let mensagensAlteradas = [];

        // Atualizar CPF se necessário
        if (novoCpf && vendedor.cpf !== novoCpf) {
            // Verificar se o novo CPF já existe no banco
            await verificarCpfExistente(Vendedor, novoCpf);  
            vendedor.cpf = novoCpf;
            mensagensAlteradas.push("CPF alterado com sucesso!");
        }

        // Atualizar nome se necessário
        if (nome && vendedor.nome !== nome) {
            vendedor.nome = nome;
            mensagensAlteradas.push("Nome alterado com sucesso!");
        }

        // Atualizar endereço se necessário
        if (endereco && vendedor.endereco !== endereco) {
            if (endereco.trim() === '') {
                return res.status(400).json({ message: 'Endereço não pode ser vazio' });
            }
            vendedor.endereco = endereco;
            mensagensAlteradas.push("Endereço alterado com sucesso!");
        }

        // Se nenhum campo foi alterado
        if (mensagensAlteradas.length === 0) {
            return res.status(400).json({ message: 'Nenhuma alteração realizada.' });
        }

        // Salvar as alterações
        await vendedor.save();

        // Se os campos foram alterados, cria a mensagem combinada
        const mensagemSucesso = mensagensAlteradas.join(" "); // Junta todas as mensagens

        // Retornar a resposta com a mensagem de sucesso e os dados atualizados
        res.status(200).json({
            message: mensagemSucesso,
            vendedor: {
                id: vendedor.id,
                nome: vendedor.nome,
                cpf: vendedor.cpf,
                endereco: vendedor.endereco // Incluir o endereço atualizado
            }
        });

    } catch (error) {
        // Capturar qualquer erro e retornar uma mensagem apropriada
        console.error(error);
        res.status(400).json({ message: error.message || 'Erro ao atualizar vendedor', error });
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

        // Buscar o vendedor pelo CPF
        const vendedor = await Vendedor.findOne({ where: { cpf } });

        // Validação do CPF (formato)
        const erroCpf = validarCpf(cpf);  // Se falhar, um erro será retornado
        if (erroCpf) {
            return res.status(400).json({ message: erroCpf });  // Retorna a mensagem de erro da validação
        }

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
        const erroCpf = validarCpf(cpf);  // Se falhar, um erro será retornado
        if (erroCpf) {
            return res.status(400).json({ message: erroCpf });  // Retorna a mensagem de erro da validação
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
        res.status(400).json({ message: error.message }); // Retorna a mensagem de erro gerada nas validações
    }
};

// GET - Função para obter vendedores por nome
exports.obterVendedoresPorNome = async (req, res) => {
    try {
        const { nome } = req.params;

        // Verifica se o nome foi informado
        if (!nome) {
            return res.status(400).json({ message: 'O parâmetro nome é obrigatório.' });
        }

        // Valida o nome
        const erroNome = validarNome(nome);  // Verifica a validação do nome
        if (erroNome) {
            return res.status(400).json({ message: erroNome });  // Se houver erro, retorna a mensagem
        }

        // Buscando vendedores pelo nome usando ILIKE (case insensitive)
        const vendedores = await Vendedor.findAll({
            where: {
                nome: {
                    [Op.iLike]: nome,  // Busca exata e insensível a maiúsculas/minúsculas
                }
            }
        });

        // Verifica se algum vendedor foi encontrado
        if (vendedores.length === 0) {
            return res.status(404).json({ message: `Nenhum vendedor encontrado com o nome: ${nome}` });
        }

        // Retorna os vendedores encontrados
        res.status(200).json(vendedores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter vendedores por nome.', error: error.message });  // Erro genérico
    }
};


// Função para obter um vendedor por ID
exports.obterVendedorPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Validação do ID usando a função de validação
        const erroValidacaoId = validarId(id);
        if (erroValidacaoId) {
            return res.status(400).json({ message: erroValidacaoId });
        }

        const vendedor = await Vendedor.findByPk(id);

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado.' });
        }

        res.status(200).json(vendedor);
    } catch (error) {
        console.error('Erro ao buscar vendedor por ID:', error); // Mensagem de erro mais detalhada
        res.status(500).json({ message: 'Erro ao buscar vendedor por ID.', error: error.message }); // Exibindo a mensagem de erro
    }
};
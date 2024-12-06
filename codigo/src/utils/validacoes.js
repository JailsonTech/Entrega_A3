// src/utils/validacoes.js

// Função para validar o CPF (formato 111.222.333-44)
const validarCpf = (cpf) => {
    // Expressão regular para validar o formato do CPF
    const cpfRegex = /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/;

    // Verifica se o CPF corresponde ao formato
    const isValido = cpfRegex.test(cpf); 

    // Se o CPF não for válido, retorna uma mensagem de erro
    if (!isValido) {
        return 'CPF inválido. O formato deve ser 111.222.333-44.';
    }

    // Se o CPF for válido, retorna null
    return null;
};

// Função para verificar se o CPF já existe no banco de dados cliente ou vendedor
const verificarCpfExistente = async (modelo, cpf) => {
    const entidadeExistente = await modelo.findOne({ where: { cpf } });
    if (entidadeExistente) {
        return 'CPF já cadastrado, insira outro.';  // Retorna a mensagem de erro se já existir
    }
};

// Função para validar o Nome (apenas letras e espaços)
const validarNome = (nome) => {
    // A regex já permite letras minúsculas, maiúsculas, acentuadas e espaços
    const nomeRegex = /^[a-zA-ZÀ-ÿ\s]+$/; // Permite letras (minúsculas e maiúsculas), acentuadas e espaços

    // Se o nome não for válido, retorna uma mensagem de erro
    if (!nomeRegex.test(nome)) {
        return 'Nome inválido. Apenas letras e espaços são permitidos.';
    }

    // Se o nome for válido, retorna null
    return null;
};

// Função para validar se o nome tem pelo menos 2 caracteres
const validarNomeMinimo = (nome) => {
    if (nome && nome.length < 3) {
        return 'Nome muito curto. Deve ter pelo menos 2 caracteres.';
    }
    return null;
};

// Função para validar campos obrigatórios (nome, cpf, e endereco)
const validarCamposObrigatorios = (nome, cpf, endereco) => {
    // Verifica se algum campo foi enviado e se ele é válido
    if (nome && !nome.trim()) {
        return 'Nome não pode ser vazio';
    }
    if (cpf && !cpf.trim()) {
        return 'CPF não pode ser vazio';
    }
    if (endereco && !endereco.trim()) {
        return 'Endereço não pode ser vazio';
    }

    // Caso algum campo seja vazio (mas tenha sido enviado), retorna mensagem de erro
    if (!nome && !cpf && !endereco) {
        return 'Pelo menos um campo (nome, CPF ou endereço) deve ser fornecido';
    }

    // Se tudo estiver OK
    return null;
};

// Função para validar campos obrigatórios (nome, cpf, e endereco)
const validarCamposObrigatoriosPut = (nome, cpf, endereco) => {
    // Verifica se algum campo foi enviado e se ele é válido
    if (nome && !nome.trim()) {
        return 'Nome não pode ser vazio';
    }
    if (cpf && !cpf.trim()) {
        return 'CPF não pode ser vazio';
    }
    if (endereco && !endereco.trim()) {
        return 'Endereço não pode ser vazio';
    }

    // Caso algum campo seja vazio (mas tenha sido enviado), retorna mensagem de erro
    if (!nome && !cpf && !endereco) {
        return 'Pelo menos um campo (nome, CPF ou endereço) deve ser fornecido';
    }

    // Se tudo estiver OK
    return null;
};

// Função para validar o nome do produto (apenas letras e espaços)
const validarNomeProduto = (nome) => {
    // Garantir que o nome seja uma string
    if (typeof nome !== 'string') {
        return 'Nome do produto deve ser uma string.';
    }

    // A regex permite apenas letras (maiusculas e minúsculas), acentuadas e espaços
    const regex = /^[a-zA-Zà-úÀ-ÚçÇãõÃõ\s]+$/;

    // Se o nome não for válido, retorna uma mensagem de erro
    if (!regex.test(nome)) {
        return 'Nome de produto inválido. Apenas letras e espaços são permitidos, sem números.';
    }

    // Se o nome for válido, retorna null
    return null;
};

// Função para validar o preço 
const validarPreco = (preco) => {
    // Garantir que o preco seja um número real (não uma string)
    if (typeof preco !== 'number' || isNaN(preco)) {
        return { valid: false, message: `Erro no valor de preco -> '${preco}' <- Deve ser um NÚMERO válido e sem aspas` };
    }
    
    // Garantir que o preço não contenha caracteres inválidos (verifica se o valor é um número)
    const precoStr = preco.toString();  // Converte para string para garantir a comparação
    if (!/^\d+(\.\d+)?$/.test(precoStr)) {
        return { valid: false, message: `O valor '${preco}' contém caracteres inválidos. Somente números e ponto decimal são permitidos.` };
    }

    // Se o preço for menor ou igual a zero, retorna erro
    if (preco <= 0) {
        return { valid: false, message: "Preço deve ser maior que zero." };
    }

    // Se o preço for válido, retorna o preço numérico
    return { valid: true, precoNumerico: preco };
};


const validarEstoque = (estoque) => {
    // Garantir que o estoque seja um número real (não uma string)
    if (typeof estoque !== 'number' || isNaN(estoque)) {
        return { valid: false, message: `O valor '${estoque}' deve ser um número válido e sem aspas` };
    }

    // O estoque deve ser um número inteiro não negativo, permitindo 0
    if (!Number.isInteger(estoque)) {
        return { valid: false, message: `O valor '${estoque}' deve ser um número inteiro, não negativo.` };
    }

    // O estoque pode ser 0, desde que seja um número inteiro não negativo
    if (estoque < 0) {
        return { valid: false, message: `O valor '${estoque}' é inválido. Não pode ser negativo.` };
    }

    // Se tudo estiver correto, retornamos como válido
    return { valid: true };
};

// Função para validar a quantidade (número inteiro positivo)
const validarQuantidade = (quantidade) => {
    // Garantir que a quantidade seja um número
    if (typeof quantidade !== 'number' || isNaN(quantidade)) {
        return { valid: false, message: `A quantidade '${quantidade}' deve ser um número válido.` };
    }

    // Garantir que a quantidade seja um número inteiro
    if (!Number.isInteger(quantidade)) {
        return { valid: false, message: 'A quantidade deve ser um número inteiro.' };
    }

    // Garantir que a quantidade seja maior que zero
    if (quantidade <= 0) {
        return { valid: false, message: 'A quantidade deve ser maior que zero.' };
    }

    // Se a quantidade for válida, retorna como válida
    return { valid: true, message: '' };
};

module.exports = { validarQuantidade };


// Exemplo de como salvar no DB
const salvarProdutoNoDb = async (Produto, nome, preco, estoque) => {
    try {
        // Validar o preço
        const validacaoPreco = validarPreco(preco);
        if (!validacaoPreco.valid) {
            throw new Error(validacaoPreco.message);
        }

        // Se o preço for válido, utilizamos o precoNumerico (float) para salvar no banco
        const precoFloat = validacaoPreco.precoNumerico;

        // Criação do produto no banco de dados com preço como float
        const novoProduto = await Produto.create({
            nome,
            preco: precoFloat, // Aqui o preço é armazenado como número
            estoque
        });

        return novoProduto;
    } catch (error) {
        console.error(error);
        throw new Error("Erro ao salvar o produto.");
    }
};

// Função para validar se todos os campos obrigatórios (nome, preco e estoque) foram informados
const validarCamposObrigatoriosProduto = (nome, preco, estoque) => {
    if (!nome || nome.trim() === '') {
        return 'O campo "nome" é obrigatório.';
    }
    if (preco === undefined || preco === null) {
        return 'O campo "preco" é obrigatório.';
    }
    if (estoque === undefined || estoque === null) {
        return 'O campo "estoque" é obrigatório.';
    }
    return null;
};

// Função para validar campos obrigatórios para update
const validarCamposObrigatoriosProdutoPut = (nome, preco, estoque) => {
    // Verifica se nome foi enviado e se ele não é vazio
    if (nome && nome === '') {
        return 'ERRO! Verifique a chave nome';
    }
    // Verifica se preço foi enviado e se ele não é vazio
    if (preco && preco === '') {
        return 'ERRO! Verifique a chave preco';
    }
    // A verificação de estoque não deve impedir o valor 0, então apenas verificamos se foi fornecido e não está vazio
    if (estoque !== undefined && estoque !== null && estoque === '') {
        return 'ERRO! Verifique a chave Estoque';
    }

    // Caso algum campo não tenha sido enviado (todos nulos ou indefinidos), retorna mensagem de erro
    if (!nome && preco === undefined && estoque === undefined) {
        return 'Pelo menos um campo (nome, preco ou estoque) deve ser fornecido';
    }

    // Se tudo estiver OK
    return null;
};

// Função para verificar se o nome do produto já existe no banco de dados
const verificarProdutoExistente = async (Produto, nome) => {
    const produtoExistente = await Produto.findOne({ where: { nome } });
    return produtoExistente;
};

// Função para validar o ID
const validarId = (id) => {
    // Verificar se o ID é um número inteiro positivo
    const idNumerico = parseInt(id, 10);

    // Verificar se a conversão resultou em um número válido e se o ID não contém caracteres não numéricos
    if (!Number.isInteger(idNumerico) || idNumerico <= 0 || !/^\d+$/.test(id)) {
        return 'ID inválido. O ID deve ser um número inteiro positivo';
    }
    return null;
};

module.exports = {
    validarCpf,
    validarNome,
    verificarCpfExistente,
    validarCamposObrigatorios,
    validarNomeMinimo,
    validarNomeProduto,
    validarPreco,
    validarEstoque,
    validarCamposObrigatoriosProduto,
    validarCamposObrigatoriosPut,
    validarCamposObrigatoriosProdutoPut,
    verificarProdutoExistente,
    salvarProdutoNoDb,
    validarId,
    validarQuantidade,
};

// Função para validar o CPF (formato 111.222.333-44)
const validarCpf = (cpf) => {
    const cpfRegex = /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/;
    return cpfRegex.test(cpf);
};

// Função para validar o Nome (apenas letras e espaços)
const validarNome = (nome) => {
    // A regex já permite letras minúsculas, maiúsculas, acentuadas e espaços
    const nomeRegex = /^[a-zA-ZÀ-ÿ\s]+$/; // Permite letras (minúsculas e maiúsculas), acentuadas e espaços
    return nomeRegex.test(nome);
};

// Função para verificar se o CPF já existe no banco de dados
const verificarCpfExistente = async (Cliente, cpf) => {
    const clienteExistente = await Cliente.findOne({ where: { cpf } });
    return clienteExistente;
};

// Função para validar campos obrigatórios (nome, cpf, e endereco)
const validarCamposObrigatorios = (nome, cpf, endereco) => {
    if (!nome || !cpf || !endereco) {
        return 'Nome, CPF e Endereço são obrigatórios';
    }
    return null;
};

// Função para validar se o nome tem pelo menos 2 caracteres
const validarNomeMinimo = (nome) => {
    if (nome && nome.length < 2) {
        return 'Nome muito curto. Deve ter pelo menos 2 caracteres.';
    }
    return null;
};

// Função para validar o nome do produto (apenas letras e espaços)
const validarNomeProduto = (nome) => {
    // A regex permite apenas letras (maiusculas e minúsculas), acentuadas e espaços
    const nomeProdutoRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return nomeProdutoRegex.test(nome);
};

/// Função para validar o preço do produto (deve ser um número positivo maior que zero)
const validarPreco = (preco) => {
    // Se o preço for uma string, tentamos substituir a vírgula por ponto
    let precoComPonto = preco.toString().replace(",", ".");

    // Se o valor inicial tinha vírgula, vamos retornar uma mensagem informando isso
    if (preco !== precoComPonto) {
        return { valid: false, message: "O preço deve ser no formato correto: use ponto (.) em vez de vírgula. Exemplo: 4.49" };
    }

    // Converte a string para número
    const precoNumerico = parseFloat(precoComPonto);

    // O preço deve ser um número maior que zero
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
        return { valid: false, message: "Preço deve ser um número positivo maior que zero." };
    }

    // Se tudo estiver correto, retornamos como válido
    return { valid: true };
};


// Função para validar o estoque do produto (deve ser um número inteiro não negativo)
const validarEstoque = (estoque) => {
    // Garantir que o estoque seja interpretado como número inteiro, mesmo se for passado como string
    const estoqueNumerico = parseInt(estoque, 10);

    // O estoque deve ser um número inteiro não negativo
    if (!Number.isInteger(estoqueNumerico) || estoqueNumerico < 0) {
        return { valid: false, message: "O estoque deve ser um número inteiro não negativo." };
    }

    // Se tudo estiver correto, retornamos como válido
    return { valid: true };
};

// Função para validar campos obrigatórios (nome, preço e estoque)
const validarCamposObrigatoriosProduto = (nome, preco, estoque) => {
    if (!nome || preco === undefined || estoque === undefined) {
        return 'Nome, Preço e Estoque são obrigatórios';
    }
    return null;
};

// Função para verificar se o nome do produto já existe no banco de dados
const verificarProdutoExistente = async (Produto, nome) => {
    const produtoExistente = await Produto.findOne({ where: { nome } });
    return produtoExistente;
};

// Função para formatar o preço para 2 casas decimais
const formatarPreco = (preco) => {
    // Converte o preço para número com 2 casas decimais
    const precoNumerico = parseFloat(preco);
    if (isNaN(precoNumerico)) {
        throw new Error("Preço inválido");
    }
    return precoNumerico.toFixed(2); // Formata para 2 casas decimais
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
    verificarProdutoExistente,
    formatarPreco 
};

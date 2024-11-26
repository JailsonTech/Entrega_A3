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

// Função para validar o preço
const validarPreco = (preco) => {
    // Substituir a vírgula por ponto e garantir que seja um número válido
    let precoComPonto = preco.toString().replace(",", ".");

    // Convertendo para float e verificando se o valor é um número válido
    const precoNumerico = parseFloat(precoComPonto);

    // Se o preço não for um número válido ou for menor ou igual a zero, retorna erro
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
        return { valid: false, message: "Preço deve ser um número positivo maior que zero." };
    }

    // Retorna o preço numérico (float) já convertido
    return { valid: true, precoNumerico };
};


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

// Função para validar o estoque do produto (deve ser um número inteiro não negativo)
const validarEstoque = (estoque) => {
    // Garantir que o estoque seja interpretado como número inteiro, mesmo se for passado como string
    const estoqueNumerico = parseFloat(estoque); // Usar parseFloat para verificar números decimais

    // Verificar se o estoque é um número válido
    if (isNaN(estoqueNumerico)) {
        return { valid: false, message: `O valor '${estoque}' não é um número válido.` };
    }

    // O estoque deve ser um número inteiro não negativo
    if (!Number.isInteger(estoqueNumerico)) {
        return { valid: false, message: `O valor '${estoque}' não é um número inteiro. O estoque deve ser um número inteiro não negativo.` };
    }

    if (estoqueNumerico < 0) {
        return { valid: false, message: `O valor '${estoque}' é inválido. O estoque não pode ser negativo.` };
    }

    // Se tudo estiver correto, retornamos como válido
    return { valid: true };
};


// Função para validar se pelo menos um dos campos (nome, preco ou estoque) foi informado
const validarCamposObrigatoriosProduto = (nome, preco, estoque) => {
    if (!nome && preco === undefined && estoque === undefined) {
        return 'Pelo menos um campo deve ser informado: nome, preco ou estoque.';
    }
    return null;
};



// Função para verificar se o nome do produto já existe no banco de dados
const verificarProdutoExistente = async (Produto, nome) => {
    const produtoExistente = await Produto.findOne({ where: { nome } });
    return produtoExistente;
};

// Função de validação de ID
const validarIdProduto = (id) => {
    // Garantir que o id seja um número inteiro positivo
    const idNumerico = parseInt(id, 10);  // Convertendo para número inteiro
    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
        return 'ID inválido. O ID deve ser um número inteiro positivo.';
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
    verificarProdutoExistente,
    salvarProdutoNoDb,
    validarIdProduto 
};

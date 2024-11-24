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
const validarNomeProduto = (item) => {
    // A regex permite apenas letras (maiusculas e minúsculas), acentuadas e espaços
    const nomeProdutoRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return nomeProdutoRegex.test(item);
};

// Função para validar o preço do produto (deve ser um número positivo maior que zero)
const validarPreco = (preco) => {
    // O preço deve ser um número maior que zero
    return !isNaN(preco) && preco > 0;
};

// Função para validar o estoque do produto (deve ser um número inteiro não negativo)
const validarEstoque = (estoque) => {
    // O estoque deve ser um número inteiro não negativo
    return Number.isInteger(estoque) && estoque >= 0;
};

// Função para validar campos obrigatórios (nome, preço e estoque)
const validarCamposObrigatoriosProduto = (item, preco, estoque) => {
    if (!item || preco === undefined || estoque === undefined) {
        return 'Nome, Preço e Estoque são obrigatórios';
    }
    return null;
};

// Função para verificar se o nome do produto já existe no banco de dados
const verificarProdutoExistente = async (Produto, item) => {
    const produtoExistente = await Produto.findOne({ where: { item } });
    return produtoExistente;
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
    verificarProdutoExistente
};

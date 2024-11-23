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

module.exports = {
    validarCpf,
    validarNome,
    verificarCpfExistente,
    validarCamposObrigatorios,
    validarNomeMinimo
};

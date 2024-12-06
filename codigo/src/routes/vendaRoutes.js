const express = require('express');
const vendaController = require('../controllers/vendaController'); // Importa o controlador de vendas
const { validarQuantidade } = require('../utils/validacoes'); // Importa o middleware de validação de quantidade

const router = express.Router();

// Middleware para validar a quantidade
const validarQuantidadeMiddleware = (req, res, next) => {
    const { quantidade } = req.body;

    // Valida a quantidade usando a função de validação
    const { valid, message } = validarQuantidade(quantidade);

    if (!valid) {
        return res.status(400).json({ mensagem: message });
    }

    next(); // Se a quantidade for válida, chama o próximo middleware ou controlador
};

// Rota para criar uma nova venda, utilizando o middleware de validação de quantidade
router.post('/', validarQuantidadeMiddleware, vendaController.criarVenda);

module.exports = router;

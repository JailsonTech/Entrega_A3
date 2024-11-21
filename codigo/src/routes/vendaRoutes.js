// src/routes/vendaRoutes.js
const express = require('express');
const vendaController = require('../controllers/vendaController'); // Importa o controlador de vendas

const router = express.Router();

// Rota para criar uma nova venda
router.post('/', vendaController.criarVenda);

module.exports = router;

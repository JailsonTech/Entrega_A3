// src/routes/relatorioRoutes.js
const express = require('express');
const relatorioController = require('../controllers/relatorioController');
const router = express.Router();

// Rota para listar todos os relatórios
router.get('/', relatorioController.obterRelatorios); 

// Rota para gerar o relatório de produtos com baixo estoque
router.get('/baixo-estoque', relatorioController.relatorioBaixoEstoque);

// Rota para deletar relatório por ID
router.delete('/:id', relatorioController.deletarRelatorio);

module.exports = router;

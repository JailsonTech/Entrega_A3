// src/routes/produtoRoutes.js
const express = require('express');
const produtoController = require('../controllers/produtoController');
const router = express.Router();

// Definir as rotas para produtos
router.post('/', produtoController.criarProduto);
router.get('/', produtoController.obterProdutos);
router.put('/:id', produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;

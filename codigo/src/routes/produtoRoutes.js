//routes/produtoRoutes.js

const express = require('express');
const produtoController = require('../controllers/produtoController');
const router = express.Router();

// Rota para criar um novo produto
router.post('/', produtoController.criarProduto);

// Rota para obter todos os produtos ou buscar produtos pelo nome
router.get('/:item?', produtoController.obterProdutos); // O parâmetro 'item' é opcional

// Rota para atualizar um produto, usando id ou item
router.put('/:id?/:item?', produtoController.atualizarProduto);

// Rota para deletar um produto
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;

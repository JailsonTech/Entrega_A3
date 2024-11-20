const express = require('express');
const produtoController = require('../controllers/produtoController');
const router = express.Router();

// Rota para criar um novo produto
router.post('/', produtoController.criarProduto);

// Rota para obter todos os produtos ou buscar produtos pelo nome
router.get('/:nome?', produtoController.obterProdutos); // O parâmetro 'nome' é opcional

// Rota para atualizar um produto
router.put('/:id', produtoController.atualizarProduto);

// Rota para deletar um produto
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;

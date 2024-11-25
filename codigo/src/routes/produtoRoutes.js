//routes/produtoRoutes.js

const express = require('express');
const produtoController = require('../controllers/produtoController');
const router = express.Router();

// Rota para criar um novo produto
router.post('/', produtoController.criarProduto);

// Rota para obter todos os produtos 
router.get('/', produtoController.obterProdutos); 

// Obter produto por nome
router.get('/nome/:nome', produtoController.obterProdutoPorNome);

// Rota para obter um produto por ID
router.get('/id/:id', produtoController.obterProdutoPorId);

// Atualizar produto pelo ID com Put
router.put('/id/:id', produtoController.atualizarProdutoPorId);  

// Atualizar produto pelo Nome com Put
router.put('/nome/:nome', produtoController.atualizarProdutoPorNome);  

// Atualizar produto pelo Nome com Patch
router.patch('/id/:id', produtoController.atualizarProdutoPorId);  

// Atualizar produto pelo Nome com Patch
router.patch('/nome/:nome', produtoController.atualizarProdutoPorNome);  

// Deletar produto pelo ID
router.delete('/id/:id', produtoController.deletarProdutoPorId);  

// Deletar produto pelo Nome
router.delete('/nome/:nome', produtoController.deletarProdutoPorNome);  

// Deletar todos os produtos
router.delete('/todos', produtoController.deletarTodosProdutos);


module.exports = router;

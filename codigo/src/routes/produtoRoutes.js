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

// Atualizar produto pelo ID
router.put('id/:id', produtoController.atualizarProdutoPorId);  

// Deletar produto pelo ID
router.delete('id/:id', produtoController.deletarProdutoPorId);  


module.exports = router;

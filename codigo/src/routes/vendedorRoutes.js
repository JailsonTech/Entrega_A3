// src/routes/vendedorRoutes.js
const express = require('express');
const vendedorController = require('../controllers/vendedorController');
const router = express.Router();

// Rota para criar vendedor
router.post('/', vendedorController.criarVendedor);  

// Rota para buscar tudo
router.get('/', vendedorController.obterVendedores);  

// Rota para busca por nome
router.get('/nome/:nome', vendedorController.obterVendedoresPorNome);  

// Rota para busca por CPF
router.get('/cpf/:cpf', vendedorController.obterVendedoresPorCpf);

// Atualizar vendedor por ID com PUT
router.put('/id/:id', vendedorController.atualizarVendedorPorId); 

// Atualizar vendedor por CPF com PUT
router.put('/cpf/:cpf', vendedorController.atualizarVendedorPorCpf);  

// Atualizar vendedor por ID com PATCH
router.patch('/id/:id', vendedorController.atualizarVendedorPorId);  

// Atualizar vendedor por CPF com PATCH
router.patch('/cpf/:cpf', vendedorController.atualizarVendedorPorCpf);  

// Rota para deletar vendedor por ID
router.delete('/id/:id', vendedorController.deletarVendedorPorId);  

// Rota para deletar vendedor por CPF
router.delete('/cpf/:cpf', vendedorController.deletarVendedorPorCpf); 

// Rota para deletar todos os vendedores
router.delete('/todos', vendedorController.deletarTodosVendedores)

module.exports = router;


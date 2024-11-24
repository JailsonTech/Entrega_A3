// src/routes/vendedorRoutes.js
const express = require('express');
const vendedorController = require('../controllers/vendedorController');
const router = express.Router();

// Rotas para vendedores
router.post('/', vendedorController.criarVendedor);  // Rota para criar vendedor
router.get('/', vendedorController.obterVendedores);  // Rota para buscar tudo
router.get('/nome/:nome', vendedorController.obterVendedoresPorNome);  // Rota para busca por nome
router.get('/cpf/:cpf', vendedorController.obterVendedoresPorCpf);  // Rota para busca por CPF
router.put('/id/:id', vendedorController.atualizarVendedorPorId);  // Atualizar vendedor por ID
router.put('/cpf/:cpf', vendedorController.atualizarVendedorPorCpf);  // Atualizar vendedor por CPF
router.delete('/id/:id', vendedorController.deletarVendedorPorId);  // Rota para deletar vendedor
router.delete('/cpf/:cpf', vendedorController.deletarVendedorPorCpf);  // Rota para deletar vendedor

module.exports = router;

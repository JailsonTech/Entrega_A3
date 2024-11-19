// src/routes/vendedorRoutes.js
const express = require('express');
const vendedorController = require('../controllers/vendedorController');
const router = express.Router();

// Definir as rotas para vendedores
router.post('/', vendedorController.criarVendedor);
router.get('/', vendedorController.obterVendedores);
router.put('/:id', vendedorController.atualizarVendedor);
router.delete('/:id', vendedorController.deletarVendedor);

module.exports = router;

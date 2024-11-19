const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rotas CRUD para clientes
router.post('/', clienteController.criarCliente);  // Criação do cliente
router.get('/', clienteController.obterClientes); // Obter todos os clientes
router.put('/:id', clienteController.atualizarCliente); // Atualizar um cliente
router.delete('/:id', clienteController.deletarCliente); // Deletar um cliente

module.exports = router;

const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rota para criar um novo cliente
router.post('/', clienteController.criarCliente);

// Rota para obter todos os clientes ou buscar clientes pelo nome
router.get('/:nome?', clienteController.obterClientes); // Aqui, o parâmetro 'nome' é opcional

// Rota para atualizar um cliente
router.put('/:id', clienteController.atualizarCliente);

// Rota para deletar um cliente
router.delete('/:id', clienteController.deletarCliente);

module.exports = router;

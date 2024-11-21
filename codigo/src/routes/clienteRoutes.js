const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rota para criar um novo cliente
router.post('/', clienteController.criarCliente);

// Rota para obter todos os clientes ou buscar clientes pelo nome
router.get('/nome/:nome?', clienteController.obterClientes);  // Rota para buscar por nome (opcional)

// Rota para obter clientes pelo CPF
router.get('/cpf/:cpf', clienteController.obterClientes); // Rota para buscar por CPF

// Rota para atualizar um cliente
router.put('/:id', clienteController.atualizarCliente);

// Rota para deletar um cliente por ID ou CPF
router.delete('/:idOrCpf', clienteController.deletarCliente); // O parâmetro foi renomeado para idOrCpf

module.exports = router;

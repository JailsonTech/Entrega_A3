// src/routes/relatorioRoutes.js
const express = require('express');
const relatorioController = require('../controllers/relatorioController');
const router = express.Router();

// Rota para listar todos os relatórios
router.get('/', relatorioController.obterRelatorios); 

// Rota para gerar o relatório de produtos com baixo estoque
router.get('/baixo-estoque', relatorioController.relatorioBaixoEstoque);

// Rotas para gerar o relatório de produtos com Consumo Medio
router.get('/consumo-medio', relatorioController.relatorioConsumoMedio);
router.get('/consumo-medio/:id', relatorioController.relatorioConsumoMedioId);

// Rota para gerar o relatório de Produtos por Cliente
router.get('/produto-cliente/:id', relatorioController.relatorioProdutosCliente);

// Todos com apenas (/:id) serão passados para baixo por conta de um erro ao realizar consultas, tratando os acima como se fossem o :id

// Rota para obter um relatório específico por ID
router.get('/:id', relatorioController.obterRelatorioPorId); 

// Rota para deletar relatório por ID
router.delete('/:id', relatorioController.deletarRelatorio);

module.exports = router;

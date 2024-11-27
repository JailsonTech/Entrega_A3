const express = require('express');
const router = express.Router();

// Importar o controlador de pedidos de compra
const pedidoCompraController = require('../controllers/pedidoCompraController');

// Rota para receber um pedido de compra
router.post('/receber', pedidoCompraController.receberPedidoCompra);

// Rota para cancelar um pedido de compra
router.post('/cancelar', pedidoCompraController.cancelarPedidoCompra);

module.exports = router;

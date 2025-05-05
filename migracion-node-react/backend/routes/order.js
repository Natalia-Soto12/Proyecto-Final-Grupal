const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/confirm', orderController.confirmOrder);

router.put('/:numPedido', orderController.updateOrderStatus);

router.get('/:numPedido/status', orderController.getOrderStatus);

module.exports = router;

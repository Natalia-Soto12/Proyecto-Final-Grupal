const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.listProducts);

router.post('/register', productController.registerProduct);

router.put('/:code', productController.updateProduct);

router.delete('/:code', productController.deleteProduct);

module.exports = router;

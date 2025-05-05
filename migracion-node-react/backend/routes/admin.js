const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

router.use(adminAuth);

router.post('/register', adminController.registerAdmin);

router.delete('/:id', adminController.deleteAdmin);

router.put('/:id', adminController.updateAdmin);

router.get('/list', adminController.listAdmins);

module.exports = router;

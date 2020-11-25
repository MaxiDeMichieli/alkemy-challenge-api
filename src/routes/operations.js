const express = require('express');
const router = express.Router();
const operationsController = require('../controllers/operationsController');
const {isAuth} = require('../middleware/auth');
const createOperationValidations = require('../validations/createOperationValidations');

router.post('/create', isAuth, createOperationValidations, operationsController.create);

module.exports = router;
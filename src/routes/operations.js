const express = require('express');
const router = express.Router();
const operationsController = require('../controllers/operationsController');
const {isAuth} = require('../middleware/auth');
const createOperationValidations = require('../validations/createOperationValidations');

/* CREATE OPERATIONS */
router.post('/create', isAuth, createOperationValidations, operationsController.create);

/* LIST ALL OPERATIONS */
router.get('/list', isAuth, operationsController.listAll);


module.exports = router;
const express = require('express');
const router = express.Router();
const {create, listAll} = require('../controllers/operationsController');
const {isAuth} = require('../middleware/auth');
const createOperationValidations = require('../validations/createOperationValidations');

/* CREATE OPERATIONS */
router.post('/create', isAuth, createOperationValidations, create);

/* LIST ALL OPERATIONS */
router.get('/list', isAuth, listAll);


module.exports = router;
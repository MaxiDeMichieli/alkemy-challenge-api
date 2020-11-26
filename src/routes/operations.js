const express = require('express');
const router = express.Router();
const {create, listAll, listOne, edit} = require('../controllers/operationsController');
const {isAuth} = require('../middleware/auth');
const createValidations = require('../validations/createOperationValidations');
const editValidations = require('../validations/editOperationValidations');

/* CREATE OPERATIONS */
router.post('/create', isAuth, createValidations, create);

/* LIST ALL OPERATIONS */
router.get('/list', isAuth, listAll);

/* LIST ONE OPERATION */
router.get('/list/:id', isAuth, listOne);

/* EDIT OPERATION */
router.patch('/edit/:id', isAuth, editValidations, edit);


module.exports = router;
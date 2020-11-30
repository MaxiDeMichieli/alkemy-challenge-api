const express = require('express');
const router = express.Router();
const {createOp, listAll, listOne, editOp, deleteOp, balance} = require('../controllers/operationsController');
const {isAuth} = require('../middleware/auth');
const createValidations = require('../validations/createOperationValidations');
const editValidations = require('../validations/editOperationValidations');

/* CREATE OPERATIONS */
router.post('/create', isAuth, createValidations, createOp);

/* LIST ALL OPERATIONS */
router.get('/list', isAuth, listAll);

/* LIST ONE OPERATION */
router.get('/list/:id', isAuth, listOne);

/* CURRENT BALANCE */
router.get('/balance', isAuth, balance);

/* EDIT OPERATION */
router.patch('/edit/:id', isAuth, editValidations, editOp);

/* DELETE OPERATION */
router.delete('/delete/:id', isAuth, deleteOp);


module.exports = router;
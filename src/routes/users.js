const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const signupValidations = require('../validations/signupValidations');

router.post('/signup', signupValidations, usersController.signup);
router.post('/email-activate', usersController.activateAccount);

module.exports = router;
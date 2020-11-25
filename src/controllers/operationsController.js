const db = require('../database/models');
const {validationResult} = require('express-validator');

const operationsController = {
    create: (req, res) => {
        const {id} = req.user;
        const {concept, amount, date, type} = req.body;
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({status:400, ...errors})
        }

        db.Operations.create({
            concept: concept.trim(),
            amount: parseInt(amount),
            date: date,
            type_id: parseInt(type),
            user_id: id
        })
        .then(result => {
            res.status(200).json({status:200, ...result});
        })
        .catch(err => {
            res.json(err)
        })
    }
}

module.exports = operationsController;
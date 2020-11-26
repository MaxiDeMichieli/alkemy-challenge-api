const db = require('../database/models');
const {validationResult} = require('express-validator');

const operationsController = {
    create: (req, res) => {
        const {id} = req.user;
        const {concept, amount, date, type} = req.body;
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({error: 'Validations errors', ...errors})
        }

        db.Operations.create({
            concept: concept.trim(),
            amount: parseInt(amount),
            date: date,
            type_id: parseInt(type),
            user_id: id
        })
        .then(result => {
            res.status(200).json({error: null, ...result});
        })
        .catch(err => {
            res.status(500).json({error: 'Server error'})
        })
    },
    listAll: (req, res) => {
        const {id} = req.user;
        let {limit, offset, type} = req.query;
        limit = isNaN(Number(limit)) ? undefined : Number(limit);
        offset = isNaN(Number(offset)) ? undefined : Number(offset);
        if(limit == undefined || offset == undefined) {
            return res.status(400).json({error:'you must set a limit and an offset in the query string'})
        }
        let nextPage = offset + limit;
        if(type != undefined) {
            type = {name: type}
        }

        db.Operations.findAll({
            where: {
                user_id: id
            },
            offset: offset,
            limit: limit,
            order: [
                ['date', 'DESC']
            ],
            include: [
                {association: 'type',
                where: type
            }
            ]
        })
        .then(operations => {
            let operationsMapped = operations.map(op => {
                return {
                    concept: op.concept,
                    amount: op.amount,
                    date: op.date,
                    user: op.user_id,
                    type: op.type.name
                }
            })

            let response = {
                error: null,
                nextPage: `${req.protocol}://${req.get('host')}/api/operations/list?limit=${limit}&offset=${nextPage}`,
                opearations: operationsMapped
            }
            return res.status(200).json(response)
        })
        .catch(err => {
            return res.status(500).json({error: 'Server error'})
        })
    }
}

module.exports = operationsController;
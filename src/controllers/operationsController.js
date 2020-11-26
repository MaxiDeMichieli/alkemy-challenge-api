const db = require('../database/models');
const {validationResult} = require('express-validator');

const operationsController = {
    createOp: (req, res) => {
        const {id} = req.user;
        const {concept, amount, date, type} = req.body;
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({error: 'Validations errors', errors: errors.mapped()})
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
            offset,
            limit,
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
                    id: op.id,
                    concept: op.concept,
                    amount: op.amount,
                    date: op.date,
                    user: op.user_id,
                    type: op.type.name,
                    url: `${req.protocol}://${req.get('host')}/api/operations/list/${op.id}`
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
    },
    listOne: (req, res) => {
        const {id} = req.user;
        let idParam = Number(req.params.id);
        if(isNaN(idParam)) {
            return res.status(400).json({error: 'Id must be a number'})
        }
        db.Operations.findOne({
            where: {
                id: idParam,
                user_id: id
            },
            include: [
                {association: 'type'}
            ]
        })
        .then(operation => {
            if(operation == null) {
                return res.status(400).json({error: 'There is no operation with that id'})
            }
            operation = {
                id: operation.id,
                concept: operation.concept,
                amount: operation.amount,
                date: operation.date,
                user: operation.user_id,
                type: operation.type.name,
                editUrl: `${req.protocol}://${req.get('host')}/api/operations/edit/${operation.id}`
            }

            return res.status(200).json({error: null, operation})
        })
        .catch(err => {
            return res.status(500).json({error: 'Server error'})
        })
    },
    editOp: (req, res) => {
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({error: 'Validations errors', errors: errors.mapped()})
        }

        const {concept, amount, date} = req.body;
        const {id} = req.user;
        const idParams = Number(req.params.id);
        if(isNaN(idParams)) {
            return res.status(400).json({error: 'Id must be a number'})
        }

        db.Operations.update({
            concept: concept.trim(),
            amount: parseInt(amount),
            date: date,
        }, {
            where: {
                id: idParams,
                user_id: id
            }
        })
        .then(result => {
            if(result[0] == 0) {
                return res.status(400).json({err: 'There is no operation with that id or you did not make any changes'})
            } else {
                return res.status(200).json({error: null, message: 'Changes made successfully'})
            }
        })
        .catch(err => {
            return res.status(500).json({error: 'Server error'})
        })
    },
    deleteOp: (req, res) => {
        const idParams = req.params.id;
        const {id} = req.user;

        db.Operations.destroy({
            where:{
            id: idParams,
            user_id: id
        }})
        .then(result => {
            if(result == 1) {
                return res.status(200).json({error: null, message: 'Operation removed successfully.'})
            } else {
                return res.status(400).json({error: 'There is no operation with that id.'})
            }
        })
        .catch(err => {
            return res.status(500).json({error: 'Server error'})
        })
    }
}

module.exports = operationsController;
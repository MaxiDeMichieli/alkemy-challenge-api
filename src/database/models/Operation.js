module.exports = function(sequelize, dataTypes){
    let alias = 'Operations';

    let cols= {
        id:{
            type:dataTypes.INTEGER(11),
            primaryKey:true,
            autoIncrement:true,
            allowNull:false
        },
        concept:{
            type:dataTypes.STRING(100),
            allowNull:false
        },
        amount:{
            type:dataTypes.INTEGER(11),
            allowNull:false
        },
        date:{
            type:dataTypes.DATEONLY,
            allowNull:false
        },
        type_id:{
            type:dataTypes.INTEGER(11),
            allowNull:false
        },
        user_id:{
            type:dataTypes.INTEGER(11),
            allowNull:false
        }
    }

    let config = {
        tableName: "operations",
        timestamps: false
    }

    const Operation = sequelize.define(alias, cols, config);

    Operation.associate = (modelos) => {
        Operation.belongsTo(modelos.TypeOfOperations, {
            as:'typeOfOperations',
            foreignKey:'type_id'
        })
        Operation.belongsTo(modelos.Users, {
            as:'user',
            foreignKey:'user_id'
        })
    }

    return Operation;
}
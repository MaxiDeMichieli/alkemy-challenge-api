module.exports = function(sequelize, dataTypes){
    let alias = 'TypeOfOperations';

    let cols= {
        id:{
            type:dataTypes.INTEGER(11),
            primaryKey:true,
            autoIncrement:true,
            allowNull:false
        },
        name:{
            type:dataTypes.STRING(45),
            allowNull:false
        }
    }

    let config = {
        tableName: "typeOfOperations",
        timestamps: false
    }

    const TypeOfOperation = sequelize.define(alias, cols, config);

    TypeOfOperation.associate = (modelos) => {
        TypeOfOperation.hasMany(modelos.Operations, {
            as:'operations',
            foreignKey:'type_id'
        }) 
    }

    return TypeOfOperation;
}
module.exports = function(sequelize, dataTypes){
    let alias = 'Users';

    let cols= {
        id: {
            type: dataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        first_name: {
            type: dataTypes.STRING(45),
            allowNull: false
        },
        last_name: {
            type: dataTypes.STRING(45),
            allowNull: false
        },
        email: {
            type: dataTypes.STRING(60),
            allowNull: false
        },
        password: {
            type: dataTypes.STRING(70),
            defaultValue: null
        },
        social_id: {
            type: dataTypes.STRING(60),
            defaultValue: null
        },
        reset_link: {
            type: dataTypes.STRING(150),
            defaultValue: null
        }
    }

    let config = {
        tableName: "users",
        timestamps: true,
        underscored: true
    }

    const User = sequelize.define(alias, cols, config);

    User.associate = (modelos) => {
        User.hasMany(modelos.Operations, {
            as: 'operations',
            foreignKey: 'user_id'
        })
    }

    return User;
}
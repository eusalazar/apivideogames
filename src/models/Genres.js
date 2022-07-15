const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('genres', {
        id: {
            type: DataTypes.INTEGER, //tipo de dato
            primaryKey: true,
            autoIncrement: true,
            unique: true,
          },
        name: {
            type: DataTypes.STRING
        }
    })
}
require('dotenv').config()
const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: false,
    
})

try {
    sequelize.authenticate()
    console.log("Connection has been establised successfully with DataBase...!")
} catch (error) {
    console.error("Unable to connect to the database", error)
}

const db = {
sequelize,
Sequelize,
User : require("../src/models/user_model/user.model")(sequelize,DataTypes),
}



// require('../config/association')(db);

db.sequelize.sync({ alter: true })
  .then(() => console.log('Database synchronized successfully.'))
  .catch(console.error);
 
module.exports = db; 
 

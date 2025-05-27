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
Seller : require("../src/models/seller_model/seller.model")(sequelize,DataTypes),
Category: require("../src/models/category_model/category.model")(sequelize,DataTypes),
Subcategory: require("../src/models/subcategory_model/subcategory.model")(sequelize,DataTypes),
Product : require("../src/models/product_model/product.model")(sequelize ,DataTypes ),
ProductVariant : require("../src/models/product_varient_model/product.varient.model")(sequelize,DataTypes),
Wishlist : require("../src/models/wishlist_model/wishlist.model")(sequelize,DataTypes),
ProductReview : require("../src/models/review_model/review.model")(sequelize,DataTypes),
Inventory : require("../src/models/inventory_model/inventory.model")(sequelize,DataTypes),
Cart : require("../src/models/carts_model/cart.model")(sequelize,DataTypes)
} 



require("../config/association")(db)
db.sequelize.sync({ alter: true })
  .then(() => console.log('Database synchronized successfully.'))
  .catch(console.error);
 
module.exports = db; 
 

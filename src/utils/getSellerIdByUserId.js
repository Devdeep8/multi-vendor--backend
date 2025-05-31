// helpers/getSellerIdByUserId.js
const db = require('../../config/database')
const Seller = db.Seller
async function getSellerIdByUserId(user_id) {
  try {
    const seller = await Seller.findOne({
      where: { user_id },
      attributes: ['id'],
      raw: true
    });

    return seller ? seller.id : null; // or throw an error if not found
  } catch (error) {
    console.error('Error getting seller ID:', error);
    throw error;
  }
}

module.exports = getSellerIdByUserId;

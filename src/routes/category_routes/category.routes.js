const express = require('express')
const router = express.Router()
const categoryController = require('../../controllers/category_controller/category.controller')
const subcategoryController = require('../../controllers/category_controller/category.controller')

router.post('/categories/create', categoryController.createCategory)
router.get('/categories/get-all', categoryController.getCategories)

router.post('/subcategories/create', subcategoryController.createSubcategory)

module.exports = router

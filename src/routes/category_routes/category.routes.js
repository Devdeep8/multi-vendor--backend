const express = require('express')
const router = express.Router()
const categoryController = require('../../controllers/category_controller/category.controller')
const subcategoryController = require('../../controllers/category_controller/category.controller')

router.post('/categories/create', categoryController.createCategory)
router.get('/categories/get-all', categoryController.getCategories)
router.put("/categories/update/:id", categoryController.updateCategory);
router.delete("/categories/delete/:id", categoryController.deleteCategory);
router.delete("/categories/subcategories/delete/:id", categoryController.deleteSubcategory);
router.put("/categories/subcategories/:id", categoryController.updateSubcategory);
router.post('/subcategories/create', subcategoryController.createSubcategory)
router.get("/:slug", categoryController.getProductsByCategoryOrSubcategorySlug);

module.exports = router

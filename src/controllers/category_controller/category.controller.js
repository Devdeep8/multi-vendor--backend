const db = require("../../../config/database")
const Category = db.Category
const Subcategory = db.Subcategory

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Name and slug are required" })
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
    })

    res.status(201).json({ success: true, category })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get all categories with subcategories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: {
        model: Subcategory,
      },
      order: [['name', 'ASC']],
    })

    res.status(200).json({ success: true, categories })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}



exports.createSubcategory = async (req, res) => {
  try {
    const { name, slug, category_id, description } = req.body

    if (!name || !slug || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Name, slug, and category_id are required"
      })
    }

    const subcategory = await Subcategory.create({
      name: name.trim(),
      slug: slug.trim(),
      category_id,
      description: description?.trim() || null
    })

    res.status(201).json({ success: true, subcategory })
  } catch (err) {
    console.error("Create Subcategory Error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
}




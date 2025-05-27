const { v4: uuidv4 } = require("uuid");
const db = require("../../../config/database");
const Inventory = db.Inventory;
const ProductVariant = db.ProductVariant;

exports.createInventory = async (req, res) => {
  try {
    const { product_variant_id, stock, restock_date } = req.body;

    // Ensure product variant exists
    const variant = await ProductVariant.findByPk(product_variant_id);
    if (!variant) return res.status(404).json({ error: "Product Variant not found" });

    const inventory = await Inventory.create({
      id: uuidv4(),
      product_variant_id,
      stock,
      restock_date,
    });

    res.status(201).json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllInventory = async (req, res) => {
  try {
    const data = await Inventory.findAll({ include: [ProductVariant] });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id, {
      include: [ProductVariant],
    });
    if (!inventory) return res.status(404).json({ error: "Not found" });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { stock, restock_date } = req.body;
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) return res.status(404).json({ error: "Not found" });

    await inventory.update({ stock, restock_date, updated_at: new Date() });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) return res.status(404).json({ error: "Not found" });

    await inventory.destroy();
    res.json({ message: "Inventory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

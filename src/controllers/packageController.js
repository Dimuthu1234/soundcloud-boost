const prisma = require('../config/database');

// GET all packages (public)
const getAllPackages = async (req, res) => {
  try {
    const { category } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;

    const packages = await prisma.package.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ packages });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Failed to fetch packages.' });
  }
};

// GET single package (public)
const getPackageById = async (req, res) => {
  try {
    const pkg = await prisma.package.findUnique({
      where: { id: req.params.id },
    });

    if (!pkg) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    res.json({ package: pkg });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ error: 'Failed to fetch package.' });
  }
};

// POST create package (admin only)
const createPackage = async (req, res) => {
  try {
    const { title, description, price, deliveryDays, category } = req.body;

    const pkg = await prisma.package.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        deliveryDays: parseInt(deliveryDays, 10),
        category,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      },
    });

    res.status(201).json({ message: 'Package created successfully.', package: pkg });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Failed to create package.' });
  }
};

// PUT update package (admin only)
const updatePackage = async (req, res) => {
  try {
    const { title, description, price, deliveryDays, category, isActive } = req.body;

    const existing = await prisma.package.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (deliveryDays !== undefined) data.deliveryDays = parseInt(deliveryDays, 10);
    if (category !== undefined) data.category = category;
    if (isActive !== undefined) data.isActive = isActive;
    if (req.file) data.image = `/uploads/${req.file.filename}`;

    const pkg = await prisma.package.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ message: 'Package updated successfully.', package: pkg });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ error: 'Failed to update package.' });
  }
};

// DELETE package (admin only)
const deletePackage = async (req, res) => {
  try {
    const existing = await prisma.package.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    await prisma.package.delete({ where: { id: req.params.id } });

    res.json({ message: 'Package deleted successfully.' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ error: 'Failed to delete package.' });
  }
};

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
};

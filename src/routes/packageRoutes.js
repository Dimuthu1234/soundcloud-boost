const express = require('express');
const { body } = require('express-validator');
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { authenticateAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
// GET /api/packages
router.get('/', getAllPackages);

// GET /api/packages/:id
router.get('/:id', getPackageById);

// Admin routes (protected)
// POST /api/packages
router.post(
  '/',
  authenticateAdmin,
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required.'),
    body('description').notEmpty().withMessage('Description is required.'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number.'),
    body('deliveryDays').isInt({ min: 1 }).withMessage('Delivery days must be a positive integer.'),
    body('category')
      .isIn(['SoundcloudBoost', 'GraphicDesign', 'VideoEditing'])
      .withMessage('Category must be SoundcloudBoost, GraphicDesign, or VideoEditing.'),
  ],
  validate,
  createPackage
);

// PUT /api/packages/:id
router.put('/:id', authenticateAdmin, upload.single('image'), updatePackage);

// DELETE /api/packages/:id
router.delete('/:id', authenticateAdmin, deletePackage);

module.exports = router;

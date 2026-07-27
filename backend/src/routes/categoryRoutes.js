const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { create } = require('../validators/categoryValidators');

const router = Router();

router.get('/', categoryController.list);
router.post('/', auth, requireRole('admin'), validate(create), categoryController.create);

module.exports = router;

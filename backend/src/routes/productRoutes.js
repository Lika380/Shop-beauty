const { Router } = require('express');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { idParam, list, create, update } = require('../validators/productValidators');

const router = Router();

router.get('/', validate(list), productController.list);
router.get('/:id', validate(idParam), productController.getById);
router.post('/', auth, requireRole('admin'), validate(create), productController.create);
router.put('/:id', auth, requireRole('admin'), validate(update), productController.update);
router.delete('/:id', auth, requireRole('admin'), validate(idParam), productController.remove);

module.exports = router;

const { Router } = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { idParam, list, updateStatus } = require('../validators/orderValidators');

const router = Router();

router.use(auth);

router.post('/', orderController.create);
router.get('/', validate(list), orderController.list);
router.get('/:id', validate(idParam), orderController.getById);
router.patch('/:id/status', requireRole('admin'), validate(updateStatus), orderController.updateStatus);

module.exports = router;

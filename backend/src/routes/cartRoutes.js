const { Router } = require('express');
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { addItem, updateItem, itemIdParam } = require('../validators/cartValidators');

const router = Router();

router.use(auth, requireRole('customer'));

router.get('/', cartController.getCart);
router.post('/items', validate(addItem), cartController.addItem);
router.put('/items/:id', validate(updateItem), cartController.updateItem);
router.delete('/items/:id', validate(itemIdParam), cartController.removeItem);

module.exports = router;

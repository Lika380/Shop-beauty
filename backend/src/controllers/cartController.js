const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartModel.getCartWithItems(req.user.id);
  res.json(cart);
});

const addItem = asyncHandler(async (req, res) => {
  const { product_id, quantity } = req.body;

  const product = await productModel.findById(product_id);
  if (!product) {
    throw AppError.badRequest('product_id does not reference an existing product');
  }

  const cart = await cartModel.getOrCreateCart(req.user.id);
  const item = await cartModel.addItem(cart.id, product_id, quantity);
  res.status(201).json(item);
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await cartModel.findItemOwnedByUser(req.params.id, req.user.id);
  if (!item) {
    throw AppError.notFound('Cart item not found');
  }

  const updated = await cartModel.updateItemQuantity(req.params.id, req.body.quantity);
  res.json(updated);
});

const removeItem = asyncHandler(async (req, res) => {
  const item = await cartModel.findItemOwnedByUser(req.params.id, req.user.id);
  if (!item) {
    throw AppError.notFound('Cart item not found');
  }

  await cartModel.removeItem(req.params.id);
  res.status(204).send();
});

module.exports = { getCart, addItem, updateItem, removeItem };

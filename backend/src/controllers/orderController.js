const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { withTransaction } = require('../config/db');
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');

const create = asyncHandler(async (req, res) => {
  const cart = await cartModel.getOrCreateCart(req.user.id);

  const order = await withTransaction(async (client) => {
    const lockedItems = await orderModel.lockCartItemsForUpdate(client, cart.id);

    if (lockedItems.length === 0) {
      throw AppError.badRequest('Cart is empty', 'EMPTY_CART');
    }

    for (const item of lockedItems) {
      if (item.stock_quantity < item.requested_quantity) {
        throw AppError.badRequest(
          `Not enough stock for "${item.name}": requested ${item.requested_quantity}, available ${item.stock_quantity}`,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    const total = lockedItems.reduce(
      (sum, item) => sum + Number(item.price) * item.requested_quantity,
      0
    );

    const newOrder = await orderModel.createOrder(client, {
      userId: req.user.id,
      total: total.toFixed(2),
    });

    await orderModel.createOrderItems(
      client,
      newOrder.id,
      lockedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.requested_quantity,
        price: item.price,
      }))
    );

    for (const item of lockedItems) {
      await orderModel.decrementStock(client, item.product_id, item.requested_quantity);
    }

    await cartModel.clearCart(cart.id, client);

    return newOrder;
  });

  const fullOrder = await orderModel.findById(order.id);
  res.status(201).json(fullOrder);
});

const list = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const isAdmin = req.user.role === 'admin';

  const userId = isAdmin ? req.query.user_id : req.user.id;

  const result = await orderModel.findAll({ userId, status, page, limit });
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const order = await orderModel.findById(req.params.id);
  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    throw AppError.forbidden('You do not have access to this order');
  }

  res.json(order);
});

const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderModel.updateStatus(req.params.id, req.body.status);
  if (!order) {
    throw AppError.notFound('Order not found');
  }
  res.json(order);
});

module.exports = { create, list, getById, updateStatus };

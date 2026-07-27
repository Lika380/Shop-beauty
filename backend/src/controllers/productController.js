const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');

const list = asyncHandler(async (req, res) => {
  const result = await productModel.findAll(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    throw AppError.notFound('Product not found');
  }
  res.json(product);
});

const create = asyncHandler(async (req, res) => {
  if (req.body.category_id) {
    const category = await categoryModel.findById(req.body.category_id);
    if (!category) {
      throw AppError.badRequest('category_id does not reference an existing category');
    }
  }

  const product = await productModel.create(req.body);
  res.status(201).json(product);
});

const update = asyncHandler(async (req, res) => {
  const existing = await productModel.findById(req.params.id);
  if (!existing) {
    throw AppError.notFound('Product not found');
  }

  if (req.body.category_id) {
    const category = await categoryModel.findById(req.body.category_id);
    if (!category) {
      throw AppError.badRequest('category_id does not reference an existing category');
    }
  }

  const product = await productModel.update(req.params.id, req.body);
  res.json(product);
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await productModel.remove(req.params.id);
  if (!deleted) {
    throw AppError.notFound('Product not found');
  }
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };

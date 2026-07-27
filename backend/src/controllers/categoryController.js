const asyncHandler = require('../utils/asyncHandler');
const categoryModel = require('../models/categoryModel');

const list = asyncHandler(async (req, res) => {
  const categories = await categoryModel.findAll();
  res.json(categories);
});

const create = asyncHandler(async (req, res) => {
  const category = await categoryModel.create(req.body);
  res.status(201).json(category);
});

module.exports = { list, create };

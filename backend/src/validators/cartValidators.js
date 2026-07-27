const { z } = require('zod');

const addItem = {
  body: z.object({
    product_id: z.coerce.number().int().positive('must be a positive integer'),
    quantity: z.coerce.number().int().positive('must be a positive integer'),
  }),
};

const updateItem = {
  params: z.object({
    id: z.coerce.number().int().positive('must be a positive integer'),
  }),
  body: z.object({
    quantity: z.coerce.number().int().positive('must be a positive integer'),
  }),
};

const itemIdParam = {
  params: z.object({
    id: z.coerce.number().int().positive('must be a positive integer'),
  }),
};

module.exports = { addItem, updateItem, itemIdParam };

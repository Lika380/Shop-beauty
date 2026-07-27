const { z } = require('zod');

const idParam = {
  params: z.object({
    id: z.coerce.number().int().positive('must be a positive integer'),
  }),
};

const list = {
  query: z.object({
    category: z.coerce.number().int().positive().optional(),
    search: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.enum(['price_asc', 'price_desc']).optional(),
  }),
};

const create = {
  body: z.object({
    name: z.string().trim().min(1, 'is required'),
    description: z.string().trim().optional(),
    price: z.coerce.number().nonnegative('must be zero or greater'),
    stock_quantity: z.coerce.number().int().nonnegative().default(0),
    category_id: z.coerce.number().int().positive().optional().nullable(),
    image_url: z.string().trim().url('must be a valid URL').optional().nullable(),
  }),
};

const update = {
  params: idParam.params,
  body: z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    price: z.coerce.number().nonnegative().optional(),
    stock_quantity: z.coerce.number().int().nonnegative().optional(),
    category_id: z.coerce.number().int().positive().optional().nullable(),
    image_url: z.string().trim().url().optional().nullable(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
};

module.exports = { idParam, list, create, update };

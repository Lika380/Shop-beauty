const { z } = require('zod');

const idParam = {
  params: z.object({
    id: z.coerce.number().int().positive('must be a positive integer'),
  }),
};

const list = {
  query: z.object({
    status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']).optional(),
    user_id: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

const updateStatus = {
  params: idParam.params,
  body: z.object({
    status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
  }),
};

module.exports = { idParam, list, updateStatus };

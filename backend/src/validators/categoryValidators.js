const { z } = require('zod');

const create = {
  body: z.object({
    name: z.string().trim().min(1, 'is required'),
  }),
};

module.exports = { create };


'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./zod-prisma.cjs.production.min.js')
} else {
  module.exports = require('./zod-prisma.cjs.development.js')
}

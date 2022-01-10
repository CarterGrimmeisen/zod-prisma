import { z } from 'zod'
import { Decimal } from 'decimal.js'

export const decimalSchema = z
	.union([z.string(), z.number()])
	.transform((value) => new Decimal(value))

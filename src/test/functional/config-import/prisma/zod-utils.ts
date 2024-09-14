import { z } from 'zod'
import { Prisma } from './.client'

export const decimalSchema = z
  .instanceof(Prisma.Decimal)
  .or(z.string())
  .or(z.number())
  .refine((value) => {
    try {
      return new Prisma.Decimal(value)
    } catch (error) {
      return false
    }
  })
  .transform((value) => new Prisma.Decimal(value))

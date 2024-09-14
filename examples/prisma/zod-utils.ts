import { z } from 'zod'
import { Prisma } from '@prisma/client'

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
  .transform((value) => new Prisma.Decimal(value)) as z.ZodEffects<
  z.ZodEffects<
    z.ZodType<Prisma.Decimal, z.ZodTypeDef, Prisma.Decimal>,
    Prisma.Decimal,
    Prisma.Decimal
  >
>

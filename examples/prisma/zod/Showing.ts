import * as z from 'zod'
import '@prisma/client'

export const ShowingModel = z.object({
  id: z.string(),
  when: z
    .string()
    .regex(
      /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/
    ),
  confirmed: z.boolean(),
  userEmail: z.string(),
  listingMlsn: z.string(),
})

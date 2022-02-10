import * as z from "zod"
import { UserRelations, userSchema, userBaseSchema } from "./index"

export const keychainBaseSchema = z.object({
  userID: z.string(),
})

export interface KeychainRelations {
  owner: z.infer<typeof userBaseSchema> & UserRelations
}

const keychainRelationsSchema: z.ZodObject<{
  [K in keyof KeychainRelations]-?: z.ZodType<KeychainRelations[K]>
}> = z.object({
  owner: z.lazy(() => userSchema),
})

export const keychainSchema = keychainBaseSchema.merge(keychainRelationsSchema)

export const keychainCreateSchema = keychainSchema.partial({
  userID: true,
})

export const keychainUpdateSchema = keychainSchema.partial()

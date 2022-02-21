import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"

export const keychainBaseSchema = z.object({
  userID: z.string(),
})

export interface KeychainRelations {
  owner: z.infer<typeof userBaseSchema> & UserRelations
}

export const keychainRelationsSchema: z.ZodObject<{
  [K in keyof KeychainRelations]: z.ZodType<KeychainRelations[K]>
}> = z.object({
  owner: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
})

export const keychainSchema = keychainBaseSchema
  .merge(keychainRelationsSchema)

export const keychainCreateSchema = keychainBaseSchema.partial({
  userID: true,
})

export const keychainUpdateSchema = keychainBaseSchema
  .partial()
  

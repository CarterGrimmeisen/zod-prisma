import * as z from "zod"
import { KeychainRelations, keychainRelationsSchema, keychainBaseSchema } from "./keychain"

export const userBaseSchema = z.object({
  id: z.string(),
})

export interface UserRelations {
  keychain: (z.infer<typeof keychainBaseSchema> & KeychainRelations) | null
}

export const userRelationsSchema: z.ZodObject<{
  [K in keyof UserRelations]: z.ZodType<UserRelations[K]>
}> = z.object({
  keychain: z.lazy(() => keychainBaseSchema.merge(keychainRelationsSchema)).nullable(),
})

export const userSchema = userBaseSchema
  .merge(userRelationsSchema)

export const userCreateSchema = userBaseSchema.partial({
  id: true,
  keychain: true,
})

export const userUpdateSchema = userBaseSchema
  .partial()
  

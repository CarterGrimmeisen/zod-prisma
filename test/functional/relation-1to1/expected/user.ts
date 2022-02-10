import * as z from "zod"
import { KeychainRelations, keychainSchema, keychainBaseSchema } from "./index"

export const userBaseSchema = z.object({
  id: z.string(),
})

export interface UserRelations {
  keychain?: (z.infer<typeof keychainBaseSchema> & KeychainRelations) | null
}

const userRelationsSchema: z.ZodObject<{
  [K in keyof UserRelations]-?: z.ZodType<UserRelations[K]>
}> = z.object({
  keychain: z.lazy(() => keychainSchema).nullable(),
})

export const userSchema = userBaseSchema.merge(userRelationsSchema)

export const userCreateSchema = userSchema.partial({
  id: true,
  keychain: true,
})

export const userUpdateSchema = userSchema.partial()

import * as z from 'zod'
import { CompleteUser, RelatedUserModel } from './index'

export const KeychainModel = z.object({
	userID: z.string(),
})

export interface CompleteKeychain extends z.infer<typeof KeychainModel> {
	owner: CompleteUser
}

/**
 * RelatedKeychainModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedKeychainModel: z.ZodSchema<CompleteKeychain> = z.lazy(() =>
	KeychainModel.extend({
		owner: RelatedUserModel,
	})
)

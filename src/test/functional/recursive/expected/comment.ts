import * as z from 'zod'

export const CommentModel = z.object({
	id: z.string(),
	author: z.string(),
	contents: z.string(),
	parentId: z.string(),
})

export interface CompleteComment extends z.infer<typeof CommentModel> {
	parent: CompleteComment
	children: CompleteComment[]
}

/**
 * RelatedCommentModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCommentModel: z.ZodSchema<CompleteComment> = z.lazy(() =>
	CommentModel.extend({
		parent: RelatedCommentModel,
		children: RelatedCommentModel.array(),
	})
)

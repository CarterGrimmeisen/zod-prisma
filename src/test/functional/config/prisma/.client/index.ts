/**
 * Model User
 *
 */
export type User = {
	id: string
	name: string
	email: string
}

/**
 * Model Post
 *
 */
export type Post = {
	id: string
	title: string
	contents: string
	userId: string
}

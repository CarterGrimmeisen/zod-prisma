import { PrismaClient, Prisma } from '@prisma/client'
import { UserModel } from './prisma/zod'

const user = UserModel.parse({
	id: 1,
	meta: Prisma.JsonNull,
	posts: [],
})

const prisma = new PrismaClient()

prisma.user.create({ data: user }).then((created) => console.log(`Successfully created ${created}`))

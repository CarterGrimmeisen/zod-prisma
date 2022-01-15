import { UserModel } from './actual/user'
import type { Prisma } from './prisma/.client'
import { PrismaClient } from './prisma/.client'

const input = UserModel.parse({
  meta: {
    name: 'hello',
  },
  optionalMeta: {
    name: 'world',
  },
})

const data: Prisma.UserCreateInput = input

const prisma = new PrismaClient()

prisma.user.create({
  data,
})

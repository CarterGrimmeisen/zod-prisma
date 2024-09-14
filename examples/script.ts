import { PrismaClient } from '@prisma/client'
import { PostModel, UserModel } from './prisma/zod'

const user = UserModel.parse({
  id: 1,
  name: 'John Doe',
  meta: {
    info: 'Hello World',
  },
  posts: [],
})

const post = PostModel.parse({
  id: 1,
  title: 'Hello World',
  authorId: 1,
})

const prisma = new PrismaClient()

// Before running the script, make sure your DB is running
// docker compose up -d
// npx prisma db push

async function main() {
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  const createdUser = await prisma.user.create({ data: user })
  console.log(`Successfully created ${JSON.stringify(createdUser)}`)

  const createdPost = await prisma.post.create({ data: post })
  console.log(`Successfully created ${JSON.stringify(createdPost)}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

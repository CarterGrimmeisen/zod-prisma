import { PrismaClient } from '@prisma/client'
import { PostModel, UserModel } from '../prisma/zod'
import { ProductModel } from '../prisma/zod/product'

const user = UserModel.parse({
  id: 1,
  name: 'John Doe',
  meta: {
    info: 'Hello World',
  },
  money: 100.0,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const post = PostModel.parse({
  id: 1,
  title: 'Hello World',
  authorId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const product = ProductModel.parse({
  id: 1,
  name: 'Sample Product',
  price: 19.99,
  createdAt: new Date(),
  updatedAt: null,
})

const prisma = new PrismaClient()

async function main() {
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()

  const createdUser = await prisma.user.create({ data: user })
  console.log(`Successfully created ${JSON.stringify(createdUser)}`)

  const createdPost = await prisma.post.create({ data: post })
  console.log(`Successfully created ${JSON.stringify(createdPost)}`)

  const createdProduct = await prisma.product.create({ data: product })
  console.log(`Successfully created ${JSON.stringify(createdProduct)}`)

  const userResult = await prisma.user.findUnique({ where: { id: 1 } })
  console.log(`Successfully fetched ${JSON.stringify(UserModel.parse(userResult))}`)

  const postResult = await prisma.post.findUnique({ where: { id: 1 } })
  console.log(`Successfully fetched ${JSON.stringify(PostModel.parse(postResult))}`)

  const productResult = await prisma.product.findUnique({ where: { id: 1 } })
  console.log(`Successfully fetched ${JSON.stringify(ProductModel.parse(productResult))}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

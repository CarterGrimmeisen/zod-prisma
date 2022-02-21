import { execa } from "execa"
import { expectTypeOf } from "expect-type"
import { removeAsync as remove } from "fs-jetpack"
import { resolve } from "path"
import { beforeAll, describe, test } from "vitest"
import { z } from "zod"
import type { Prisma } from "./prisma/.client"

describe("usage tests", () => {
  beforeAll(async () => {
    await remove(resolve(__dirname, "./prisma/zod"))
    await remove(resolve(__dirname, "./prisma/.client"))
    await execa(
      resolve(__dirname, "../../node_modules/.bin/prisma"),
      ["generate"],
      {
        cwd: __dirname,
      },
    )
  })

  test("match prisma types", async () => {
    const { commentCreateSchema, commentUpdateSchema } = await import(
      "./prisma/zod"
    )
    expectTypeOf(
      commentCreateSchema.parse({
        author: "Somebody",
        contents: "Some Text",
      }),
    ).toMatchTypeOf<Prisma.CommentCreateInput>()

    expectTypeOf({
      ...commentCreateSchema.parse({
        author: "Somebody",
        contents: "Some Text",
      }),
      parent: {
        create: commentCreateSchema.parse({
          author: "Else",
          contents: "Other Text",
        }),
      },
    }).toMatchTypeOf<Prisma.CommentCreateInput>()

    expectTypeOf(
      commentUpdateSchema.parse({
        contents: "Some Text *Edit: Other Text",
      }),
    ).toMatchTypeOf<Prisma.CommentUpdateInput>()

    expectTypeOf({
      ...commentUpdateSchema.parse({
        contents: "Some Text *Edit: Other Text",
      }),
      parent: {
        update: commentUpdateSchema.parse({
          author: "New Parent Author",
        }),
      },
    }).toMatchTypeOf<Prisma.CommentUpdateInput>()
  })

  test("useful default schema types", async () => {
    const { commentSchema, commentCreateSchema } = await import("./prisma/zod")

    expectTypeOf({
      id: "123",
      author: "Johnny Appleseed",
      contents: "This is a comment",
      parentId: null,
      parent: null,
      meta: { something: 123 },
      some: ["a", "list", "of", "strings"],
      children: [
        {
          id: "456",
          author: "Jane Appleseed",
          contents: "Another comment",
          parentId: "123",
          parent: {
            id: "789",
            author: "Steve",
            contents: "This!",
            parentId: null,
            parent: null,
            some: [],
            meta: null,
            children: [],
          },
          children: [],
          some: [],
          meta: null,
        },
      ],
    }).toMatchTypeOf<z.infer<typeof commentSchema>>()

    expectTypeOf({
      author: "Johnny Appleseed",
      contents: "This is a comment",
    }).toMatchTypeOf<z.infer<typeof commentCreateSchema>>()

    expectTypeOf({
      author: "Johnny Appleseed",
      contents: "This is a comment",
      meta: null,
    }).not.toMatchTypeOf<z.infer<typeof commentCreateSchema>>()
  })
})

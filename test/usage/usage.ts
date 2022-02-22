import { expectTypeOf } from "expect-type"
import { z } from "zod"
import { Prisma } from "./prisma/.client"
import {
  commentSchema,
  commentCreateSchema,
  commentUpdateSchema,
} from "./prisma/zod"

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

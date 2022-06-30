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
    status: "PUBLISHED" as const,
  }),
).toMatchTypeOf<Prisma.CommentCreateInput>()

expectTypeOf({
  ...commentCreateSchema.parse({
    author: "Somebody",
    contents: "Some Text",
    status: "PUBLISHED",
  }),
  parent: {
    create: commentCreateSchema.parse({
      author: "Else",
      contents: "Other Text",
      status: "PUBLISHED",
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
  status: "PUBLISHED" as const,
  parentId: null,
  parent: null,
  meta: { something: 123 },
  some: ["a", "list", "of", "strings"],
  children: [
    {
      id: "456",
      author: "Jane Appleseed",
      contents: "Another comment",
      status: "PUBLISHED" as const,
      parentId: "123",
      parent: {
        id: "789",
        author: "Steve",
        contents: "This!",
        status: "PUBLISHED" as const,
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
  status: "PUBLISHED" as const,
}).toMatchTypeOf<z.infer<typeof commentCreateSchema>>()

expectTypeOf({
  author: "Johnny Appleseed",
  contents: "This is a comment",
  status: "PUBLISHED",
  meta: null,
}).not.toMatchTypeOf<z.infer<typeof commentCreateSchema>>()

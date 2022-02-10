import { describe, test, expect } from "vitest"

import { documentSchema, documentUpdateSchema } from "./basic/expected/"
import { commentSchema, commentCreateSchema } from "./recursive/expected"

describe("Usage testing", () => {
  test("basic", () => {
    expect(() =>
      documentSchema.parse({
        id: "123",
        filename: "test.txt",
        author: "Steve",
        contents: "this is a test",
        created: new Date(),
        updated: new Date(),
      }),
    ).not.toThrowError()

    expect(() =>
      documentSchema.parse({
        id: 123,
      }),
    ).toThrowError()

    expect(() => documentUpdateSchema.parse({})).not.toThrowError()
  })

  test("recursive", () => {
    expect(() =>
      commentSchema.parse({
        author: "George",
        contents: "This is some text",
      }),
    ).toThrowError()

    expect(() =>
      commentCreateSchema.parse({
        author: "George",
        contents: "This is some text",
      }),
    ).not.toThrowError()
  })
})

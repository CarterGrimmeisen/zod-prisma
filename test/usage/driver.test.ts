import { execa } from "execa"
import { removeAsync as remove } from "fs-jetpack"
import { resolve } from "path"
import { describe, test } from "vitest"

describe("usage tests", () => {
  test("match prisma types", async () => {
    await remove(resolve(__dirname, "./prisma/zod"))
    await remove(resolve(__dirname, "./prisma/.client"))
    await execa(
      resolve(__dirname, "../../node_modules/.bin/prisma"),
      ["generate"],
      {
        cwd: __dirname,
      },
    )
    await import("./usage")
  })
})

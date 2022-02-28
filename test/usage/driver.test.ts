import { execa } from "execa"
import { removeAsync as remove } from "fs-jetpack"
import { resolve } from "path"
import { describe, expect, test } from "vitest"
import path from "path"

import ts from "typescript"

describe("usage tests", () => {
  test("match prisma types", async () => {
    if (process.platform === "win32") return // Prisma generate sporadically fails on Windows

    await remove(resolve(__dirname, "./prisma/zod"))
    await remove(resolve(__dirname, "./prisma/.client"))
    await execa(
      resolve(__dirname, "../../node_modules/.bin/prisma"),
      ["generate"],
      {
        cwd: __dirname,
        env: {
          ZOD_PRISMA_PATH: resolve(__dirname, "../../dist/cli.js"),
        },
      },
    )

    const program = ts.createProgram([path.resolve(__dirname, "usage.ts")], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
    })

    expect(program.emit().diagnostics).toStrictEqual([])
  }, 20000)
})

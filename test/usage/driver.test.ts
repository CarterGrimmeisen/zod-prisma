import { execa } from "execa"
import { removeAsync as remove } from "fs-jetpack"
import { resolve } from "path"
import { describe, expect, test } from "vitest"
import path from "path"

import ts from "typescript"

describe("usage tests", () => {
  if (process.platform !== "win32")
    test("match prisma types", async () => {
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

      const diagnostics = [
        ...program.emit().diagnostics,
        ...ts.getPreEmitDiagnostics(program),
      ]

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(diagnostics).toStrictEqual([])
    }, 20000)
})

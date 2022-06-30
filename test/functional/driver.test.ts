/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getConfig, getDMMF } from "@prisma/internals"
import glob from "fast-glob"
import { read } from "fs-jetpack"
import path from "path"
import { Project } from "ts-morph"
import ts, { SemicolonPreference } from "typescript"
import { describe, expect, test } from "vitest"
import { configSchema, PrismaOptions } from "../../src/config"
import {
  generateBarrelFile,
  populateEnumFile,
  populateModelFile,
} from "../../src/generator"

describe.concurrent("Functional Tests", () => {
  test.each([
    ["Basic", "basic"],
    ["Config", "config"],
    ["Config Import", "config-import"],
    ["Decimal.js", "decimal"],
    ["Different Client Path", "different-client-path"],
    ["Docs", "docs"],
    ["Imports", "imports"],
    ["JSON", "json"],
    ["Node esModules", "node-es-modules"],
    ["Optional fields", "optional"],
    ["Recursive Schema", "recursive"],
    ["Relation - 1 to 1", "relation-1to1"],
    ["relationModel = false", "relation-false"],
    ["Schema-Level Modifiers", "schema-modifiers"],
  ])("%s", async (_, dir) => {
    const schemaFile = path.resolve(__dirname, dir, "prisma/schema.prisma")
    const expectedDir = path.resolve(__dirname, dir, "expected")

    const project = new Project({
      useInMemoryFileSystem: !process.env.UPDATE_EXPECTED,
    })

    const datamodel = read(schemaFile)
    if (!datamodel) throw new Error("Datamodel not present.")

    const dmmf = await getDMMF({
      datamodel,
    })

    const { generators } = await getConfig({
      datamodel,
    })

    const generator = generators.find(
      (generator) => generator.provider.value === "zod-prisma",
    )!

    const results = configSchema.safeParse(generator.config)
    if (!results.success) throw new Error(results.error.message)

    const config = results.data

    const prismaClient = generators.find(
      (generator) => generator.provider.value === "prisma-client-js",
    )!

    const outputPath = path.resolve(
      path.dirname(schemaFile),
      generator.output!.value,
    )
    const clientPath = path.resolve(
      path.dirname(schemaFile),
      prismaClient.output!.value,
    )

    const prismaOptions: PrismaOptions = {
      clientPath,
      outputPath,
      schemaPath: schemaFile,
    }

    const indexFile = project.createSourceFile(
      `${outputPath}/index.ts`,
      {},
      { overwrite: true },
    )

    generateBarrelFile(
      dmmf.datamodel.models,
      dmmf.datamodel.enums,
      indexFile,
      config,
    )

    indexFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
      semicolons: SemicolonPreference.Remove,
    })

    const expectedIndexFile = path.resolve(expectedDir, `index.ts`)
    const expectedIndexContents = read(
      path.resolve(expectedDir, expectedIndexFile),
    )

    if (!process.env.UPDATE_EXPECTED)
      expect(indexFile.getFullText()).toStrictEqual(expectedIndexContents)

    for (const model of dmmf.datamodel.models) {
      const sourceFile = project.createSourceFile(
        `${outputPath}/${model.name.toLowerCase()}.ts`,
        {},
        { overwrite: true },
      )

      populateModelFile(model, sourceFile, config, prismaOptions)

      sourceFile.formatText({
        indentSize: 2,
        convertTabsToSpaces: true,
        semicolons: SemicolonPreference.Remove,
      })

      const expectedFile = path.resolve(
        expectedDir,
        `${model.name.toLowerCase()}.ts`,
      )
      const expectedContents = read(path.resolve(expectedDir, expectedFile))

      if (!process.env.UPDATE_EXPECTED)
        expect(sourceFile.getFullText()).toStrictEqual(expectedContents)
    }

    for (const enumDecl of dmmf.datamodel.enums) {
      const sourceFile = project.createSourceFile(
        `${outputPath}/${enumDecl.name.toLowerCase()}.ts`,
        {},
        { overwrite: true },
      )

      populateEnumFile(enumDecl, sourceFile, config, prismaOptions)

      sourceFile.formatText({
        indentSize: 2,
        convertTabsToSpaces: true,
        semicolons: SemicolonPreference.Remove,
      })

      const expectedFile = path.resolve(
        expectedDir,
        `${enumDecl.name.toLowerCase()}.ts`,
      )
      const expectedContents = read(path.resolve(expectedDir, expectedFile))

      if (!process.env.UPDATE_EXPECTED)
        expect(sourceFile.getFullText()).toStrictEqual(expectedContents)
    }

    if (process.env.UPDATE_EXPECTED) {
      console.log("Updating expecteds")
      await project.save()
    }
  })
})

describe("Type Checking", () => {
  // TODO: Expected files are now included in project level tsconfig and will be type-checked in the lint step
  // Meaning this could eventually be removed if I feel like it
  test("Check Expectations", async () => {
    const program = ts.createProgram(
      await glob(`${__dirname}/*/expected/*.ts`),
      {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
      },
    )

    const diagnostics = [
      ...program.emit().diagnostics,
      ...ts.getPreEmitDiagnostics(program),
    ]

    expect(diagnostics.map((each) => each.messageText)).toStrictEqual([])
  })
})

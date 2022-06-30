import { generatorHandler } from "@prisma/generator-helper"
import { Project } from "ts-morph"
import { SemicolonPreference } from "typescript"
import { version } from "../package.json"
import { configSchema, PrismaOptions } from "./config"
import {
  generateBarrelFile,
  populateEnumFile,
  populateModelFile,
} from "./generator"

generatorHandler({
  onManifest() {
    return {
      version,
      prettyName: "Zod Schemas",
      defaultOutput: "zod",
    }
  },
  onGenerate(options) {
    const project = new Project()

    const models = options.dmmf.datamodel.models
    const enums = options.dmmf.datamodel.enums

    const { schemaPath } = options
    const outputPath = options.generator.output?.value
    if (!outputPath)
      throw new Error(
        "Could not get output path for zod-prisma generator. This SHOULD NOT happen. Please create a new issue on Github.",
      )

    const clientPath = options.otherGenerators.find(
      (each) => each.provider.value === "prisma-client-js",
    )?.output?.value
    if (!clientPath)
      throw new Error(
        "Could not find prisma client generator. This is needed for proper type checking",
      )

    const results = configSchema.safeParse(options.generator.config)
    if (!results.success) throw new Error(results.error.message)

    const config = results.data
    const prismaOptions: PrismaOptions = {
      clientPath,
      outputPath,
      schemaPath,
    }

    const indexFile = project.createSourceFile(
      `${outputPath}/index.ts`,
      {},
      { overwrite: true },
    )

    generateBarrelFile(models, enums, indexFile, config)

    indexFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
      semicolons: SemicolonPreference.Remove,
    })

    models.forEach((model) => {
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
    })

    enums.forEach((enumDecl) => {
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
    })

    return project.save()
  },
})

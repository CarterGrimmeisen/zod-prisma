import { generatorHandler } from '@prisma/generator-helper'
import { configSchema, PrismaOptions } from './config'
import { generateBarrelFile, populateModelFile } from './generator'
import { project, tsMorphFormatStyles } from './util'

generatorHandler({
  onManifest() {
    return {
      // TODO: add auto versioning
      version: '0.0.4',
      prettyName: 'Zod Schemas',
      defaultOutput: 'zod',
    }
  },
  onGenerate(options) {
    const models = options.dmmf.datamodel.models

    const { schemaPath } = options
    const outputPath = options.generator.output?.value ?? ''
    const clientPath =
      options.otherGenerators.find((each) => each.provider.value === 'prisma-client-js')?.output
        ?.value ?? ''

    const results = configSchema.safeParse(options.generator.config)
    if (!results.success)
      throw new Error(
        'Incorrect config provided. Please check the values you provided and try again.'
      )

    const config = results.data
    const prismaOptions: PrismaOptions = {
      clientPath,
      outputPath,
      schemaPath,
    }

    const indexFile = project.createSourceFile(`${outputPath}/index.ts`, {}, { overwrite: true })

    // Create a mutable copy of the models array
    const mutableModels = models.map((model) => ({ ...model }))

    generateBarrelFile(mutableModels, indexFile)

    indexFile.formatText(tsMorphFormatStyles)

    models.forEach((model) => {
      const sourceFile = project.createSourceFile(
        `${outputPath}/${model.name.toLowerCase()}.ts`,
        {},
        { overwrite: true }
      )

      populateModelFile(model, sourceFile, config, prismaOptions)

      sourceFile.formatText(tsMorphFormatStyles)
    })

    return project.save()
  },
})

import { DMMF } from '@prisma/generator-helper'
import { getConfig, getDMMF } from '@prisma/internals'
import { readFile } from 'fs-extra'
import path from 'path'
import { configSchema, PrismaOptions } from '../../config'
import { generateBarrelFile, populateModelFile } from '../../generator'
import { project, tsMorphFormatStyles } from '../../util'

// if any individual test takes longer than 30 seconds to complete it will fail with a timeout error.
jest.setTimeout(30000)

const ftForDir = (dir: string) => async () => {
  const schemaFile = path.resolve(__dirname, dir, 'prisma/schema.prisma')
  const expectedDir = path.resolve(__dirname, dir, 'expected')
  const actualDir = path.resolve(__dirname, dir, 'actual')

  const datamodel = await readFile(schemaFile, 'utf-8')

  const dmmf = await getDMMF({
    datamodel,
  })

  const { generators } = await getConfig({
    datamodel,
  })

  const generator = generators.find((generator) => generator.provider.value === 'prisma-to-zod')!
  const config = configSchema.parse(generator.config)

  const prismaClient = generators.find(
    (generator) => generator.provider.value === 'prisma-client-js'
  )!

  const outputPath = path.resolve(path.dirname(schemaFile), generator.output?.value || '')
  const clientPath = path.resolve(path.dirname(schemaFile), prismaClient.output?.value || '')

  if (!generator.output?.value || !prismaClient.output?.value) {
    throw new Error('Output paths for generator or prismaClient are not defined.')
  }

  const prismaOptions: PrismaOptions = {
    clientPath,
    outputPath,
    schemaPath: schemaFile,
  }

  const indexFile = project.createSourceFile(`${outputPath}/index.ts`, {}, { overwrite: true })

  generateBarrelFile(dmmf.datamodel.models as DMMF.Model[], indexFile)

  indexFile.formatText(tsMorphFormatStyles)

  await indexFile.save()

  await Promise.all(
    dmmf.datamodel.models.map(async (model) => {
      const sourceFile = project.createSourceFile(
        `${actualDir}/${model.name.toLowerCase()}.ts`,
        {},
        { overwrite: true }
      )

      populateModelFile(
        model,
        sourceFile,
        {
          ...config,
          prisma: '../prisma/.client',
        },
        prismaOptions
      )

      sourceFile.formatText(tsMorphFormatStyles)
      sourceFile.fixUnusedIdentifiers()

      await sourceFile.save()
    })
  )

  await project.save()

  const actualIndexContents = await readFile(`${actualDir}/index.ts`, 'utf-8')

  const expectedIndexFile = path.resolve(expectedDir, `index.ts`)
  const expectedIndexContents = await readFile(expectedIndexFile, 'utf-8')

  expect(actualIndexContents).toStrictEqual(expectedIndexContents)

  await Promise.all(
    dmmf.datamodel.models.map(async (model) => {
      const actualContents = await readFile(`${actualDir}/${model.name.toLowerCase()}.ts`, 'utf-8')

      const expectedFile = path.resolve(expectedDir, `${model.name.toLowerCase()}.ts`)
      const expectedContents = await readFile(expectedFile, 'utf-8')

      expect(actualContents).toStrictEqual(expectedContents)
    })
  )
}

describe('Functional Tests', () => {
  test.concurrent('Basic', ftForDir('basic'))
  test.concurrent('Config', ftForDir('config'))
  test.concurrent('Docs', ftForDir('docs'))
  test.concurrent('Different Client Path', ftForDir('different-client-path'))
  test.concurrent('Recursive Schema', ftForDir('recursive'))
  test.concurrent('relationModel = false', ftForDir('relation-false'))
  test.concurrent('Relation - 1 to 1', ftForDir('relation-1to1'))
  test.concurrent('Imports', ftForDir('imports'))
  test.concurrent('JSON', ftForDir('json'))
  test.concurrent('Optional fields', ftForDir('optional'))
  test.concurrent('Config Import', ftForDir('config-import'))
})

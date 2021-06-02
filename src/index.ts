import path from 'path'
import generatorHelper from '@prisma/generator-helper'
import { Project, StructureKind, VariableDeclarationKind } from 'ts-morph'
import { SemicolonPreference } from 'typescript'
import { writeFile } from 'fs'

generatorHelper.generatorHandler({
  onManifest() {
    return {
      prettyName: 'Filters',
      defaultOutput: path.resolve(__dirname, 'filters'),
      // requiresGenerators: ['nexus-prisma'],
    }
  },
  onGenerate(options) {
    const project = new Project({
      skipAddingFilesFromTsConfig: true,
    })

    const outputPath = options.generator.output!.value
    // const enums = options.dmmf.datamodel.enums
    const models = options.dmmf.datamodel.models

    const indexSource = project.createSourceFile(
      `${outputPath}/index.ts`,
      {},
      {
        overwrite: true,
      }
    )

    if (models.length > 0) {
      models.forEach(model => {
        indexSource.addExportDeclaration({
          moduleSpecifier: `./${model.name}`,
        })

        const modelTypeName = `${model.name}Model`

        const sourceFile = project.createSourceFile(
          `${outputPath}/${model.name}.ts`,
          {
            statements: [
              {
                kind: StructureKind.ImportDeclaration,
                namespaceImport: 'z',
                moduleSpecifier: 'zod',
              },
            ],
          },
          {
            overwrite: true,
          }
        )

        const enumFields = model.fields.filter(f => f.kind === 'enum')

        sourceFile.addImportDeclaration({
          kind: StructureKind.ImportDeclaration,
          moduleSpecifier: '@prisma/client',
          namedImports: enumFields.map(f => f.type),
        })

        sourceFile.addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          isExported: true,
          declarations: [
            {
              name: modelTypeName,
              initializer(writer) {
                writer
                  .write('z.object(')
                  .inlineBlock(() => {
                    model.fields
                      .filter(f => f.kind !== 'object')
                      .forEach(field => {
                        if (field.kind === 'scalar') {
                          writer.write(`${field.name}: z`)
                          switch (field.type) {
                            case 'String':
                              writer.write('.string()')
                              break
                            case 'Int':
                              writer.write('.number().int()')
                              break
                            case 'DateTime':
                              writer.write(
                                '.string().regex(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/)'
                              )
                              break
                            case 'Float':
                              writer.write('.number()')
                              break
                            case 'Json':
                              writer.write('.object()')
                              break
                            case 'Boolean':
                              writer.write('.boolean()')
                              break
                            default:
                              writer.write('.unknown()')
                          }
                        } else if (field.kind === 'enum') {
                          writer.write(
                            `${field.name}: z.nativeEnum(${field.type})`
                          )
                        }

                        if (!field.isRequired) {
                          writer.write('.nullable()')
                        }

                        writer.write(',').newLine()
                      })
                  })
                  .write(')')
                  .newLine()
              },
            },
          ],
        })

        const ioFile = project.createSourceFile(
          `${outputPath}/io/${model.name}.ts`,
          {
            statements: [
              {
                kind: StructureKind.ImportDeclaration,
                namespaceImport: 'z',
                moduleSpecifier: 'zod',
              },
            ],
          }
        )

        const ioTypes = Object.values(
          options.dmmf.mappings.modelOperations.find(
            mo => mo.model === model.name
          )!
        ).map(
          ([_, value]) =>
            options.dmmf.schema.inputObjectTypes.prisma.find(
              io => io.name === value
            ) ??
            options.dmmf.schema.outputObjectTypes.prisma.find(
              oo => oo.name === value
            )!
        )

        /* if (relationFields.length > 0) {
          sourceFile.addImportDeclaration({
            kind: StructureKind.ImportDeclaration,
            namedImports: relationFields.map(f => `${f.type}BaseModel`),
            moduleSpecifier: './index',
          })

          sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
              {
                name: modelTypeName,
                initializer(writer) {
                  writer
                    .write(`${modelBaseTypeName}.extend(`)
                    .inlineBlock(() => {
                      relationFields.forEach(field => {
                        if (field.isList) {
                          writer.write(
                            `${field.name}: z.array(${field.type}BaseModel)`
                          )
                        } else {
                          writer.write(`${field.name}: ${field.type}BaseModel`)
                        }

                        if (!field.isRequired) {
                          writer.write('.nullable()')
                        }

                        writer.write(',').newLine()
                      })
                    })
                    .write(')')
                    .newLine()
                },
              },
            ],
          })
        } */

        sourceFile.formatText({
          indentSize: 2,
          convertTabsToSpaces: true,
          semicolons: SemicolonPreference.Remove,
        })
      })
    }

    return project.save().then(
      () =>
        new Promise<void>(res =>
          writeFile('out.json', JSON.stringify(options.dmmf), () => res())
        )
    )
  },
})

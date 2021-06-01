import path from 'path'
import generatorHelper from '@prisma/generator-helper'
import { Project, StructureKind, VariableDeclarationKind } from 'ts-morph'
import { SemicolonPreference } from 'typescript'

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

        const modelBaseTypeName = `${model.name}BaseModel`
        const modelTypeName = `${model.name}Model`

        const sourceFile = project.createSourceFile(
          `${outputPath}/${model.name}.ts`,
          {
            statements: [
              {
                kind: StructureKind.ImportDeclaration,
                namespaceImport: 'z',
                moduleSpecifier: 'zod',
              }
            ],
          },
          {
            overwrite: true,
          }
        )

        const relationFields = model.fields.filter(f => f.kind === 'object')
        const enumFields = model.fields.filter(f => f.kind === 'enum')

        sourceFile.addImportDeclaration({
          kind: StructureKind.ImportDeclaration,
          moduleSpecifier: '@prisma/client',
          namedImports: enumFields.map(f => f.type)
        })

        sourceFile.addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          isExported: true,
          declarations: [
            {
              name: relationFields.length > 0 ? modelBaseTypeName : modelTypeName,
              initializer(writer) {
                writer.write('z.object(').inlineBlock(() => {
                  model.fields.filter(f => f.kind !== 'object').forEach(field => {
                    if (field.kind === 'scalar') {
                      writer.write(`${field.name}: z`)
                      switch (field.type) {
                        case 'String':
                          writer.write('.string()')
                          break;
                        case 'Int':
                          writer.write('.number().int()')
                          break;
                        case 'DateTime':
                          writer.write('.string().regex(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/)')
                          break;
                        case 'Float':
                          writer.write('.number()')
                          break;
                        case 'Json':
                          writer.write('.object()')
                          break;
                        case 'Boolean':
                          writer.write('.boolean()')
                          break;
                        default:
                          writer.write('.unknown()')
                      }
                    } else if (field.kind === 'enum') {
                      writer.write(`${field.name}: z.nativeEnum(${field.type})`)
                    }

                    if (!field.isRequired) {
                      writer.write('.nullable()')
                    }

                    writer.write(',').newLine()
                  })
                }).write(')').newLine()
              }
            }
          ]
        })

        if (relationFields.length > 0) {
          sourceFile.addImportDeclaration({
            kind: StructureKind.ImportDeclaration,
            namedImports: relationFields.map(f => `${f.type}BaseModel`),
            moduleSpecifier: './index'
          })

          sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
              {
                name: modelTypeName,
                initializer(writer) {
                  writer.write(`${modelBaseTypeName}.extend(`).inlineBlock(() => {
                    relationFields.forEach(field => {
                      if (field.isList) {
                        writer.write(`${field.name}: z.array(${field.type}BaseModel)`)
                      } else {
                        writer.write(`${field.name}: ${field.type}BaseModel`)
                      }

                      if (!field.isRequired) {
                        writer.write('.nullable()')
                      }

                      writer.write(',').newLine()
                    })
                  }).write(')').newLine()
                }
              }
            ]
          })
        }

        sourceFile.formatText({
          indentSize: 2,
          convertTabsToSpaces: true,
          semicolons: SemicolonPreference.Remove,
        })
      })
    }

    return project.save()
  },
})
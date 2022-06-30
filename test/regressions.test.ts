import path from "path"
import { configSchema, PrismaOptions } from "../src/config"
import { writeImportsForModel } from "../src/generator"
import { getDMMF } from "@prisma/internals"
import { Project } from "ts-morph"
import { SemicolonPreference } from "typescript"
import { describe, test, expect } from "vitest"

describe("Regression Tests", () => {
  test("#92", async () => {
    const config = configSchema.parse({})
    const prismaOptions: PrismaOptions = {
      outputPath: path.resolve(__dirname, "./prisma/zod"),
      schemaPath: path.resolve(__dirname, "./prisma/schema.prisma"),
    }

    const {
      datamodel: {
        models: [model],
      },
    } = await getDMMF({
      datamodel: `enum UserType {
				USER
				ADMIN
			}
			
			model User {
				id			String @id
				type		UserType
			}`,
    })

    const project = new Project()
    const testFile = project.createSourceFile("test.ts")

    writeImportsForModel(model, testFile, config, prismaOptions)

    testFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
      semicolons: SemicolonPreference.Remove,
    })

    expect(testFile.getFullText()).toBe(
      'import * as z from "zod"\nimport { userTypeSchema } from "./usertype"\n',
    )
  })

  test("#99", async () => {
    const config = configSchema.parse({
      nodeEsModules: "true",
    })
    const prismaOptions: PrismaOptions = {
      outputPath: path.resolve(__dirname, "./prisma/zod"),
      schemaPath: path.resolve(__dirname, "./prisma/schema.prisma"),
    }

    const {
      datamodel: {
        models: [model],
      },
    } = await getDMMF({
      datamodel: `enum UserType {
				USER
				ADMIN
			}
			
			model User {
				id			String @id
				type		UserType
			}`,
    })

    const project = new Project()
    const testFile = project.createSourceFile("test.ts")

    writeImportsForModel(model, testFile, config, prismaOptions)

    testFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
      semicolons: SemicolonPreference.Remove,
    })

    expect(testFile.getFullText()).toBe(
      'import * as z from "zod"\nimport { userTypeSchema } from "./usertype.js"\n',
    )
  })

  test("#104", async () => {
    const config = configSchema.parse({
      imports: "my-cool-package",
    })
    const prismaOptions: PrismaOptions = {
      outputPath: path.resolve(__dirname, "./prisma/zod"),
      schemaPath: path.resolve(__dirname, "./prisma/schema.prisma"),
    }

    const {
      datamodel: {
        models: [model],
      },
    } = await getDMMF({
      datamodel: `model User {
				id			    String @id
				type		    String /// @zod.custom(imports.myCoolSchema)
			}`,
    })
    const project = new Project()
    const testFile = project.createSourceFile("test.ts")

    writeImportsForModel(model, testFile, config, prismaOptions)

    testFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
      semicolons: SemicolonPreference.Remove,
    })

    expect(testFile.getFullText()).toBe(
      'import * as z from "zod"\nimport * as imports from "my-cool-package"\n',
    )
  })

  test("#109", async () => {
    const config = configSchema.parse({
      nodeEsModules: "true",
    })
    const prismaOptions: PrismaOptions = {
      outputPath: path.resolve(__dirname, "./prisma/zod"),
      schemaPath: path.resolve(__dirname, "./prisma/schema.prisma"),
    }

    const {
      datamodel: {
        models: [model],
      },
    } = await getDMMF({
      datamodel: `enum UserType {
				USER
				ADMIN
			}
			
			model User {
				id			    String @id
				type		    UserType
        anotherType UserType
			}`,
    })
    const project = new Project()
    const testFile = project.createSourceFile("test.ts")

    writeImportsForModel(model, testFile, config, prismaOptions)

    testFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
      semicolons: SemicolonPreference.Remove,
    })

    expect(testFile.getFullText()).toBe(
      'import * as z from "zod"\nimport { userTypeSchema } from "./usertype.js"\n',
    )
  })

  test("#110", () => {
    const config = configSchema.parse({
      imports: "null",
    })

    expect(config.imports).toBe(null)
  })

  test("#113", async () => {
    const config = configSchema.parse({
      imports: "./regressions.test",
    })
    const prismaOptions: PrismaOptions = {
      outputPath: path.resolve(__dirname, "./prisma/zod"),
      schemaPath: path.resolve(__dirname, "./prisma/schema.prisma"),
    }

    const {
      datamodel: {
        models: [userModel, postModel],
      },
    } = await getDMMF({
      datamodel: ` /// Something something imports.commentSchema something
      
      
      model User {
				id			String @id
				type		String
			}
      
      model Post {
        id String @id
        body String /// @zod.custom(imports.commentSchema)
      }`,
    })

    const project = new Project()
    const testFile = project.createSourceFile("test.ts")

    writeImportsForModel(userModel, testFile, config, prismaOptions)

    testFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
      semicolons: SemicolonPreference.Remove,
    })

    expect(testFile.getFullText()).toBe('import * as z from "zod"\n')

    testFile.removeText(0, testFile.getEnd())

    writeImportsForModel(postModel, testFile, config, prismaOptions)

    testFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
      semicolons: SemicolonPreference.Remove,
    })

    expect(testFile.getFullText()).toBe(
      'import * as z from "zod"\nimport * as imports from "../regressions.test"\n',
    )
  })
})

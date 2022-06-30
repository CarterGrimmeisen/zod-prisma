import path from "path"
import { configSchema, PrismaOptions } from "../src/config"
import { writeImportsForModel } from "../src/generator"
import { getDMMF } from "@prisma/sdk"
import { Project } from "ts-morph"
import { SemicolonPreference } from "typescript"
import { describe, test, expect } from "vitest"

describe("Regression Tests", () => {
  test("#92", async () => {
    const config = configSchema.parse({})
    const prismaOptions: PrismaOptions = {
      clientPath: path.resolve(__dirname, "../node_modules/@prisma/client"),
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
      clientPath: path.resolve(__dirname, "../node_modules/@prisma/client"),
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

  test("#109", async () => {
    const config = configSchema.parse({
      nodeEsModules: "true",
    })
    const prismaOptions: PrismaOptions = {
      clientPath: path.resolve(__dirname, "../node_modules/@prisma/client"),
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
})

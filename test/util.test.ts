import path from "path"
import type { CodeBlockWriter } from "ts-morph"
import { describe, expect, test, vi } from "vitest"
import { dotSlash, writeArray } from "../src/util"

describe("Util Package", () => {
  test("writeArray: default newLines", () => {
    const arrayToWrite = ["this", "is", "a", "line"]
    const writer = {
      write: vi.fn(),
      conditionalNewLine: vi.fn(),
    }

    writer.write.mockReturnValue(writer)

    writeArray(writer as unknown as CodeBlockWriter, arrayToWrite)

    expect(writer.write).toHaveBeenCalledWith("this")
    expect(writer.write).toHaveBeenCalledWith("is")
    expect(writer.write).toHaveBeenCalledWith("a")
    expect(writer.write).toHaveBeenCalledWith("line")
    expect(writer.write).toHaveBeenCalledTimes(4)

    expect(writer.conditionalNewLine).toHaveBeenCalledWith(true)
    expect(writer.conditionalNewLine).toHaveBeenCalledWith(true)
    expect(writer.conditionalNewLine).toHaveBeenCalledWith(true)
    expect(writer.conditionalNewLine).toHaveBeenCalledWith(true)
    expect(writer.conditionalNewLine).toHaveBeenCalledTimes(4)
  })

  test("writeArray: no newLines", () => {
    const arrayToWrite = ["this", "is", "a", "line"]
    const writer = {
      write: vi.fn(),
      conditionalNewLine: vi.fn(),
    }

    writer.write.mockReturnValue(writer)

    writeArray(writer as unknown as CodeBlockWriter, arrayToWrite, false)

    expect(writer.conditionalNewLine).toHaveBeenCalledWith(false)
    expect(writer.conditionalNewLine).toHaveBeenCalledWith(false)
    expect(writer.conditionalNewLine).toHaveBeenCalledWith(false)
    expect(writer.conditionalNewLine).toHaveBeenCalledWith(false)
    expect(writer.conditionalNewLine).toHaveBeenCalledTimes(4)
  })

  test("dotSlash", () => {
    expect(dotSlash("../banana")).toBe("../banana")
    expect(dotSlash("test/1/2/3")).toBe("./test/1/2/3")
    expect(dotSlash("../../node_modules/@prisma/client")).toBe("@prisma/client")

    if (path.sep !== path.posix.sep) {
      expect(dotSlash("test\\1\\2\\3")).toBe("./test/1/2/3")
      expect(dotSlash("..\\..\\node_modules\\@prisma\\client")).toBe(
        "@prisma/client",
      )
    }
  })
})

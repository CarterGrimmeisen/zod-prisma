import { mock } from 'jest-mock-extended'
import path from 'path'
import type { CodeBlockWriter } from 'ts-morph'
import { dotSlash, writeArray } from '../util'

describe('Util Package', () => {
	test('writeArray: default newLines', () => {
		const arrayToWrite = ['this', 'is', 'a', 'line']
		const writer = mock<CodeBlockWriter>()

		writer.write.mockReturnValue(writer)

		writeArray(writer, arrayToWrite)

		expect(writer.write).toHaveBeenCalledWith('this')
		expect(writer.write).toHaveBeenCalledWith('is')
		expect(writer.write).toHaveBeenCalledWith('a')
		expect(writer.write).toHaveBeenCalledWith('line')
		expect(writer.write).toHaveBeenCalledTimes(4)

		expect(writer.conditionalNewLine).toHaveBeenCalledWith(true)
		expect(writer.conditionalNewLine).toHaveBeenCalledWith(true)
		expect(writer.conditionalNewLine).toHaveBeenCalledWith(true)
		expect(writer.conditionalNewLine).toHaveBeenCalledWith(true)
		expect(writer.conditionalNewLine).toHaveBeenCalledTimes(4)
	})

	test('writeArray: no newLines', () => {
		const arrayToWrite = ['this', 'is', 'a', 'line']
		const writer = mock<CodeBlockWriter>()

		writer.write.mockReturnValue(writer)

		writeArray(writer, arrayToWrite, false)

		expect(writer.conditionalNewLine).toHaveBeenCalledWith(false)
		expect(writer.conditionalNewLine).toHaveBeenCalledWith(false)
		expect(writer.conditionalNewLine).toHaveBeenCalledWith(false)
		expect(writer.conditionalNewLine).toHaveBeenCalledWith(false)
		expect(writer.conditionalNewLine).toHaveBeenCalledTimes(4)
	})

	test('dotSlash', () => {
		expect(dotSlash('../banana')).toBe('../banana')
		expect(dotSlash('test/1/2/3')).toBe('./test/1/2/3')
		expect(dotSlash('../../node_modules/@prisma/client')).toBe('@prisma/client')

		if (path.sep !== path.posix.sep) {
			expect(dotSlash('test\\1\\2\\3')).toBe('./test/1/2/3')
			expect(dotSlash('..\\..\\node_modules\\@prisma\\client')).toBe('@prisma/client')
		}
	})
})

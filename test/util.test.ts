import type { CodeBlockWriter } from 'ts-morph'
import { getDocumentationCodeInjection, writeArray } from '../src/util'

import { mock } from 'jest-mock-extended'

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

	describe('getDocumentationCodeInjection', () => {
		test('no code to inject', () => {
			const received = getDocumentationCodeInjection(['foo', 'bar'])
			expect(received).toBeNull()
		})

		test('inject imports', () => {
			const received = getDocumentationCodeInjection([
				'```@zod',
				'import foo from "foo"',
				'```',
			])
			const expected = 'import foo from "foo"'
			expect(received).toEqual(expected)
		})

		test('inject multiline code', () => {
			const received = getDocumentationCodeInjection([
				'```@zod',
				'import foo from "foo"',
				'',
				'const bar = foo()',
				'```',
			])
			const expected = 'import foo from "foo"\n\nconst bar = foo()'
			expect(received).toEqual(expected)
		})

		test('un-terminated code block', () => {
			const received = getDocumentationCodeInjection([
				'```@zod',
				'import foo from "foo"',
			])
			expect(received).toBeNull()
		})

		test('non-zod code block (eg: JSDoc code example)', () => {
			const received = getDocumentationCodeInjection([
				'```',
				'import foo from "foo"',
				'```',
			])
			expect(received).toBeNull()
		})
	})
})

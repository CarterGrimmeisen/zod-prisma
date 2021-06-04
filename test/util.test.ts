import type { CodeBlockWriter } from 'ts-morph'
import { writeArray } from '../src/util'

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
})

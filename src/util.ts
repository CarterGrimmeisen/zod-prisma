import type { CodeBlockWriter } from 'ts-morph'

export const writeArray = (
	writer: CodeBlockWriter,
	array: string[],
	newLine = true
) => array.forEach((line) => writer.write(line).conditionalNewLine(newLine))

export const getDocumentationCodeInjectionBoundaries = (
	documentation: string[]
) => {
	const codeStartIndex = documentation.findIndex((line) => line === '```@zod')
	if (codeStartIndex < 0) {
		return null
	}
	const codeEndIndex = documentation
		.slice(codeStartIndex)
		.findIndex((line) => line === '```')
	if (codeEndIndex < 0) {
		return null
	}
	return {
		start: codeStartIndex,
		end: codeEndIndex,
	}
}

export const getDocumentationCodeInjection = (documentation: string[]) => {
	const boundaries = getDocumentationCodeInjectionBoundaries(documentation)
	if (!boundaries) {
		return null
	}
	return documentation.slice(boundaries.start + 1, boundaries.end).join('\n')
}

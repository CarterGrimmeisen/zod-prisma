import { getDocumentationCodeInjectionBoundaries } from './util'

export const getJSDocs = (docString?: string) => {
	const lines: string[] = []

	if (docString) {
		let docLines = docString.split('\n')
		const injectedCodeBoundaries =
			getDocumentationCodeInjectionBoundaries(docLines)

		if (injectedCodeBoundaries) {
			// Don't inject code in docstrings
			const { start, end } = injectedCodeBoundaries
			docLines.splice(start, end - start + 1)
		}

		// Remove rich-comment annotations
		docLines = docLines.filter((dL) => !dL.trimLeft().startsWith('@zod'))

		if (docLines.length) {
			lines.push('/**')
			docLines.forEach((dL) => lines.push(` * ${dL}`))
			lines.push(' */')
		}
	}

	return lines
}

export const computeModifiers = (docString: string) => {
	return docString
		.split('\n')
		.filter((line) => line.trimLeft().startsWith('@zod'))
		.map((line) => line.trim().split('@zod.').slice(-1)[0])
}

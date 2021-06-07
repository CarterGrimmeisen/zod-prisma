export const getJSDocs = (docString?: string) => {
	const lines: string[] = []

	if (docString) {
		const docLines = docString
			.split('\n')
			.filter((dL) => !dL.trimLeft().startsWith('@zod'))

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

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

export const getZodDocElements = (docString: string) =>
	docString
		.split('\n')
		.filter((line) => line.trimStart().startsWith('@zod'))
		.flatMap((line) =>
			Array.from(line.matchAll(/\.([^().]+\(.*?\))/g), (m) =>
				m.slice(1)
			).flat()
		)

export const computeCustomSchema = (docString: string) => {
	return getZodDocElements(docString)
		.find((modifier) => modifier.startsWith('custom('))
		?.slice(7)
		.slice(0, -1)
}

export const computeModifiers = (docString: string) => {
	return getZodDocElements(docString).filter(
		(each) => !each.startsWith('custom(')
	)
}

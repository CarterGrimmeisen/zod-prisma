import { DMMF } from '@prisma/generator-helper'
import type { CodeBlockWriter } from 'ts-morph'
import { Config } from './config'
import { sep } from 'path'

export const writeArray = (writer: CodeBlockWriter, array: string[], newLine = true) =>
	array.forEach((line) => writer.write(line).conditionalNewLine(newLine))

export const useModelNames = ({ modelCase, modelSuffix, relationModel }: Config) => {
	const formatModelName = (name: string, prefix = '') => {
		if (modelCase === 'camelCase') {
			name = name.slice(0, 1).toLowerCase() + name.slice(1)
		}
		return `${prefix}${name}${modelSuffix}`
	}

	return {
		modelName: (name: string) => formatModelName(name, relationModel === 'default' ? '_' : ''),
		relatedModelName: (name: string | DMMF.SchemaEnum | DMMF.OutputType | DMMF.SchemaArg) =>
			formatModelName(
				relationModel === 'default' ? name.toString() : `Related${name.toString()}`
			),
	}
}

export const needsRelatedModel = (model: DMMF.Model, config: Config) =>
	model.fields.some((field) => field.kind === 'object') && config.relationModel !== false

export const chunk = <T extends any[]>(input: T, size: number): T[] => {
	return input.reduce((arr, item, idx) => {
		return idx % size === 0
			? [...arr, [item]]
			: [...arr.slice(0, -1), [...arr.slice(-1)[0], item]]
	}, [])
}

export const dotSlash = (path: string) => {
	if (path.includes(`${sep}node_modules${sep}`))
		return path.split(`${sep}node_modules${sep}`).slice(-1)[0]

	if (path.startsWith(`..${sep}`)) return path

	return `.${sep}${path}`
}

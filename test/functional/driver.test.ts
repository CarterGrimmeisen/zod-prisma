import execa from 'execa'
import { resolve, basename } from 'path'
import glob from 'fast-glob'
import { pathExists, readFile } from 'fs-extra'

jest.setTimeout(120000)

const ftForDir = (dir: string) => async () => {
	const actualDir = resolve(__dirname, dir, 'actual')
	const expectedDir = resolve(__dirname, dir, 'expected')

	const results = await execa('npx', ['prisma', 'generate'], {
		cwd: resolve(__dirname, dir),
		timeout: 30000,
	})

	const actualFiles = await glob(resolve(actualDir, '*.ts'))
	const expectedFiles = await glob(resolve(expectedDir, '*.ts'))

	const files = Array.from(
		new Set([
			...actualFiles.map((path) => basename(path)),
			...expectedFiles.map((path) => basename(path)),
		])
	)

	await Promise.all(
		files.map(async (file) => {
			const [actualExists, expectedExists] = await Promise.all([
				pathExists(resolve(actualDir, file)),
				pathExists(resolve(expectedDir, file)),
			])

			if (!actualExists)
				throw new Error(`${file} exists in expected but not actual!`)
			else if (!expectedExists)
				throw new Error(`${file} exists in actual but not expected!`)

			const [actualContents, expectedContents] = await Promise.all([
				readFile(resolve(actualDir, file), 'utf-8'),
				readFile(resolve(expectedDir, file), 'utf-8'),
			])

			expect(actualContents).toStrictEqual(expectedContents)
		})
	)

	expect(results.exitCode).toBe(0)
}

describe('Functional Tests', () => {
	test.concurrent('Basic', ftForDir('basic'))
	test.concurrent('Config', ftForDir('config'))
	test.concurrent('Docs', ftForDir('docs'))
	test.concurrent('Different Client Path', ftForDir('different-client-path'))
})

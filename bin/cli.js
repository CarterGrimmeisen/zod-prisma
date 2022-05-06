#!/usr/bin/env node

try {
	require('zod')
} catch (error) {
	if (error.code !== 'MODULE_NOT_FOUND') {
		throw error
	}
	var RED = '\x1b[31m%s\x1b[0m'
	console.error(RED, 'Please makes sure to install zod first.')
	process.exit(1)
}

require('../dist/index')
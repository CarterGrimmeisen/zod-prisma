module.exports = {
	hooks: {
		readPackages(pkg) {
			if (pkg.name === 'dts-cli') {
				pkg.peerDependencies['luma.gl'] = '*'
			}
			return pkg
		},
	},
}

const ip = require('ip')
const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = process.env.PROCESS || process.env.NODE_ENV === 'production' ? 80 : 3002
const host = `http://${ip.address()}:${PORT}/`
// const host = 'http://dev.icofont.com/'
// const host = 'https://icofont.com/'

module.exports = {
	process: process.env.PROCESS,
	/** The environment to use when building the project */
	env: NODE_ENV,
	/** The port that is used for local development */
	port: PORT,
	/** The full path to the project's root directory */
	basePath: __dirname,
	/** The name of the directory containing the application source code */
	srcDir: 'src',
	/** The file name of the application's entry point */
	main: 'src/browser/index',
	/** The name of the directory in which to emit compiled assets */
	outDir: 'public',
	/** The base path for all projects assets (relative to the website root) */
	publicPath: NODE_ENV === 'development' ? `http://${ip.address()}:${PORT}/` : host,
	/** Whether to generate sourcemaps */
	sourcemaps: true,
	/** A hash map of keys that the compiler should treat as external to the project */
	externals: {},
	/** A hash map of variables and their values to expose globally */
	globals: {},
	/** Whether to enable verbose logging */
	verbose: false
}

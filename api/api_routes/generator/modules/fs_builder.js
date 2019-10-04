const shell = require('shelljs')
const path = require('path')
const fs = require('fs')
const archiver = require('archiver')

const FsEngine = {
	uid: '',
	publicPath: path.resolve('./public'),
	srcPath: '',
	packageName: 'icofont',
	commonFolder: ['fonts'],
	singleSvgInit: uid => {
		module.exports.uid = uid
		module.exports.createDownloadFolder()
		return module.exports
	},
	init: (uid, force = false) => {
		module.exports.uid = uid
		if (force === true) {
			module.exports.createDownloadFolder()
			module.exports.createIcoFontFolders()
			return module.exports
		}
	},
	createDownloadFolder: () => {
		module.exports.userFolder = path.join(
			module.exports.publicPath,
			module.exports.srcPath,
			module.exports.uid
		)
		shell.mkdir('-p', module.exports.userFolder)
	},
	createIcoFontFolders: () => {
		
		module.exports.fontsFolder = path.join(
			module.exports.userFolder,
			module.exports.packageName,
			'fonts'
		)
		
		module.exports.cssFolder = path.join(module.exports.userFolder, module.exports.packageName)
		module.exports.exampleFolder = path.join(module.exports.userFolder, module.exports.packageName)

		shell.mkdir('-p', [
			module.exports.userFolder,
			module.exports.fontsFolder
		])
	},

	/**
	 *
	 * Zip downloadable folders (css, fonts, js, scss )
	 * Make a new folder with zip extension (icofont.zip)
	 * **/

	zipDir: () => {
		const baseDir = module.exports.userFolder + '/icofont/'
		const archive = archiver.create('zip', {})
		const output = fs.createWriteStream(module.exports.userFolder + '/icofont.zip')
		archive.pipe(output)
		archive.directory(baseDir, module.exports.packageName)
		archive.finalize()
		module.exports.userZipFolder = module.exports.userFolder + '/icofont.zip'
	},

	/*
	 * Move new generated icofont folder to the assets folder 
	 * Make a zip file and move it to the package download folder
	 */

	moveFilesToDestination: () => {
		const assets = path.join(module.exports.publicPath, 'icofont')
		const downloadPath = path.join(module.exports.publicPath, 'download', 'global_package')
		if (fs.existsSync(assets)) shell.rm('-rf', assets)
		if (fs.existsSync(downloadPath + '/icofont.zip'))
			shell.rm('-rf', downloadPath + '/icofont.zip')

		const baseDir = module.exports.userFolder + '/icofont/'
		shell.mv(baseDir, assets)
		shell.mv(module.exports.userFolder + '/icofont.zip', downloadPath)
		shell.rm('-rf', module.exports.userFolder)
	}
}

module.exports = FsEngine

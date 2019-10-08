const fs = require('fs')
const uuidv4 = require('uuid/v4')
const path = require('path')
const ProcessSvg = require('./process_svg')
const TemplateEngine = require('../template_engine/engine');
const shell = require('shelljs')

const IcoConfig = {
	rootPath: '',
	packagePath: '',
	targetPackageFolder: '',
	config: {},
	categoryDirs: '',
	icons: '',
	configFolder: path.resolve('./config/'),

	/**
	 * Initate the engine for svg data collection
	 * 
	 * Resolve the path and targeted package folder
	 * Read config file from config folder
	 * List down all category directory from package folder
	 * Collect icons from all category directory
	 * If we found icon then store them in icon.json file and update the svg file with new code
	 */
	init: () => {
		module.exports.rootPath = path.resolve('.')
		module.exports.targetPackageFolder = module.exports.rootPath + '/packages/'
		
		module.exports.readConfigFile()
		if (module.exports.readCategoryDirectory()) {
			module.exports.readSvgIcons()
		}
		if (module.exports.icons.length > 0) {
			module.exports.writeJsonConfig()
			module.exports.updateConfigFile()
		}
	},

	/**
	 * Read base config file from icon-config.json
	 */
	readConfigFile: () => {
		const config = JSON.parse(
			fs.readFileSync(path.resolve('./config/', 'icon-config.json'), 'utf8')
		)
		config.font.copyright = config.font.copyright.replace('{year}',new Date().getFullYear());
		module.exports.config = config;
	},

	/**
	 * Read all directory from packages folder
	 */
	readCategoryDirectory: () => {
		try {
			const path = module.exports.targetPackageFolder
			module.exports.categoryDirs = fs.readdirSync(path).filter(function(file) {
				return fs.statSync(path + '/' + file).isDirectory()
			})
			return true
		} catch (e) {
			return false
		}
	},
	/**
	 * Read each svg file from package folder
	 */
	readSvgIcons: () => {
		const categoryDirs = module.exports.categoryDirs
		const categories = []
		const fontConfig = { ...module.exports.config.font }
		let updateCode = (fontConfig.updateCode ) ? fontConfig.updateCode : fontConfig.code-1

		/**
		 * Check is duotone or not. If doutone then classname will be same as before one
		 * @param {string} filename 
		 * @param {path} filePath 
		 * @param {boolean} isDuoton 
		 * @param {boolean} type 
		 */
		const storeGlyphs = (folderName, filename, filePath, isDuoton, type) => {
			let glyph = {}
			let svg = ProcessSvg.convert(fs.readFileSync(filePath, 'utf8'))
			if( !svg.code ){
				updateCode = updateCode+1
				module.exports.updateSvgFile(updateCode, filePath, svg )
				glyph.code = updateCode.toString(16)
			}else {
				glyph.code = svg.code.toString(16)
			}
			glyph.id = uuidv4()
			glyph.name = filename
			glyph.css = filename.replace('-secondary','')
			glyph.cat = folderName
			glyph.duotone = isDuoton
			glyph.assign = type ? 'after' : 'before'
			glyph.transform = svg.transform
			categories.push(glyph)
		}

		/**
		 * Get svg files from each folder and collect path data
		 */
		categoryDirs.map(folderName => {
			const iconPath = module.exports.targetPackageFolder + folderName + '/'
			const duotone = folderName.split('-')[0] === 'duotone'
			fs.readdirSync(iconPath).map( file => {
				const filename = file.substring(0, file.lastIndexOf('.'))
				if (filename !== '') {
					const filePath = path.join(iconPath, filename+'.svg')
					let isSecondary = false 
					if (duotone === true) {
						isSecondary = filename.split('-').includes('secondary');
					}
					storeGlyphs(folderName, filename, filePath, duotone, isSecondary )
				} 
			})
		})

		fontConfig.updateCode = updateCode
		module.exports.config.font = fontConfig
		module.exports.icons = categories
		
	},

	/**
	 * Create icons.json file with all svg collections data
	 * It will need in future for create glyphs icons
	 */
	writeJsonConfig: () => {
		const jsonWritePath = module.exports.configFolder + '/icons.json'
		const categories = module.exports.categoryDirs
		const config = module.exports.config
		const icons = module.exports.icons
		let jsonIconObject = {
			font: config.font,
			glyphs: icons,
			categories: categories
		}
		fs.writeFile(jsonWritePath, JSON.stringify(jsonIconObject, null, 2), 'utf8', err => {
			if (err) console.log('ico-config file write error:  ', err) // eslint-disable-line no-console
		})
	},

	/**
	 * Update icon-config.json file with last updated code number
	 * If we need to add new icon we will start generate code from update number
	 */
	updateConfigFile: () => {
		const jsonWritePath = module.exports.configFolder + '/icon-config.json'
		const jsonIconObject = module.exports.config
		fs.writeFile(jsonWritePath, JSON.stringify(jsonIconObject, null, 2), 'utf8', err => {
			if (err) console.log('config file write error:  ', err) // eslint-disable-line no-console
		})
	},
	/**
	 * When first read svg path from svg file then clear the svg file with their attributes
	 * Add extra code attribute that will resolve next time when build the fonts again
	 * It will never lost the icon font code name
	 * 
	 * @example		content:"\f3bd"
	 * 
	 */
	updateSvgFile: (code, iconPath, svg ) => {
		svg.code = code
		let newSvg = TemplateEngine.updateSvgTemplate({svg}) 
		shell.rm(iconPath)
		fs.writeFileSync( iconPath, newSvg, 'utf8');
	}
}

module.exports = IcoConfig

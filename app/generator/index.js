const express = require('express')
const router = express.Router()
const IcoGenerator = require('./modules/build_embedded_fonts')
const ProcessSvg = require('./modules/process_svg')
const Package = require('./modules/create_package')
const IcoConfig = require('./modules/build_font_config')
/**
 * Dammy function for future version
 * It will convert custom uploaded icon
 * (Not used)
 */
router.post('/', function(req, res, next) {
	res.status(403).end()
	try {
		let result = {}
		let allCustomIcons = req.body.allCustomIcons ? JSON.parse(req.body.allCustomIcons) : []
		let icon = req.body.icon ? req.body.icon : null
		if (icon === null) throw new Error('Icon is null ')
		else ProcessSvg.svgObj = JSON.parse(icon)
		result = ProcessSvg.convert()
		allCustomIcons.push(result)
		IcoGenerator.icons = allCustomIcons
		IcoGenerator.init(true) // Only generate custom icon with ttf font
		res.status(200).send({
			success: true,
			icon: result,
			result: IcoGenerator.customCssTemplate
		})
	} catch (e) {
		res.status(200).send({ success: false, message: e })
	}
})

/**
 * Generate JSON object from all svg file and store it in icons.json file
 * Get config from master config file (config.json)
 * Return glyphs list
 */

router.get('/bf142d158ec57bea9a9cae1b77d5018d/svg2json', function(req, res) {
	try {
		IcoConfig.init()
		res.status(200).send({
			success: true,
			config: IcoConfig.config,
			folders: IcoConfig.categoryDirs,
			icons: IcoConfig.icons
		})
	} catch (e) {
		res.status(200).send({ success: false, message: e })
	}
})

/**
 * render single svg from icon object and download
 */

router.post('/single_svg', function(req, res, next) {
	try {
		let Icon = req.body.icon
		Icon = Icon ? JSON.parse(Icon) : { icon_count: 0 }
		IcoGenerator.isSelfPackage = false
		IcoGenerator.singleSvgInit(Icon)
		
		res
			.status(200)
			.send({ uuid: IcoGenerator.fsEngine.uid, iconName: Icon.name, success: true })
	} catch (e) {
		res.status(200).send({ success: false, message: e })
	}
})

/**
 * Generate icon and font from glyphs object
 * Store uuid in session for download custom package
 */

router.post('/get_session', function(req, res, next) {
	try {
		let selectedIcons = req.body.icons
		selectedIcons = selectedIcons ? JSON.parse(selectedIcons) : { icon_count: 0 }

		/*
         * Assign icons to the generator module
         * Create current user folder and generate everything
         * Generator module will process this icon and create css, fonts and svg file
         */
		IcoGenerator.isSelfPackage = false
		IcoGenerator.icons = selectedIcons
		IcoGenerator.generate() // Generator method will invoke the main functions

		if (IcoGenerator.errors.error === true)
			// Check if generator has error after create css, fonts and svg
			console.log('errors: ', IcoGenerator.errors.message) // eslint-disable-line no-console
		IcoGenerator.fsEngine.zipDir() // Create zip file after create necessary file and folder

		res.status(200).send({ uuid: IcoGenerator.fsEngine.uid, success: true })
	} catch (error) {
		res.status(200).send({ success: false, message: error })
	}
})

/**
 * Generate icofonts.json from main icons.json for view
 * It will generate new package for newly added svg icon which contain css and fonts files
 * Move package folder to the public css and a zip version to the global_download folder for all users
 */

router.get('/bf142d158ec57bea9a9cae1b77d5018d/svg2package', (req, res) => {
	try {
		Package.initiate();
		res.status(200).send({ success: true })
	} catch (e) {
		res.status(200).send({ success: false })
	}
})

module.exports = router

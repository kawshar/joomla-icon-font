const path = require('path')
const fs = require('fs')
const SvgPath = require('svgpath')
const _ = require('lodash')
const IcoGenerator = require('./build_embedded_fonts')
const ProcessSvg = require('./process_svg')

const Package = {
    initiate: () => {
        
		const rootPath = path.resolve('.')
        const configPath = rootPath + '/config';
        const fontDir = rootPath + '/packages'
		const jsonWritePath = fontDir + '/icofonts.json'
		
		if (!fs.existsSync(fontDir)) {
			res.status(403).end()
		}
		const cfg = JSON.parse(fs.readFileSync(path.resolve(configPath, 'icons.json'), 'utf8'))
		
		let collection = module.exports.collectGlyphData(cfg, fontDir);
		IcoGenerator.font = Object.assign({}, IcoGenerator.font, cfg.font);
		IcoGenerator.isSelfPackage = true
		IcoGenerator.icons = collection.glyphs
		IcoGenerator.generate() // Generator method will invoke the main functions
		if (IcoGenerator.errors.error === true) {
			// Check if generator has error after create css, fonts and svg
			console.log('errors: ', IcoGenerator.errors.message) // eslint-disable-line no-console
		}
		IcoGenerator.fsEngine.zipDir() // Create zip file after create necessary file and folder
		fs.writeFile(jsonWritePath, JSON.stringify(collection, null, 2), 'utf8', err => {
			if (err) console.log('file write error:  ', err) // eslint-disable-line no-console
		})
    },

    collectGlyphData: (cfg, fontDir) => {
        let configServer = {
			glyphs: [],
			icons: [],
			categories: {},
			font: {},
			meta: {}
		}
        configServer.font = _.clone(cfg.font, true)
		// iterate glyphs
		_.forEach(cfg.glyphs, function(glyph) {
			// Cleanup fields list
			let glyphData = _.pick(glyph, ['css', 'name', 'duotone', 'assign', 'code', 'id', 'css-ext', 'cat'])
			// Add more data for server config
			glyphData.filename = cfg.font.filename
			glyphData.svg = {}
			// load file & translate coordinates
			let fileName = path.join(fontDir, glyph.cat, glyphData.name + '.svg')
			// let svg = ProcessSvg.parseSvgImage(fs.readFileSync(fileName, 'utf8'), fileName)
			let svg = ProcessSvg.convert(fs.readFileSync(fileName, 'utf8'))
            
			// FIXME: Apply transform from svg file. Now we understand
			// pure paths only.
			let scale = 1000 / svg.height
			glyphData.svg.width = +(svg.width * scale).toFixed(1)
            glyphData.svg.path = new SvgPath(svg.d)
                .translate(-svg.x, -svg.y)
                .scale(scale)
				.abs()
				.round(1)
				.rel()
				.toString()
			const newGlyphs = {
				id: glyphData.id,
				name: glyphData.css,
				assign: glyphData.assign,
				duotone: glyphData.duotone,
				code: glyphData.code,
				svg: glyphData.svg,
                cat: glyphData.cat,
                alias: glyph.alias,
			}

			if (configServer.categories[glyphData.cat]) {
				configServer.categories[glyphData.cat].total =
					configServer.categories[glyphData.cat].total + 1
			} else {
				configServer.categories[glyphData.cat] = { cat_name: glyphData.cat, total: 1 }
			}
			configServer.glyphs.push(_.clone(newGlyphs, true))
        })
        return configServer;
    }
}

module.exports = Package
// const uuidv4 = require('uuid/v4')
const Domparser = require('xmldom').DOMParser
const _ = require('lodash')
const SvgPath = require('svgpath')
const notQuiteAttribute = require('./constant')

// noinspection JSAnnotator
const ProcessSvg = {
	svgObj: null,
	quietTags: [],
	error: null,

	notQuietAtts: [],
	parseSvgImage: (data, filename) => {
		const doc = new Domparser().parseFromString(data, 'application/xml')
		const svg = doc.getElementsByTagName('svg')[0]
		module.exports.svgObj = svg
		if (!svg.hasAttribute('height')) {
			throw new Error(
				filename ? 'Missed height attribute in ' + filename : 'Missed height attribute'
			)
		}
		if (!svg.hasAttribute('width')) {
			throw new Error(
				filename ? 'Missed width attribute in ' + filename : 'Missed width attribute'
			)
		}

		let height = svg.getAttribute('height')
		let width = svg.getAttribute('width')

		// Silly strip 'px' at the end, if exists
		height = parseFloat(height)
		width = parseFloat(width)

		let path = svg.getElementsByTagName('path')
		if (path.length > 1) {
			throw new Error(
				'Multiple paths not supported' + (filename ? ' (' + filename + ' ' : '')
			)
		}
		if (path.length === 0) {
			throw new Error('No path data fount' + (filename ? ' (' + filename + ' ' : ''))
		}

		path = path[0]

		let d = path.getAttribute('d')
		
		let transform = ''

		if (path.hasAttribute('transform')) {
			transform = path.getAttribute('transform')
		}
		return { height, width, d, transform }
	},

	getCoordinates: (data, _svg=null) => {
		// getting viewBox values array
		let svg ;
		if( _svg === null ) { 
			const doc = new Domparser().parseFromString(data, 'application/xml')
			svg = doc.getElementsByTagName('svg')[0]
		} else {
			svg = _svg;
		}
		
		const viewBoxAttr = svg.getAttribute('viewBox')
		let viewBox = _.map((viewBoxAttr || '').split(/(?: *, *| +)/g), val => {
			return parseFloat(val)
		})
		let error = null
		// If viewBox attr has less than 4 digits it's incorrect
		if (viewBoxAttr && viewBox.length < 4) {
			error = 'Svg viewbox attr has less than 4 params'
		}

		// getting base parameters
		let attr = {}
		_.forEach(['x', 'y', 'width', 'height','code'], function(key) {
			let val = svg.getAttribute(key)

			// TODO: remove and do properly
			// Quick hack - ignore values in %. There can be strange cases like
			// `width="100%" height="100%" viewbox="0 0 1000 1000"`
			if (val.length && val[val.length - 1] !== '%') {
				attr[key] = parseFloat(svg.getAttribute(key))
			}
		})

		if (viewBox[2] < 0 || viewBox[3] < 0 || attr.width < 0 || attr.height < 0) {
			error = 'Svg sizes can`t be negative'
		}

		let path = svg.getElementsByTagName('path')[0]
		// let g = svg.getElementsByTagName('g')
		let d = path.getAttribute('d')

		let transform = ''

		if (path.hasAttribute('transform')) {
			transform = path.getAttribute('transform')
		}
		let result = {
			x: attr.x || 0,
			y: attr.y || 0,
			d: d,
			transform: transform,
			width: attr.width,
			height: attr.height,
			code: attr.code,
			viewBox: viewBoxAttr,
			error: error
		}

		if (!viewBoxAttr) {
			// Only svg width & height attrs are set
			if (result.width && result.height) {
				return result
			}
			
			// viewBox not set and attrs not set
			result.error = new Error('Not implemented yet. There is no width or height')
			// TODO: Need calculate BBox
			
			return result
		}

		/* if ( (result.x !== 0 && viewBox[0] !== 0 && result.x !== viewBox[0]) ) {
      result.error = new Error('Not implemented yet. Svg attr x not equals viewbox x');
      // TODO: Need transform
      return result;
    }
    if ( (result.y !== 0 && viewBox[1] !== 0 && result.y !== viewBox[1]) ) {
      result.error = new Error('Not implemented yet. Svg attr y not equals viewbox y');
      // TODO: Need transform
      return result;
    } */

		/* if (viewBox[0]) { result.x = viewBox[0]; }
    if (viewBox[1]) { result.y = viewBox[1]; } */

		// viewBox is set and attrs not set
		if (!result.width && !result.height) {
			result.width = viewBox[2]
			result.height = viewBox[3]
			return result
		}

		return result

		/* // viewBox and attrs are set and values on width and height are equals
    if (viewBox[2] === result.width && viewBox[3] === result.height) {
      return result;
    }
    // viewBox is set and one attr not set
    if (!result.width || !result.height) {
      result.error = new Error('Not implemented yet. Width and height must be set');
      // TODO: Implement BBox. If width or height is setthan implement transform
      return result;
    }
    // viewBox and attrs are set, but have different sizes. Need to transform image
    result.error = new Error('Not implemented yet. Svg viewbox sizes are different with svg sizes');
    // TODO: Implement transform
    return result; */
	},

	processTree: (node, ignoredTags, ignoredAttrs, parentTransforms, path) => {
		notQuiteAttribute.processAttrValues()
		let guaranteed = true
		_.each(node.childNodes, function(item) {
			// If item not Node - skip node . Example: #text - text node, comments
			if (item.nodeType !== 1) {
				return
			}
			// Quiet ignored tags
			if (module.exports.quietTags[item.nodeName]) {
				return
			}

			let transforms = item.getAttribute('transform')
				? parentTransforms + ' ' + item.getAttribute('transform')
				: parentTransforms
			// Parse nested tags
			if (item.nodeName === 'g') {
				let result = module.exports.processTree(
					item,
					ignoredTags,
					ignoredAttrs,
					transforms,
					path
				)
				path = result.path
				guaranteed = guaranteed && result.guaranteed
			}

			// Get d from supported tag, else return
			let d = ''
			switch (item.nodeName) {
				case 'path':
					d = item.getAttribute('d')
					break
				case 'g':
					break
				default:
					ignoredTags[item.nodeName] = true
					return
			}

			let transformedPath = new SvgPath(d).transform(transforms).toString()
			if (path !== '' && transformedPath !== '') {
				guaranteed = false
			}
			path += transformedPath

			// Check not supported attributes
			_.each(item.attributes, function(item) {
				if (notQuiteAttribute.attrs[item.nodeName]) {
					guaranteed = false
					ignoredAttrs[item.nodeName] = true
				}
			})
		})

		return { path, ignoredTags, ignoredAttrs, guaranteed }
	},

	convert: (sourceXml) => {
		const error = null
		const result = {
			svg: {
				path: '',
				width: 0,
				height: 0
			},
			code: '',
			hex: '',
			css: '',
			name: '',
			id: '',
			x: 0,
			y: 0,
			ignoredTags: [],
			ignoredAttrs: [],
			error: error,
			guaranteed: false
		}
		const doc = new Domparser().parseFromString(sourceXml, 'application/xml')
		
		const svg = doc.getElementsByTagName('svg')[0]

		const processed = module.exports.processTree(svg, {}, {}, '', '')
		
		const coords = module.exports.getCoordinates(sourceXml, svg)
		
		if (coords.error) {
			result.error = coords.error
			return result
		}
		result.d = processed.path
		result.width = coords.width
		result.height = coords.height
		result.x = coords.x
		result.y = coords.y
		result.code = coords.code ? coords.code : ''
		result.guaranteed = processed.guaranteed
		result.ignoredTags = _.keys(processed.ignoredTags)
		result.ignoredAttrs = _.keys(processed.ignoredAttrs)
		return result
	}
}

module.exports = ProcessSvg

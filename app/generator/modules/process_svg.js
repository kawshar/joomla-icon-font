const Domparser = require('xmldom').DOMParser
const _ = require('lodash')
const SvgPath = require('svgpath')
const notQuiteAttribute = require('./constant')


const convertToString = (arr) => {
	const p2s = /,?([achlmqrstvxz]),?/gi;
	return arr.join(',').replace(p2s, '$1');
}
const valid = (val) => {
  return !(typeof (val) !== 'number' || val == Infinity || val < 0);
}
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
		let transform = ''

		if (path && path.hasAttribute('transform')) {
			transform = path.getAttribute('transform')
		}
		let result = {
			x: attr.x || 0,
			y: attr.y || 0,
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

		// // viewBox is set and attrs not set
		// if (!result.width && !result.height) {
		// 	result.width = viewBox[2]
		// 	result.height = viewBox[3]
		// 	return result
		// }

		return result
	},

	/**
	 * get the circle|ellipse drawn attributes
	 */
	getCircleDrawnAttr: (item, tag) => {
		const num = 1.81; //Possibly the cubed root of 6, but 1.81 works best
		let rx = +item.getAttribute('rx'),
			ry = +item.getAttribute('ry'),
			cx = +item.getAttribute('cx'),
			cy = +item.getAttribute('cy');
		if (tag == 'circle')
		{
			rx = ry = +item.getAttribute('r');
		}

		return convertToString([
			['M', (cx - rx), (cy)],
			['C', (cx - rx), (cy - ry / num), (cx - rx / num), (cy - ry), (cx), (cy - ry)],
			['C', (cx + rx / num), (cy - ry), (cx + rx), (cy - ry / num), (cx + rx), (cy)],
			['C', (cx + rx), (cy + ry / num), (cx + rx / num), (cy + ry), (cx), (cy + ry)],
			['C', (cx - rx / num), (cy + ry), (cx - rx), (cy + ry / num), (cx - rx), (cy)],
			['Z']
		]);
	},

	/**
	 * Get the rect drawn attributes
	 * @param	item	element from the svg (react)
	 * @param	rectAsArgs	Boolean. If true, rect roundings will be as arcs. Otherwise as cubics.
	 */
	getRectDrawnAttr: (item, rectAsArgs=true) => {
		let rx = +item.getAttribute('rx'),
			ry = +item.getAttribute('ry'),
			x = item.getAttribute('x'),
			y = item.getAttribute('y'),
			w = item.getAttribute('width'),
			h = item.getAttribute('height');
			if(!x) x=0;
			if(!y) y=0;
			if(!w) w=0;
			if(!h) h=0;
			x = Number(x);
			y = Number(y);
			w = Number(w);
			h = Number(h);
      // Validity checks from http://www.w3.org/TR/SVG/shapes.html#RectElement:
      // If neither ‘rx’ nor ‘ry’ are properly specified, then set both rx and ry to 0. (This will result in square corners.)
      if (!rx && !ry) rx = ry = 0;
      // Otherwise, if a properly specified value is provided for ‘rx’, but not for ‘ry’, then set both rx and ry to the value of ‘rx’.
      else if (rx && !ry) ry = rx;
      // Otherwise, if a properly specified value is provided for ‘ry’, but not for ‘rx’, then set both rx and ry to the value of ‘ry’.
      else if (ry && !rx) rx = ry;
      else
      {
        // If rx is greater than half of ‘width’, then set rx to half of ‘width’.
        if (rx > w / 2) rx = w / 2;
        // If ry is greater than half of ‘height’, then set ry to half of ‘height’.
        if (ry > h / 2) ry = h / 2;
	  }
	  
      if (rx < 1 && ry < 1)
      { 
        return convertToString([
			['M', x, y],
			['L', x + w, y],
			['L', x + w, y + h],
			['L', x, y + h],
			['L', x, y],
			['Z']
		]);
      }
      else if (rectAsArgs)
      {
        return convertToString([
			['M', x + rx, y],
			['H', x + w - rx],
			['A', rx, ry, 0, 0, 1, x + w, y + ry],
			['V', y + h - ry],
			['A', rx, ry, 0, 0, 1, x + w - rx, y + h],
			['H', x + rx],
			['A', rx, ry, 0, 0, 1, x, y + h - ry],
			['V', y + ry],
			['A', rx, ry, 0, 0, 1, x + rx, y]
			]);
      	}
      else
      {
    	const num = 2.19;
		if (!ry) ry = rx
        return convertToString([
				['M', x, y + ry],
				['C', x, y + ry / num, x + rx / num, y, x + rx, y],
				['L', x + w - rx, y],
				['C', x + w - rx / num, y, x + w, y + ry / num, x + w, y + ry],
				['L', x + w, y + h - ry],
				['C', x + w, y + h - ry / num, x + w - rx / num, y + h, x + w - rx, y + h],
				['L', x + rx, y + h],
				['C', x + rx / num, y + h, x, y + h - ry / num, x, y + h - ry],
				['L', x, y + ry],
				['Z']
			]);
		  }
		
	},
	/**
	 * Get line draw attribute
	 */
	getLineDrawAttr: (item) => {
		const x1 = item.getAttribute('x1'),
		y1 = item.getAttribute('y1');
		x2 = item.getAttribute('x2');
		y2 = item.getAttribute('y2');
		return 'M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2;
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
				case 'polygon':
					d = 'M' + item.getAttribute('points') + 'Z';
					break;
				case 'polyline':
					d = 'M' + item.getAttribute('points');
					break;
				case 'line':
					d = module.exports.getLineDrawAttr(item);
					break;
				case 'ellipse':
				case 'circle':
					d = module.exports.getCircleDrawnAttr(item, item.nodeName);
					break;
				case 'rect':
					// d = module.exports.getRectDrawnAttr(item);
					break;
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
			viewBox: '',
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
		result.viewBox = coords.viewBox
		result.code = coords.code ? coords.code : ''
		result.guaranteed = processed.guaranteed
		result.ignoredTags = _.keys(processed.ignoredTags)
		result.ignoredAttrs = _.keys(processed.ignoredAttrs)
		return result
	}
}

module.exports = ProcessSvg

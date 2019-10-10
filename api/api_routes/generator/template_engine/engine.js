/**
 * @package 	Icon Template Engine
 * 
 * @copyright   Copyright (C) 2005 - 2019 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 * 
 * @since		4.0.0
 */

const _ = require('lodash')

const svgFontTemplate = _.template(
	'<?xml version="1.0" standalone="no"?>\n' +
		'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
		'<svg xmlns="http://www.w3.org/2000/svg">\n' +
		'<defs>\n' +
		'<font id="<%= font.id %>" horiz-adv-x="<%= font.fontHeight %>" >\n' +
		'<font-face' +
		' font-family="<%= font.fontfamily %>"' +
		' font-weight="400"' +
		' font-style="<%= font.style %>"' +
		' units-per-em="<%= font.fontHeight	%>"' +
		' ascent="<%= font.ascent %>"' +
		' descent="<%= font.descent %>"' +
		' />\n' +
		'<missing-glyph horiz-adv-x="<%= font.fontHeight %>" />\n' +
		'<% _.forEach(glyphs, function(glyph) { %>' +
		'<glyph' +
		' glyph-name="<%= glyph.css %>"' +
		' horiz-adv-x="<%= glyph.width %>"' +
		' unicode="<%= glyph.content %>"' +
		' d="<%= glyph.d %>"' +
		' />\n' +
		'<% }); %>' +
		'</font>\n' +
		'</defs>\n' +
		'</svg>'
)

const singleSvgFontTemplate = _.template(
	'<?xml version="1.0" standalone="no"?>\n' +
		'<svg xmlns="http://www.w3.org/2000/svg" height="<%= glyph.height %>" width="<%= glyph.width %>" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
		'<metadata><%= font.metadata %></metadata>\n' +
		'<title><%= glyph.name %></title>\n' +
		'<glyph' +
		' glyph-name="<%= glyph.css %>"' +
		' unicode="<%= glyph.content %>"' +
		' horiz-adv-x="<%= glyph.width %>"' +
		' />\n' +
		'<path d="<%= glyph.d %>"/>\n' +
		'</svg>'
)

/**
 * Generate CSS template for all fonts based on font config and glyph list
 * If icon is duotone then add extra class duotone other wise just add icon class with prefix
 */

var cssFontFile = _.template(
	'/*! \n' +
		'* @package <%= font.fontfamily %> \n' +
		'* @version <%= font.version %> \n' +
		'* @author <%= font.author %> <%= font.url %> \n' +
		'* @copyright <%= font.copyright %> \n' +
		'* @license <%= font.license %> \n' +
		'*/\n\n' +
		'@font-face' +
		'{ \n' +
		'font-family: "<%= font.fontfamily %>";\n' +
		'font-weight: <%= font.weight %>;\n' +
		'font-style: "<%= font.style %>";\n' +
		'src: url("./fonts/<%= font.filename %>.woff2") format("woff2"),\n' +
		'url("./fonts/<%= font.filename %>.woff") format("woff");\n' +
		'}' +
		'\n' +
		'[class^="<%= font.prefix %>-"], [class*=" <%= font.prefix %>-"] { \n' +
		"font-family: '<%= font.fontfamily %>' !important;\n" +
		'speak: none;\n' +
		'font-style: normal;\n' +
		'font-weight: normal;\n' +
		'font-variant: normal;\n' +
		'text-transform: none;\n' +
		'white-space: nowrap;\n' +
		'word-wrap: normal;\n' +
		'direction: ltr;\n' +
		'line-height: 1;\n' +
		'/* Better Font Rendering =========== */\n' +
		'-webkit-font-feature-settings: "liga";\n' +
		'-webkit-font-smoothing: antialiased;\n' +
		'}\n' +
		`<% _.forEach(glyphs, function(glyph) { 
			let duotone = glyph.duotone ? ".duotone" : ""
			let cssClass = '.'+font.prefix +'-'+ glyph.css + ':' + glyph.assign
			if(glyph.alias) {
				_.forEach( glyph.alias.split(','), function(al){
					cssClass += ',.'+font.prefix +'-'+ al + ':' + glyph.assign
				})
			}
		%>
		<%= duotone %><%= cssClass %> {
		content: "\\<%= glyph.unicode %>";
		}\n
		<% }); %>
		
	[class^="<%= font.prefix %>-"].duotone,
	[class*=" <%= font.prefix %>-"].duotone {
		position: relative;
	}
	[class^="<%= font.prefix %>-"].duotone:before,
	[class*=" <%= font.prefix %>-"].duotone:before {
		position: absolute;
		left: 0;
		top: 0;
	}
	[class^="<%= font.prefix %>-"].duotone:after,
	[class*=" <%= font.prefix %>-"].duotone:after {
		opacity: 0.4;
	}
	.<%= font.prefix %>-xs {
		font-size: .5em; 
	}

	.<%= font.prefix %>-sm {
		font-size: .75em; 
	}

	.<%= font.prefix %>-md{
		font-size: 1.25em; 
	}

	.<%= font.prefix %>-lg {
		font-size: 1.5em;
	}

	.<%= font.prefix %>-1x {
		font-size: 1em; 
	}

	.<%= font.prefix %>-2x {
		font-size: 2em; 
	}

	.<%= font.prefix %>-3x {
		font-size: 3em; 
	}

	.<%= font.prefix %>-4x {
		font-size: 4em; 
	}

	.<%= font.prefix %>-5x {
		font-size: 5em; 
	}

	.<%= font.prefix %>-6x {
		font-size: 6em; 
	}

	.<%= font.prefix %>-7x {
		font-size: 7em; 
	}

	.<%= font.prefix %>-8x {
		font-size: 8em; 
	}

	.<%= font.prefix %>-9x {
		font-size: 9em; 
	}

	.<%= font.prefix %>-10x {
		font-size: 10em; 
	}

	.<%= font.prefix %>-fw {
		text-align: center;
		width: 1.25em; 
	}

	.<%= font.prefix %>-ul {
		list-style-type: none;
		padding-left: 0;
		margin-left: 0; 
	}
	.<%= font.prefix %>-ul > li {
		position: relative;
		line-height: 2em;
	}
	.<%= font.prefix %>-ul > li .<%= font.prefix %>{
		display: inline-block;
		vertical-align: middle;
	}
	.<%= font.prefix %>-border {
		border: solid 0.08em #f1f1f1;
		border-radius: .1em;
		padding: .2em .25em .15em; 
	}

	.<%= font.prefix %>-pull-left {
		float: left; 
	}

	.<%= font.prefix %>-pull-right {
		float: right; 
	}

	.<%= font.prefix %>.<%= font.prefix %>-pull-left {
		margin-right: .3em; 
	}

	.<%= font.prefix %>.<%= font.prefix %>-pull-right {
		margin-left: .3em; 
	}

	.<%= font.prefix %>-spin {
	-webkit-animation: <%= font.prefix %>-spin 2s infinite linear;
		animation: <%= font.prefix %>-spin 2s infinite linear; 
		display: inline-block;
	}

	.<%= font.prefix %>-pulse {
	-webkit-animation: <%= font.prefix %>-spin 1s infinite steps(8);
		animation: <%= font.prefix %>-spin 1s infinite steps(8); 
		display: inline-block;
	}

	@-webkit-keyframes <%= font.prefix %>-spin {
	0% {
		-webkit-transform: rotate(0deg);
				transform: rotate(0deg); }
	100% {
		-webkit-transform: rotate(360deg);
				transform: rotate(360deg); } 
	}

	@keyframes <%= font.prefix %>-spin {
	0% {
		-webkit-transform: rotate(0deg);
				transform: rotate(0deg);
	}
	100% {
		-webkit-transform: rotate(360deg);
				transform: rotate(360deg); } 
	}

	.<%= font.prefix %>-rotate-90 {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=1)";
	-webkit-transform: rotate(90deg);
			transform: rotate(90deg); 
	}

	.<%= font.prefix %>-rotate-180 {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2)";
	-webkit-transform: rotate(180deg);
			transform: rotate(180deg); 
	}

	.<%= font.prefix %>-rotate-270 {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=3)";
	-webkit-transform: rotate(270deg);
			transform: rotate(270deg); 
	}

	.<%= font.prefix %>-flip-horizontal {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)";
	-webkit-transform: scale(-1, 1);
			transform: scale(-1, 1); 
	}

	.<%= font.prefix %>-flip-vertical {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)";
	-webkit-transform: scale(1, -1);
			transform: scale(1, -1); 
	}
			
	.<%= font.prefix %>-flip-horizontal.<%= font.prefix %>-flip-vertical {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)";
	-webkit-transform: scale(-1, -1);
			transform: scale(-1, -1); 
	}

	:root .<%= font.prefix %>-rotate-90,
	:root .<%= font.prefix %>-rotate-180,
	:root .<%= font.prefix %>-rotate-270,
	:root .<%= font.prefix %>-flip-horizontal,
	:root .<%= font.prefix %>-flip-vertical {
	-webkit-filter: none;
			filter: none; 
			display: inline-block;
	}

	.<%= font.prefix %>-inverse {
	color: #fff; 
	}
	`
);
/**
 * 
 * Example HTML generate code
 */
var exampleHtml = _.template(
	`<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<title>Examples | <%= font.fontfamily %></title>
		<link rel="stylesheet" type="text/css" href="./<%= font.filename %>.min.css">
		<style type="text/css">
			body {
				margin: 0;
				padding: 0;
				background: #F6F6F9;
			}
			.header {
				border-bottom: 1px solid #DCDCE1;
				padding: 10px 0;
				margin-bottom: 10px;
			}
			.container {
				width: 980px;
				margin: 0 auto;
			}
			.ico-title {
				font-size: 2em;
			}
			.iconlist {
				margin: 0;
				padding: 0;
				list-style: none;
				text-align: center;
				width: 100%;
				display: flex;
				flex-wrap: wrap;
				flex-direction: row;
			}
			.iconlist li {
				position: relative;
				margin: 5px;
				width: 150px;
				cursor: pointer;
			}
			.iconlist li .icon-holder {
				position: relative;
				text-align: center;
				border-radius: 3px;
				overflow: hidden;
				padding-bottom: 5px;
				background: #ffffff;
				border: 1px solid #E4E5EA;
				transition: all 0.2s linear 0s;
			}
			.iconlist li .icon-holder:hover {
				background: #00C3DA;
				color: #ffffff;
			}
			.iconlist li .icon-holder:hover .icon i {
				color: #ffffff;
			}
			.iconlist li .icon-holder .icon {
				padding: 20px;
				text-align: center;
			}
			.iconlist li .icon-holder .icon i {
				font-size: 3em;
				color: #1F1142;
			}
			.iconlist li .icon-holder span {
				font-size: 14px;
				display: block;
				margin-top: 5px;
				border-radius: 3px;
			}
		</style>
	</head>
	<body>
	<div class="header">
		<div class="container">
			<h1 class="ico-title"> <%= font.fontFamily %> Icons </h1>
		</div>
	</div>
	<div class="container">
		<ul class="iconlist">
		<% _.forEach(glyphs, function(glyph){ 
			if(glyph.assign === 'after') return;
			let className = glyph.duotone ? 'duotone '+font.prefix+ '-' + glyph.css : font.prefix+ '-' + glyph.css
		%>
		<li>
			<div class="icon-holder">
				<div class="icon"> 
					<i class="<%= className %>"></i>
				</div> 
				<span> <%= glyph.css %> </span>
				<% if(glyph.alias) { %> <span class="alias"> Alias: <%= glyph.alias %> </span> <%}%>
			</div>
		</li>
		<% }); %>
		</ul>
	</div>	
	</body>
	</html>
	`
)

const updateSvgTemplate = _.template(
	`<?xml version="1.0"?>
	<svg xmlns="http://www.w3.org/2000/svg" 
		width="<%= svg.width %>" 
		height="<%= svg.height %>" 
		viewbox="<%= svg.viewBox %>" 
		code="<%= svg.code %>" 
		<% if(svg.transform !== "") { %> transform="<%= svg.transform %>"<% } %>
		><path d="<%= svg.d %>"/>
	</svg>
	`
)


module.exports = {
	singleSvgFontTemplate,
	svgFontTemplate,
	cssFontFile,
	updateSvgTemplate,
	exampleHtml
}

const _ = require('lodash')

const svgFontTemplate = _.template(
	'<?xml version="1.0" standalone="no"?>\n' +
		'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
		'<svg xmlns="http://www.w3.org/2000/svg">\n' +
		'<defs>\n' +
		'<font id="<%= font.id %>" horiz-adv-x="<%= font.fontHeight %>" >\n' +
		'<font-face' +
		' font-family="<%= font.familyname %>"' +
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

/*
 * CSS template
 */

var cssFontFile = _.template(
	'/*! \n' +
		'* @package IcoFont \n' +
		'* @version <%= font.version %> \n' +
		'* @author IcoFont https://icofont.com \n' +
		'* @copyright Copyright (c) 2015 - <%= font.copyright %> IcoFont \n' +
		'* @license - https://icofont.com/license/\n' +
		'*/\n\n' +
		'@font-face' +
		'{ \n' +
		'font-family: "<%= font.familyname %>";\n' +
		'font-weight: <%= font.weight %>;\n' +
		'font-style: "<%= font.style %>";\n' +
		'src: url("./fonts/<%= font.fontname %>.woff2") format("woff2"),\n' +
		'url("./fonts/<%= font.fontname %>.woff") format("woff");\n' +
		'}' +
		'\n' +
		'[class^="icofont-"], [class*=" icofont-"] { \n' +
		"font-family: '<%= font.familyname %>' !important;\n" +
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
		'<% _.forEach(glyphs, function(glyph) { let duotone = glyph.duotone ? ".duotone" : "" %>' +
		'<%= duotone %>.<%= font.prefix %>-<%= glyph.css %>:<%= glyph.assign %> {' +
		'content: "\\<%= glyph.unicode %>";' +
		'}\n' +
		'<% }); %>'+
		`
	[class^="icofont-"].duotone,
	[class*=" icofont-"].duotone {
		position: relative;
	}
	[class^="icofont-"].duotone:before,
	[class*=" icofont-"].duotone:before {
		position: absolute;
		left: 0;
		top: 0;
	}
	[class^="icofont-"].duotone:after,
	[class*=" icofont-"].duotone:after {
		opacity: 0.4;
	}
	.icofont-xs {
		font-size: .5em; 
	}

	.icofont-sm {
		font-size: .75em; 
	}

	.icofont-md{
		font-size: 1.25em; 
	}

	.icofont-lg {
		font-size: 1.5em;
	}

	.icofont-1x {
		font-size: 1em; 
	}

	.icofont-2x {
		font-size: 2em; 
	}

	.icofont-3x {
		font-size: 3em; 
	}

	.icofont-4x {
		font-size: 4em; 
	}

	.icofont-5x {
		font-size: 5em; 
	}

	.icofont-6x {
		font-size: 6em; 
	}

	.icofont-7x {
		font-size: 7em; 
	}

	.icofont-8x {
		font-size: 8em; 
	}

	.icofont-9x {
		font-size: 9em; 
	}

	.icofont-10x {
		font-size: 10em; 
	}

	.icofont-fw {
		text-align: center;
		width: 1.25em; 
	}

	.icofont-ul {
		list-style-type: none;
		padding-left: 0;
		margin-left: 0; 
	}
	.icofont-ul > li {
		position: relative;
		line-height: 2em;
	}
	.icofont-ul > li .icofont{
		display: inline-block;
		vertical-align: middle;
	}
	.icofont-border {
		border: solid 0.08em #f1f1f1;
		border-radius: .1em;
		padding: .2em .25em .15em; 
	}

	.icofont-pull-left {
		float: left; 
	}

	.icofont-pull-right {
		float: right; 
	}

	.icofont.icofont-pull-left {
		margin-right: .3em; 
	}

	.icofont.icofont-pull-right {
		margin-left: .3em; 
	}

	.icofont-spin {
	-webkit-animation: icofont-spin 2s infinite linear;
		animation: icofont-spin 2s infinite linear; 
		display: inline-block;
	}

	.icofont-pulse {
	-webkit-animation: icofont-spin 1s infinite steps(8);
		animation: icofont-spin 1s infinite steps(8); 
		display: inline-block;
	}

	@-webkit-keyframes icofont-spin {
	0% {
		-webkit-transform: rotate(0deg);
				transform: rotate(0deg); }
	100% {
		-webkit-transform: rotate(360deg);
				transform: rotate(360deg); } 
	}

	@keyframes icofont-spin {
	0% {
		-webkit-transform: rotate(0deg);
				transform: rotate(0deg);
	}
	100% {
		-webkit-transform: rotate(360deg);
				transform: rotate(360deg); } 
	}

	.icofont-rotate-90 {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=1)";
	-webkit-transform: rotate(90deg);
			transform: rotate(90deg); 
	}

	.icofont-rotate-180 {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2)";
	-webkit-transform: rotate(180deg);
			transform: rotate(180deg); 
	}

	.icofont-rotate-270 {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=3)";
	-webkit-transform: rotate(270deg);
			transform: rotate(270deg); 
	}

	.icofont-flip-horizontal {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)";
	-webkit-transform: scale(-1, 1);
			transform: scale(-1, 1); 
	}

	.icofont-flip-vertical {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)";
	-webkit-transform: scale(1, -1);
			transform: scale(1, -1); 
	}
			
	.icofont-flip-horizontal.icofont-flip-vertical {
	-ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)";
	-webkit-transform: scale(-1, -1);
			transform: scale(-1, -1); 
	}

	:root .icofont-rotate-90,
	:root .icofont-rotate-180,
	:root .icofont-rotate-270,
	:root .icofont-flip-horizontal,
	:root .icofont-flip-vertical {
	-webkit-filter: none;
			filter: none; 
			display: inline-block;
	}

	.icofont-inverse {
	color: #fff; 
	}

	.sr-only {
		border: 0;
		clip: rect(0, 0, 0, 0);
		height: 1px;
		margin: -1px;
		overflow: hidden;
		padding: 0;
		position: absolute;
		width: 1px; 
	}

	.sr-only-focusable:active,
	.sr-only-focusable:focus {
		clip: auto;
		height: auto;
		margin: 0;
		overflow: visible;
		position: static;
		width: auto; 
	}
	`
)

var exampleHtml = _.template(
	`<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<title>Examples | IcoFont</title>
		<link rel="stylesheet" type="text/css" href="./icofont.min.css">
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
			<h1 class="ico-title"> IcoFont Icons </h1>
		</div>
	</div>
	<div class="container">
		<ul class="iconlist">
		<% _.forEach(glyphs, function(glyph){ 
			if(glyph.assign === 'after') return;
			var className = glyph.duotone ? 'duotone '+font.prefix+ '-' + glyph.css : font.prefix+ '-' + glyph.css
		%>
		<li>
			<div class="icon-holder">
				<div class="icon"> 
					<i class="<%= className %>"></i>
				</div> 
				<span> <%= glyph.css %> </span>
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
	<svg xmlns="http://www.w3.org/2000/svg" width="<%= svg.width %>" height="<%= svg.height %>" viewbox="<%= svg.viewBox %>" code="<%= svg.code %>" <% if(svg.transform !== "") { %> transform="<%= svg.transform %>"<% } %>><path d="<%= svg.d %>"/></svg>
	`
)


module.exports = {
	singleSvgFontTemplate,
	svgFontTemplate,
	cssFontFile,
	updateSvgTemplate,
	exampleHtml
}

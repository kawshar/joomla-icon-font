const fs        = require('fs');
const _         = require('lodash');
const SvgPath   = require('svgpath');
const uuidv4    = require('uuid/v4');
const svg2ttf   = require('svg2ttf');
const ttf2eot   = require('ttf2eot');
const ttf2woff  = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
const b64       = require('base64-js');
const compressor    = require('node-minify');
const cssbeautify   = require('cssbeautify');
const FsEngine      = require('./fs_builder');
const TemplateEngine = require('../template_engine/engine');

const IcoGenerator = {
    icons : [],
    errors: {
        error: false,
        message : []
    },
    font : {
        prefix: 'joomla',
        filename: 'joomla',
        fontfamily: 'JoomlaFont',
        weight: 'normal',
        copyrightStart: 2015,
        copyright: '',
        style: 'Regular',
        ascent : 850,
        descent : -150,
        fontHeight : 850 - (-150),
    },
    glyphs : [],
    uid : uuidv4(),
    isSelfPackage: false,
    generate: ()=> {
        module.exports.init();
        module.exports.exportResource();
        if(!fs.existsSync(module.exports.fsEngine.fontsFolder + '/'+ module.exports.font.filename +'.svg'))
            module.exports.errorLog("convert not possible, SVG file not exists!")
        else {
            module.exports.convertSvgToWebFont()
        }
    },

    singleSvgInit: (icon) => {
        let glyph = {
                height: (typeof icon.svg.height === 'undefined') ? icon.svg.width : icon.svg.height,
                width : icon.svg.width,
                d     : icon.svg.path,
                css   : icon.name,
                assign   : icon.assign,
                id    : icon.id,
                name  : icon.name,
                unicode : icon.code.toString(16),
                content: '&#x'+icon.code.toString(16)+';'
            }
        FsEngine.srcPath = 'download'
        module.exports.fsEngine = FsEngine.singleSvgInit(module.exports.uid)
        
        let font = module.exports.font;
        module.exports.svgTemplate = TemplateEngine.singleSvgFontTemplate({font, glyph}) 
        
        module.exports.exportSingleSVG(glyph)      
    },

    init: ( isCustom = false ) => {
        module.exports.flashModule()
        module.exports.glyphGenerator();
        if( isCustom === false ) {
            if( module.exports.isSelfPackage )
                FsEngine.srcPath = 'global_package'
            else 
                FsEngine.srcPath = 'download'

            FsEngine.packageName = module.exports.font.packageName
            module.exports.fsEngine = FsEngine.init(module.exports.uid, true);
            module.exports.renderTemplate();
        }else {
            module.exports.exportFontFace()
        }
    },

    glyphGenerator: () => {
        _.forEach(module.exports.icons,  (glyph) => {
            module.exports.addIcon(glyph)
        });
    },
    addIcon: (glyph) => {
        module.exports.glyphs.push({
            height: (typeof glyph.svg.height === 'undefined') ? glyph.svg.width : glyph.svg.height,
            width : glyph.svg.width,
            d     : new SvgPath(glyph.svg.path)
                .scale(1, -1)
                .translate(0,850)
                .abs().round(0).rel()
                .toString(),
            css   : glyph.name,
            assign   : glyph.assign,
            duotone   : glyph.duotone,
            id    : glyph.id,
            name  : glyph.name,
            content : '&#x'+glyph.code+';',
            unicode : glyph.code
        });
    },

    getUnicode: (glyph_name) => {
        let unicode = glyph_name.split('')
        unicode.filter((s,i) => {
            if( !isNaN(s)){
               unicode[i] ='&#x3'+unicode[i]+';'
            }
          })
        unicode = unicode.join('').split('-').join('_')
        return unicode
    },

    renderTemplate: () => {
        let font = module.exports.font;
        let glyphs = module.exports.glyphs;
        module.exports.svgTemplate = TemplateEngine.svgFontTemplate({font, glyphs})
        module.exports.cssTemplate = TemplateEngine.cssFontFile({ font, glyphs })
        module.exports.cssTemplate = cssbeautify(module.exports.cssTemplate, {
            indent: '  ',
            openbrace: 'separate-line',
            autosemicolon: true
         })
         //Ignore duplicate icons loop

        module.exports.exampleTemplate = TemplateEngine.exampleHtml({font, glyphs }) 
    },

    exportFontFace: (svg) => {
        const ttf = svg2ttf(svg, {}).buffer
        return 'data:font/truetype;base64,' + b64.fromByteArray(ttf)
    },
    exportSingleSVG: (glyph) => {
        fs.writeFileSync(module.exports.fsEngine.userFolder + '/' + glyph.name.replace(' ','') + '.svg', module.exports.svgTemplate, 'utf8');
        return true
    },
    exportSVG: () => {
        fs.writeFileSync(module.exports.fsEngine.fontsFolder + '/' + module.exports.font.filename + '.svg', module.exports.svgTemplate, 'utf8');
        return true
    },
    exportCSS: () => {
        fs.writeFileSync(module.exports.fsEngine.cssFolder + '/' + module.exports.font.filename + '.css', module.exports.cssTemplate, 'utf8');
        return true
    },
    minifiedCss: () => {
        const cssUrl = module.exports.fsEngine.cssFolder+'/'+ module.exports.font.filename + '.css'
        const cssUrlMinified = module.exports.fsEngine.cssFolder+'/'+ module.exports.font.filename + '.min.css'
        compressor.minify({
            compressor: 'clean-css',
            input: cssUrl,
            output: cssUrlMinified,
            options: {
              advanced: false, // set to false to disable advanced optimizations - selector & property merging, reduction, etc.
              aggressiveMerging: false, // set to false to disable aggressive merging of properties.
              keepSpecialComments: '*'
            },
            callback: (err, min) => {
                if( err )
                    module.exports.errorLog("Css minified problem ");
            }
          });
    },
    exportExampleFile: () => {
        fs.writeFileSync(module.exports.fsEngine.exampleFolder + '/demo.html', module.exports.exampleTemplate, 'utf8');
        return true
    },
    exportResource: () => {
        if(!module.exports.exportSVG())
            module.exports.errorLog("exportSVG has problem! ");
        if(module.exports.exportCSS())
            module.exports.minifiedCss()
        // else
            // module.exports.errorLog("exportCSS has problem! ");
        if(!module.exports.exportExampleFile())
            module.exports.errorLog("exportExampleFile has problem! ");
    },
    svgToTtf: () => {
        const ttf = svg2ttf(fs.readFileSync(module.exports.fsEngine.fontsFolder + '/' + module.exports.font.filename + '.svg', 'utf-8'), {});
        fs.writeFileSync(module.exports.fsEngine.fontsFolder + '/' + module.exports.font.filename + '.ttf', new Buffer.from(ttf.buffer));
        return true
    },
    ttfToEot: () => {
        const input = fs.readFileSync(module.exports.fsEngine.fontsFolder + '/' + module.exports.font.filename + '.ttf');
        fs.writeFileSync(module.exports.fsEngine.fontsFolder + '/' + module.exports.font.filename + '.eot', ttf2eot(input));
        return true
    },
    ttfToWoff: () => {
        const ttf = ttf2woff(fs.readFileSync(module.exports.fsEngine.fontsFolder + '/' + module.exports.font.filename + '.ttf'), {});
        fs.writeFileSync(module.exports.fsEngine.fontsFolder + '/' + module.exports.font.filename + '.woff', new Buffer.from(ttf.buffer));
        return true;
    },
    ttfToWoff2: () => {
        const input = fs.readFileSync(module.exports.fsEngine.fontsFolder + '/' + module.exports.font.filename + '.ttf');
        fs.writeFileSync(module.exports.fsEngine.fontsFolder + '/' + module.exports.font.filename + '.woff2', ttf2woff2(input, {}));
        return true
    },
    
    convertSvgToWebFont: () => {
        if(!module.exports.svgToTtf())
            module.exports.errorLog("svg2ttf generate problem ");
        if(!module.exports.ttfToEot())
            module.exports.errorLog("ttfToEot generate problem ");        
        if(!module.exports.ttfToWoff())
            module.exports.errorLog("ttfToWoff generate problem ");
        if(!module.exports.ttfToWoff2())
            module.exports.errorLog("ttfToWoff2 generate problem ");    
    },
    flashModule: () => {   
      module.exports.errors = { error: false, message: [] }
      module.exports.glyphs = []

    },
    errorLog: (error)=> {
        let errorMessage = module.exports.errors.message
        errorMessage.push(error)
        module.exports.errors = { error: true, message: errorMessage }
    }
}

module.exports = IcoGenerator;



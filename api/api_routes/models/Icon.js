const path = require('path')
const fs = require('fs')
const _ = require('lodash')

const Icon = {
    rootPath: path.resolve('.'),
    icons:[],
    filter_category: [],
    filter_icons: [],
    init: () => {
        const iconPath = path.resolve(module.exports.rootPath + '/src/shared/Reducers/', 'icofonts.json')
        if(fs.existsSync(iconPath)){ 
            module.exports.icons = JSON.parse(fs.readFileSync(iconPath, 'utf8'))
            module.exports.filterIcons(module.exports.icons)
        }
    },
    filterIcons: icons => {
        let filterIcons = []
        let catkeys = Object.keys(icons.categories)
                        .sort((a, b) => icons.categories[a].total - icons.categories[b].total)
                        .filter(n => n !== '')
                        .reverse()   
		module.exports.filter_category = catkeys.map( c =>  {
            icons.glyphs.map( icon => {
                if(icon.cat === c){
                    filterIcons.push({id: icon.id, name: icon.name, code: icon.code, cat: icon.cat, svg: icon.svg })
                }
            })
            return icons.categories[c]
        })
        module.exports.filter_icons = filterIcons
    } 
}
module.exports = Icon
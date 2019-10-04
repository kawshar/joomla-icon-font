const express = require('express')
const router = express.Router()
const path = require('path')
const shell = require('shelljs')
const fs = require('fs')

router.get('/download', (req, res) => {
	let uid = req.query.uid ? req.query.uid : null
	const type = req.query.type ? parseInt(req.query.type) : null
	const iconName = req.query.icon_name ? req.query.icon_name : null
	/*
	 * type = null ( custom download )
	 * type = 1 ( package download )
	 * type = 2 ( single svg download )
	*/

	if (uid === null) {
		res.status(403).end()
	} else {
		let userBasePath = path.resolve('./public/')

		if (type === 1) uid = 'global_package'

		if (
			!fs.existsSync(userBasePath + '/download') ||
			!fs.existsSync(userBasePath + '/download/' + uid)
		)
			res.status(403).end()

		let filename = type === 2 ? iconName + '.svg' : 'icofont.zip'
		let filePath = userBasePath + '/download/' + uid + '/' + filename
		if (type === 2) {
			res.set('Content-Type', 'image/svg+xml')
		} else {
			res.set('Content-Type', 'application/zip')
		}

		res.download(filePath, err => {
			if (!err) {
				if (type !== 1) {
					setTimeout(() => {
						shell.rm('-rf', userBasePath + '/download/' + uid)
					}, 500)
				}
			} else {
				console.log('got error on downoad!') // eslint-disable-line no-console
			}
		})
	}
	// res.sendFile(__dirname + '/demo.html')
})
module.exports = router

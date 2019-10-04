const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const Icon = require('../models/Icon')
/**
 * 
 */
router.get('/all', function(req, res, next) {
	try {
        Icon.init()   
        let iconFilter = Icon.filter_icons
		let	categorySortList = Icon.filter_category
		res.status(200).send({
			success: true,
            filter_category: categorySortList,
            result: iconFilter
		})
	} catch (e) {
		res.status(200).send({ success: false, message: e })
	}
})

module.exports = router
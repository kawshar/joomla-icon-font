const express = require('express')
const config = require('./config/project.config')


const app = express();
// app.use(compress())
app.use(express.static("public"));

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const download = require('./api_routes/download/index')
const index = require('./api_routes/generator/index')
const iconsApi = require('./api_routes/icons/index')

app.use('/api/iconfont', index)
app.use('/api/icons/', iconsApi)

app.use('/process', download)

app.listen(process.env.PORT || config.port, () => {
  console.log("Server is listening at "+config.port );
});

const express = require('express')

const app = express();
app.use(express.static("public"));

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const index = require('./app/generator/index')
app.use('/api/iconfont', index)

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log("Server is listening at "+port );
});

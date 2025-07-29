const path = require('path')
const express = require('express')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Dynamically load each file in /api as a route
const apiDir = path.join(__dirname, 'api')
fs.readdirSync(apiDir).forEach(file => {
  if (!file.endsWith('.js')) return
  const routePath = `/api/${file.replace('.js','')}`
  const handler = require(path.join(apiDir, file))
  // assume each file exports an Express router or a function (req,res)
  if (handler.router) {
    app.use(routePath, handler.router)
  } else {
    app.all(routePath, handler)
  }
})

// Serve static React build
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`)
})

const http = require('http')
const url = require('url')
const PORT = 3000

const server = http.createServer((req, res) => {
    console.log(req.headers)
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
    
    const { pathname } = parsedUrl
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, '')
    
    res.end("Hello World!\n")

    console.log(`Request is received on this path: ${trimmedPath}`)
})

server.listen(PORT,() => console.log(`The server is listening on port ${PORT}`))


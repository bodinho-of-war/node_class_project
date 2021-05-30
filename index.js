const http = require('http')
const querystring = require('querystring')
const PORT = 3000

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
    const { pathname } = parsedUrl
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, '')
    const method = req.method.toLowerCase()

    const queryStringObject = parsedUrl.searchParams

    res.end("Hello World!\n")

    console.log(`Request is received on this path: ${trimmedPath} whit this method: ${method} and with these query string parameters: ${queryStringObject}`)
})

server.listen(PORT,() => console.log(`The server is listening on port ${PORT}`))


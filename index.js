const http = require('http')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')

const handlers = {}

handlers.sample = (data, callback) => {
    callback(406, {'name': 'sample handler'})
}

handlers.notFound = (data, callback) => {
    callback(404)
}

const router = {
    'sample': handlers.sample,
    'notFound': handlers.notFound
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
    const { pathname } = parsedUrl
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, '')
    const method = req.method.toLowerCase()
    const headers = req.headers
    const queryStringObject = parsedUrl.searchParams
    const decoder = new StringDecoder('utf-8')
    
    const buffer = []
    
    req.on('data', data => {
        buffer.push(decoder.write(data))
    })    

    req.on('end', () => {
        decoder.end()

        const choseHandler = router[trimmedPath] 
        ? router[trimmedPath]
        : router['notFound']

        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: buffer
        }

        choseHandler(data, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 200
            
            payload = typeof payload === 'object' ? payload : {}
            
            const payloadString = JSON.stringify(payload)
            
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)

            console.log('Return this response: ', statusCode, payload);
        })

    })    
})    

server.listen(config.port, () => console.log(`The server is listening on port ${config.port} in ${config.envName} mode`))


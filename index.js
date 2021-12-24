const http = require('http')
const https = require('https')
const StringDecoder = require('string_decoder').StringDecoder
const fs = require('fs')
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

const unifiedServer = (req, res) => {
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
}


const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}

const httpServer = http.createServer(unifiedServer)

const httpsServer = https.createServer(httpsServerOptions, unifiedServer)

httpServer.listen(config.httpPort, () => console.log(`The server is listening on port ${config.httpPort}`))
httpsServer.listen(config.httpsPort, () => console.log(`The server is listening on port ${config.httpsPort}`))



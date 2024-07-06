const express = require('express')
const socketIO = require('socket.io')
const http = require("http")

//initialization
const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 3000
const io = socketIO(server)

//sockets

require("./sockets")(io)


// static files
app.use(express.static('./src/public'))

// middlewares

// starting the server
server.listen(port, () => {
    console.log("server on!");
})


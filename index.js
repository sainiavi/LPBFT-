const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const mongoose = require('mongoose')
const regValidator = require('./Validators/regValidator')
const authValidator = require('./Validators/authValidator')
const checkMajority = require('./checkMajority')
const DB = require('./schema')

//Initializing the server instance of socket.io
const server_io = require('socket.io')(server, {
    cors: {origin:"*"}
})

//Declaring variables for communicating with other nodes
const { io } = require("socket.io-client");
const bs2_socket = io("ws://localhost:3002")
const bs3_socket = io("ws://localhost:3003")
const bs4_socket = io("ws://localhost:3004")
const bs5_socket = io("ws://localhost:3005")

const connection_url = "mongodb+srv://adityadabhi:adityadabhi@cluster0.giaqd.mongodb.net/serveronedb?retryWrites=true&w=majority"
mongoose.connect(connection_url,{ },()=>console.log('DB connected'))

let result_counter = 0
let temp_array = []
let current_socket_reg = ""
let current_socket_auth = ""

app.get('/', (req,res) => {
    res.send('<h1>Server 1 here</h1>')
})

const dbUpdator = async (data) => {
    const newNode = new DB({
        nodeID: data["nodeID"],
        originBS: data["BSOrigin"]
    })
    try {
        const newDB = await newNode.save()
        console.log('DB Updated')
        result_counter = 0
        temp_array = []
        if(data["BSOrigin"] === "BS1") {
            server_io.to(current_socket_reg).emit('node reg valid', "Node is Valid")
        }
        current_socket_reg = ""
    } catch(err) {
        console.log(`Error : ${err}`)
    }
}

server_io.on('connection', (socket) => {
    console.log(`${socket.id} is connected`)
    
    //Listening to node registration event
    socket.on('node reg', (data) => {
        current_socket_reg = socket.id
        regValidator(data).then((valid) => {
            if(valid == 1) {
                data["BSOrigin"] = "BS1"
                result_counter = result_counter + 1
                temp_array.push(true)
                bs2_socket.emit('node reg initial', data)
                bs3_socket.emit('node reg initial', data)
            } else if(valid == 2) {
                result_counter = 0
                temp_array = []
                server_io.to(current_socket_reg).emit('node reg valid', "Node already registered")
                current_socket_reg = ""
            } else {
                result_counter = 0
                temp_array = []
                server_io.to(current_socket_reg).emit('node reg valid', "Node is Invalid")
                current_socket_reg = ""
            }
        })
    })

    socket.on('node reg initial', (data) => {
        result_counter = result_counter + 1
        temp_array.push(true)
        regValidator(data).then((valid) => {
            result_counter = result_counter + 1
            if(valid == 1) {
                data["validity"] = true
                temp_array.push(true)
                bs2_socket.emit('node reg validity check', data)
                bs3_socket.emit('node reg validity check', data)
            } else {
                data["validity"] = false
                temp_array.push(false)
                bs2_socket.emit('node reg validity check', data)
                bs3_socket.emit('node reg validity check', data)
            }
        })
    })

    socket.on('node reg validity check', (data) => {
        result_counter = result_counter + 1
        temp_array.push(data["validity"])
        if(result_counter == 3) {
            if(checkMajority(temp_array)) {
                dbUpdator(data)
            } else {
                result_counter = 0
                temp_array = []
                server_io.to(current_socket_reg).emit('node reg valid', "Node is Invalid")
                current_socket_reg = ""
            }
        }
    })

    socket.on('node auth', (data) => {
        current_socket_auth = socket.id
        authValidator(data).then((valid) => {
            if(valid) {
                
            } else {}
        })
    })
})

server.listen(3001, () => {
    console.log('Server 1 is listening on port 3001')
})
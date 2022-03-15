const mongoose = require('mongoose')

const dbSchema = mongoose.Schema({
    nodeID: {
        type: String,
        required: true
    },
    originBS: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('nodes',dbSchema)
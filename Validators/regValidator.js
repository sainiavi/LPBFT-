const bcrypt = require('bcryptjs')
const DB = require('../schema')

const regValidator = async data => {
    const node_exists = await DB.findOne({nodeID: data["nodeID"]})
    if(node_exists) {
        return 2
    } else {
        const validPass = await bcrypt.compare(data["nodeID"],data["password"])
        if(validPass) {
            return 1
        } else {
            return 0
        }
    }
}

module.exports = regValidator
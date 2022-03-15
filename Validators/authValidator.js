const bcrypt = require('bcryptjs')
const DB = require('../schema')

const authValidator = async data => {
    const node_exists = await DB.findOne({nodeID: data["nodeID"]})
    if(node_exists) {
        if(node_exists["originBS"] === data["BSOrigin"]) {
            const validPass = await bcrypt.compare(data["nodeID"],data["password"])
            if(validPass) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    } else {
        return false
    }
}

module.exports = authValidator
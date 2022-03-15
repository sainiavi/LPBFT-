const checkMajority = data => {
    const len = data.length
    let counter = 0
    for(let i=0; i<len; i++) {
        if(data[i]) {
            counter++
        }
    }
    if(counter > 2) {
        return true
    } else {
        return false
    }
}

module.exports = checkMajority
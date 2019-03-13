function compare(customers) {
    if(process.env.CUSTOMERS.length !== customers.length) {
        return false;
    }
    for(let i=0;i<customers.length;i++) {
        if(process.env.CUSTOMERS[i]._id !== customers[i]._id) {
            return false;
        }
    }
    return true;
}

module.exports = {
    compare
}
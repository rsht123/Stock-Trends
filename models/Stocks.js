const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String
    }
})

const Stocks = module.exports = mongoose.model("Stocks", stockSchema);

module.exports.getStocks = function(callback) {
    Stocks.find(function(err, stocks) {
        if(err) throw err;
        if(!stocks) {
            
        } else {
            callback(stocks);
        }
    })
}
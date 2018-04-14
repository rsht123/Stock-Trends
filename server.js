const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Stocks = require('./models/Stocks');
const connections = [];

dotenv.config();

mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;

server.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));

app.use(express.static(path.join(__dirname, "client/build")))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/public/index.html'));
})

app.get('/stocks', (req, res, next) => {
    Stocks.find(function(err, stocks) {
        if(err) next(err);
        if(stocks.length === 0) {
            return res.json({err: "No Stocks Added"})
        }
        res.json(stocks);
    })
})

io.sockets.on('connection', (socket) => {
    connections.push(socket);
    console.log(`Connected: ${connections.length} sockets connected.`);

    socket.on('addStock', data => {
        const newStock = new Stocks({
            symbol: data.symbol,
            name: data.name
        })
        newStock.save(function(err) {
            if(err) throw err;

            Stocks.getStocks(function(stocks) {
                io.sockets.emit("newStocks", stocks);
            })
        })
    })

    socket.on('deleteStock', data => {
        Stocks.findOneAndRemove(data, function(err) {
            if(err) console.error(err);

            Stocks.getStocks(function(stocks) {
                io.sockets.emit('newStocks', stocks);
            })
        })
    })

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log(`Disconnected: ${connections.length} sockets connected.`);
    })
})
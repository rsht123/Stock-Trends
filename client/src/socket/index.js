import socketClient from 'socket.io-client';
const socket = socketClient('http://localhost:3001');

export const addStock = (stock) => {
    socket.emit('addStock', stock);
}

export const deleteStock = (stock) => {
    socket.emit('deleteStock', stock);
}

export const getStocks = (self) => {
    socket.on('newStocks', function(stocks) {
        if(!stocks.length) {
            self.setState({stocks: false, err: "No Stocks Added"});
        } else {
            self.setState({stocks, err: undefined});
        }
    })
}
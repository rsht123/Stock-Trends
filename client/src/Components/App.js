import React, { Component } from 'react';
import Stocks from './Stocks';
import Chart from './Chart';
import { addStock, deleteStock, getStocks } from '../socket';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {stocks: false, err: undefined};
        this.addStock = this.addStock.bind(this);
        this.removeStock = this.removeStock.bind(this);
        getStocks(this);
    }

    componentDidMount() {
        fetch('/stocks').then(res => res.json()).then(json => {
            if(json.err) {
                this.setState({err: json.err});
            } else {
                this.setState({stocks: json});
            }
        })
    }

    addStock(e) {
        e.preventDefault();
        e.persist();
        const newStock = e.target.children[1].value;
        const stocks = this.state.stocks;
        let sameStock;
        if(!stocks) {
            sameStock = [];
        } else {
            sameStock = stocks.filter(stock => {
                return stock.symbol === newStock.toUpperCase();
            })
        }
        if(!newStock.length) {
            this.setState({ err: "Enter a valid stock symbol" });
        } else if(stocks && sameStock.length) {
            this.setState({err: "Stock already exists"});
        } else {
            fetch(`https://api.iextrading.com/1.0/stock/${newStock}/batch?types=quote`)
            .then(res => res.text())
            .then(text => {
                if(text !== "Unknown symbol" && text !== "Not Found") {
                    const json = JSON.parse(text).quote;
                    const add = {symbol: json.symbol, name: json.companyName};
                    e.target.children[1].value = "";
                    addStock(add);
                } else {
                    this.setState({ err: "Stock not found" });
                }
            });
        }
    }

    removeStock(e) {
        const del = this.state.stocks.filter(each => {
            return each.symbol === e.target.parentElement.id;
        })
        deleteStock(del[0]);
    }

    render() {
        return (
            <div>
                <h2 className="heading">Stock Trends</h2>
                {this.state.stocks && <Chart stocks={this.state.stocks} />}
                <Stocks stocks={this.state.stocks} 
                        addStock={this.addStock} 
                        err={this.state.err} 
                        removeStock={this.removeStock}
                        />
            </div>
        );
    }
}

export default App;
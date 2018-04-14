import React from 'react';
import Stock from './Stock';

const Stocks = ({ stocks, addStock, err, removeStock }) => {
    let stockList;
    if(stocks) {
        stockList = stocks.map((stock, index) => {
            return <Stock key={stock.symbol} stock={stock} index={index} removeStock={removeStock} />
        })
    }
    return (
        <div>
            <ul className='stock-list'>
                {stocks && stockList}
            </ul>
            <form className="addStock" onSubmit={addStock} >
                <label>Syncs in realtime across clients</label>
                <input type='text' />
                <button>Add</button>
                {err && <p>{err}</p>}
            </form>
        </div>
    )
}

export default Stocks;
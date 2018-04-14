import React from 'react';
import { schemeCategory10 } from "d3";

const Stock = ({ stock, removeStock, index }) => (
    <li id={stock.symbol} className='stock' style={{backgroundColor: schemeCategory10[index % 10]}}>
        <div className='stock-info'>
            <h4 className="stock-symbol">{stock.symbol}</h4>
            <p className="stock-name">{stock.name}</p>
        </div>
        <span onClick={removeStock} className='close'>&times;</span>
    </li>
)

export default Stock;
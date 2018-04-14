import React from 'react';
import * as d3 from 'd3';

class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = { baseEndpoint: `https://api.iextrading.com/1.0/stock/market/chart/1m?symbols=insert&filter=date,close`, stocks: [] };
        this.fetchData = this.fetchData.bind(this);
    }

    componentDidMount() {
        if(this.props.stocks) {
            this.fetchData(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.stocks) {
            this.fetchData(nextProps);
        }
    }

    fetchData(props) {
        const stocks = props.stocks.map(stock => {
            return stock.symbol;
        })
        const stockStr = stocks.join(',');
        const url = this.state.baseEndpoint.replace('insert', stockStr);
        fetch(url).then(res => {
            return res.json();
        }).then(json => {
            const data = [];
            for (let i = 0; i < stocks.length; i++) {
                data.push(Object.assign({}, {symbol: stocks[i]}, {data: json[i]}));
            }
            this.drawChart(data);
        })
    }

    drawChart(data) {
        d3.select('svg').remove();
        let closeArr = [];
        for (let i = 0; i < data.length; i++) {
            closeArr = closeArr.concat(data[i].data);
        }
        const windowWidth = window.innerWidth * 75 / 100;
        const margin = {top: 50, right: 50, left: 50, bottom: 50};
        const width = windowWidth - margin.left - margin.right;
        const height = (windowWidth*4/10) - margin.top - margin.bottom;
        const svg = d3.select('#chart').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)

        const parseTime = d3.timeParse("%Y-%m-%d")
        data.forEach(d => {
            d.data.forEach(date => {
                date.date = parseTime(date.date);
            })
        });

        //Axes
        const x = d3.scaleTime()
        .domain(d3.extent(data[0].data, function(d) {return d.date}))
        .range([0, width]);

        let domain = d3.extent(closeArr, function(d) {return d.close});
        const diff = (domain[1] - domain[0]) / 10;
        const min = domain[0] - diff < 0 ? 0 : domain[0] - diff;
        domain = [min, domain[1] + diff];

        const y = d3.scaleLinear()
        .domain(domain)
        .range([height, 0]);

        const line = d3.line()
        .x(function(d) {return x(d.date)})
        .y(function(d) {return y(d.close)});

        svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .attr('class', 'xAxis axis');

        svg.append('g')
        .call(d3.axisLeft(y))
        .attr('class', 'yAxis axis');

        //Tooltip
        const tooltipG = svg.append('g')
        .attr('class', 'focus');

        tooltipG.append('path')
        .attr('class', 'mouse-line')
        .attr('zIndex', '5')
        .style('display', 'none');

        const bisectDate = d3.bisector(function(d) { return d.date }).left;
        const tooltip = svg.append('g')
            .attr('class', 'tooltip')
            .style('display', "none");

        tooltip.append('text')
        .attr('class', 'tooltip-div')
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle');

        const mousemove = () => {
            const tooltipElement = tooltipG._groups[0][0];
            const mouse = d3.mouse(tooltipElement)
            const toolData = data[1].data;
            const x0 = x.invert(mouse[0]);
            const i = bisectDate(toolData, x0, 1);
            const d0 = toolData[i - 1];
            const d1 = toolData[i];
            let d;
            if(d0 === undefined) {
                d = d1;
            } else if(d1 === undefined) {
                d = d0;
            } else {
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            }
            d3.select('.mouse-line')
            .attr('d', `M${x(d.date)},${height} ${x(d.date)},0`)
            tooltip.attr("transform", `translate(${x(d.date) + 50}, ${mouse[1] - 50})`);
            if(mouse[0] >= 750) {
                tooltip.attr('transform', `translate(${x(d.date) - 90}, ${mouse[1] - 50})`);
            }
            const formatDate = d3.timeFormat('%a, %b %d');
            const date = formatDate(d.date);
            const htmlArr = data.map((stockData, i) => {
                const symbol = stockData.symbol;
                const currObj = stockData.data.filter(curr => {
                    return date === formatDate(curr.date);
                })
                return `<tspan x='10' dy='16' fill="${d3.schemeCategory10[i % 10]}">•</tspan>
                <tspan>${symbol}: ${currObj[0].close}</tspan>`;
            })
            const html = `<tspan x='10' dy='16'>${date}</tspan>${htmlArr.join('')}`
            tooltip.select('.tooltip-div').html(html);
        }

        const mouseover = () => {
            d3.select('.mouse-line').style('display', 'block')
            tooltip.style("display", null);
        }

        const mouseout = () => {
            d3.select('.mouse-line').style('display', 'none')
            tooltip.style("display", "none")
        }

        tooltipG.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('zIndex', '-1')
        .attr('pointer-events', 'all')
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);

        for(let i = 0; i < data.length; i++) {
            const stock = data[i];
            svg.select('.focus')
            .append('g')
            .append('path')
            .data([stock.data])
            .attr('stroke', d3.schemeCategory10[i % 10])
            .attr('class', 'line')
            .attr('pointer-events', 'none')
            .attr('d', line);
        }
    }

    render() {
        return (
            <div>
                <div id='chart'></div>
                <div ref={node => this.tooltipNode = node} className='tooltip'></div>
            </div>
        )
    }
}

export default Chart;
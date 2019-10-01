import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import loadJson from '../components/load-json'
import { $ } from './util'

let d3 = Object.assign({}, d3B, d3Select);

const data =[]

const wrapperEl = $('.gv-chart-wrapper')

const isMobile = window.matchMedia('(max-width: 739px)').matches

const margin = {top: 20, right: 20, bottom: 20, left: 20}

const width = wrapperEl.getBoundingClientRect().width;

const height = isMobile ? window.innerHeight*0.50 : Math.min(500, Math.max(window.innerHeight*0.75 - 100, 350))

const parseTime = d3.timeParse("%m-%Y")

let x = d3.scaleTime().range([50, width - margin.right]);

let y = d3.scaleLinear().range([height - margin.top, 0]);

let valueline1 = d3.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.value1); })
.curve(d3.curveMonotoneX);

let valueline2 = d3.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.value2); })
.curve(d3.curveMonotoneX);

let svg = d3.select(".gv-chart-wrapper")
.append("svg")
.attr("width", width)
.attr("height", height + margin.top + margin.bottom)

let app = wrapperEl.getBoundingClientRect();
let curtain;
let texts;
let lines;
let format = isMobile ? d3.timeFormat('%y') : d3.timeFormat('%Y')

loadJson('https://interactive.guim.co.uk/docsdata-test/1Q2FlSoVF_CE5C45zjAl2xEvgQFeM-n-eC8Q2h7uuDUY.json').then(emissions => {


	emissions.sheets.data2.map(entry => data.push({date:parseTime(0 + '-' + entry.Year), value1:+entry['Total for top 20 companies'], value2:+entry['Total given for global emissions with cement']}));

	//emissions.sheets.data.map(entry => data.push({date:parseTime(entry.month + '-' + entry.year), value:+entry.average}));


	console.log(d3.extent(data, function(d) { return d.date; }))

	x.domain(d3.extent(data, function(d) { return d.date; }));
	y.domain([0, d3.max(data, function(d) { return d.value2 + 1000;})]);

	/*let dotted = svg.append('line')
	.attr("x1", x(parseTime(0 + '-' + 1977)))  //<<== change your code here
	.attr("y1", 0)
	.attr("x2", x(parseTime(0 + '-' + 1977)))  //<<== and here
	.attr("y2", height - margin.bottom)
	.attr('class', 'dottedLine')*/

	let line1 = svg.append("path")
	.data([data])
	.attr("class", "line1")
	.attr("d", valueline1)

	let line2 = svg.append("path")
	.data([data])
	.attr("class", "line2")
	.attr("d", valueline2)

	curtain = svg.append('rect')
	.attr("transform", "translate(" + margin.left + ",0)")
	.attr('height', height )
	.attr('width', width)
	.attr('class', 'curtain')

	let yaxis = svg.append("g")
	.attr("class", "y axis")
	.attr("text-anchor", "start")
	.call(d3.axisLeft(y)
		.ticks(6)
		.tickSizeInner(-width + margin.right)
	)
	.selectAll("text")
    .style("text-anchor", "start");


    let xaxis = svg.append("g")
	.attr("transform", "translate(0," + (height - margin.top) + ")")
	.attr("class", "x axis")
	.call(d3.axisBottom(x)
		.tickFormat(format)
		.ticks(d3.timeYear)
		.tickSize(0, 0)
		.tickSizeInner(5)
		.tickPadding(5));

	texts = d3.selectAll(".tick text");
	lines = d3.selectAll(".tick line");

	texts.attr("class", (d,i) => 't' + texts.nodes()[i].innerHTML);
	lines.attr("class", (d,i) => 'l' + texts.nodes()[i].innerHTML);

    

	makeTransition(2017)
})


function makeTransition(year){

	console.log(year, String(year).substr(2,4))


	let tick = isMobile ? String(year).substr(2,4) : year

	let target = d3.select('.l' + tick).node();

	if(target){

		let rect = target.getBoundingClientRect();

		curtain
		.transition()
		.ease(d3.easeSin)
		.duration(1000)
		.attr('transform', 'translate(' + ( rect.x - app.x  ) + ', 0)')

	}
}
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

let x = d3.scaleTime().range([margin.left, width - margin.right]);

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
.attr("height", height)

let app = wrapperEl.getBoundingClientRect();
let curtain;
let texts;
let lines;
let format = isMobile ? d3.timeFormat('%y') : d3.timeFormat('%Y')

loadJson('https://interactive.guim.co.uk/docsdata-test/1Q2FlSoVF_CE5C45zjAl2xEvgQFeM-n-eC8Q2h7uuDUY.json').then(emissions => {


	emissions.sheets.data2.map(entry => data.push({date:parseTime(0 + '-' + entry.Year), value1:+entry['Total for top 20 companies'] / 1000, value2:+entry['Total given for global emissions with cement'] / 1000}));

	x.domain([parseTime(0 + '-' + 1950), parseTime(12 + '-' + 2017)]);
	y.domain([0, d3.max(data, function(d) { return d.value2 + 2;})]);

	let yaxis = svg.append("g")
	.attr("class", "y axis")
	.attr("text-anchor", "start")
	.call(d3.axisLeft(y)
		.ticks(6)
		.tickSizeInner(-width)
	)
	.selectAll("text")
    .style("text-anchor", "start");

	let line1 = svg.append("path")
	.data([data])
	.attr("class", "line1")
	.attr("d", valueline1)

	let line2 = svg.append("path")
	.data([data])
	.attr("class", "line2")
	.attr("d", valueline2)

	curtain = svg.append('g').attr('class', 'curtain');

	
	curtain
	.append('rect')
	//d.attr("transform", "translate(" + margin.left + ",0)")
	.attr('height', height - margin.bottom )
	.attr('width', width)


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

	let yLines = d3.selectAll(".y.axis line").nodes()
	let yTexts = d3.selectAll(".y.axis text").nodes()


	let ticks = d3.selectAll(".y.axis .tick").nodes()

	ticks.map((line,i) => {

		curtain.append('line')
		.attr('x1', 0)
		.attr('x2', width)
		.attr('y1', 0)
		.attr('y2', 0)
		.attr('transform', "translate(0,"+ Number(d3.select(line).attr('transform').split("translate(0,")[1].split(')')[0]) +")")
		.attr('class', 'line')

	})

	texts.attr("class", (d,i) => 't' + texts.nodes()[i].innerHTML);
	lines.attr("class", (d,i) => 'l' + texts.nodes()[i].innerHTML);

	makeTransition(2017)
})


function makeTransition(year){

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
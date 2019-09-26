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

let valueline = d3.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.value); })
.curve(d3.curveMonotoneX);

let svg = d3.select(".gv-chart-wrapper")
.append("svg")
.attr("width", width)
.attr("height", height)

let app = wrapperEl.getBoundingClientRect();
let curtain;
let texts;
let lines;

loadJson('https://interactive.guim.co.uk/docsdata-test/1Q2FlSoVF_CE5C45zjAl2xEvgQFeM-n-eC8Q2h7uuDUY.json').then(emissions => {

	emissions.sheets.data.map(entry => data.push({date:parseTime(entry.month + '-' + entry.year), value:+entry.average}));

	x.domain(d3.extent(data, function(d) { return d.date; }));
	y.domain([300, d3.max(data, function(d) { return d.value; })]);

	let xaxis = svg.append("g")
	.attr("transform", "translate(0," + (height - margin.top) + ")")
	.attr("class", "x axis")
	.call(d3.axisBottom(x)
		.ticks(d3.timeYear)
		.tickSize(0, 0)
		.tickSizeInner(5)
		.tickPadding(5));

	texts = d3.selectAll(".tick text");
	lines = d3.selectAll(".tick line");

	texts.attr("class", (d,i) => 't' + texts.nodes()[i].innerHTML);
	lines.attr("class", (d,i) => 'l' + texts.nodes()[i].innerHTML);

	let line = svg.append("path")
	.data([data])
	.attr("class", "line")
	.attr("d", valueline);

	curtain = svg.append('rect')
	.attr("transform", "translate(" + margin.left + ",0)")
	.attr('height', height - margin.bottom)
	.attr('width', width)
	.style('fill', '#ffffff')

	let yaxis = svg.append("g")
	.attr("class", "y axis")
	.attr("text-anchor", "start")
	.call(d3.axisLeft(y)
		.ticks(6)
		.tickSize(0, 0)
		.tickSizeInner(-width + margin.right)
	)
	.selectAll("text")
    .style("text-anchor", "start");

   	let xticks = d3.selectAll('.x.axis g').nodes();

	makeTransition(1965)
})


function makeTransition(year){

	let target = d3.select('.l' + year).node();

	if(target){

		let rect = target.getBoundingClientRect();

		curtain
		.transition()
		.ease(d3.easeSin)
		.duration(1000)
		.attr('transform', 'translate(' + ( rect.x - app.x  )+ ', 0)')

	}
}












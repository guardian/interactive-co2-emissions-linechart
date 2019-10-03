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

let x = d3.scaleTime().range([margin.left, width]);

let y = d3.scaleLinear().range([height - margin.top, 0]);

let valueline1 = d3.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.value1); })
//.curve(d3.curveMonotoneX);

let valueline2 = d3.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.value2); })
//.curve(d3.curveMonotoneX);

let svg = d3.select(".gv-chart-wrapper")
.append("svg")
.attr("width", width)
.attr("height", height)


let linesGroup;

let app = wrapperEl.getBoundingClientRect();
let curtain;
let texts;
let lines;
let format = isMobile ? d3.timeFormat('%y') : d3.timeFormat('%Y')

loadJson('https://interactive.guim.co.uk/docsdata-test/1Q2FlSoVF_CE5C45zjAl2xEvgQFeM-n-eC8Q2h7uuDUY.json').then(emissions => {


	emissions.sheets.data2.map(entry => data.push({date:parseTime(0 + '-' + entry.Year), value1:+entry['Total for top 20 companies'] / 1000, value2:+entry['Total given for global emissions with cement'] / 1000}));

	x.domain([parseTime(0 + '-' + 1950), parseTime(12 + '-' + 2018)]);
	y.domain([0, d3.max(data, function(d) { return d.value2 + 1;})]);


	let xaxis = svg.append("g")
	.attr("transform", "translate(0," + (height - margin.top) + ")")
	.attr("class", "x axis")
	.call(d3.axisBottom(x)
		.tickFormat(format)
		.ticks(d3.timeYear)
		.tickSize(0, 0)
		.tickSizeInner(5)
		.tickPadding(5));

	let yaxis = svg.append("g")
	.attr("class", "y axis")
	.attr("text-anchor", "start")
	.call(d3.axisLeft(y)
		.ticks(6)
		.tickSizeInner(-width)
	)
	.selectAll("text")
    .style("text-anchor", "start");

    linesGroup = svg.append('g')

	let line1 = linesGroup.append("path")
	.data([data])
	.attr("class", "line1")
	.attr("d", valueline1)	

	let line2 = linesGroup.append("path")
	.data([data])
	.attr("class", "line2")
	.attr("d", valueline2)

	curtain = svg.append('g').attr('class', 'curtain');

	
	curtain
	.append('rect')
	.attr('height', height - margin.bottom )
	.attr('width', width)


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
		.attr('transform', "translate(0," + Number(d3.select(line).attr('transform').split("translate(0,")[1].split(')')[0]) +")")
		.attr('class', 'line')

	})

	texts.attr("class", (d,i) => 't' + texts.nodes()[i].innerHTML);
	lines.attr("class", (d,i) => 'l' + texts.nodes()[i].innerHTML);

	let yr = (Math.floor(Math.random() * 67) + 1) + 1950;

	//makeTransition(2018)



	var lineGraph = svg.append("path")
	.attr("class", "line1")
	  .transition()
		.duration(1000)
		.delay(1000)
	  //.duration(2000) // must pass in duration for tween function
	  .attrTween('d', tween) // call tween function with attrTween

function tween() {
  var interpolate = d3.scaleQuantile()
      .domain([0,1]) // where 0 is start of tween and 1 is end of tween
      .range(d3.range(50, 70)); // return current point and all previous points in data
  return function(t) {
    // render the line in sequence from beginning
    return valueline1(data.slice(1, 50 - interpolate(t)));
  };
}



var lineGraph2 = svg.append("path")
	.attr("class", "line2")
	  .transition()
		.duration(1000)
		.delay(1000)
	  //.duration(2000) // must pass in duration for tween function
	  .attrTween('d', tween2) // call tween function with attrTween


function tween2() {
  var interpolate = d3.scaleQuantile()
      .domain([0,1]) // where 0 is start of tween and 1 is end of tween
      .range(d3.range(1, 70)); // return current point and all previous points in data
  return function(t) {
    // render the line in sequence from beginning
    return valueline2(data.slice(1, interpolate(t)));
  };
}



	let paths = linesGroup.selectAll('path').nodes()

	for(let i = 0; i < paths.length; i++)
	{
		let truck = svg.append("circle")
		.attr("r",3)
		

		transition(truck, paths[i])
	}


})


function makeTransition(year){

	let tick = isMobile ? String(year).substr(2,4) : year

	let target = d3.select('.l' + tick).node();

	if(target){

		let rect = target.getBoundingClientRect();

		curtain
		.transition()
		.ease(d3.easeLinear)
		.duration(1000)
		.delay(2100)
		.attr('transform', 'translate(' + ( rect.x ) + ', 0)')
		//.on("end", function(){makeTransition((Math.floor(Math.random() * 67) + 1) + 1950)})

	}
}


function transition(truck, path) {

	  truck
	  .transition()
	  .ease(d3.easeLinear)
	  .duration(1000)
	  .delay(2000)
	  .attrTween("transform", translateForwards(path, path.getTotalLength()))
	  //.on('end', d => transition(truck, path))
	}


function translateForwards(path, l) {


	  //var l = path.getTotalLength();



	  return function(d, i, a) {
	    return function(t) {
	      	var p = path.getPointAtLength(t * l);
	      return "translate(" + p.x + "," + p.y + ")";
	    };
	  };
	}


function translateBackwards(path) {
	  var l = path.getTotalLength();
	  
	  return function(d, i, a) {
	    return function(t) {
	      var p = path.getPointAtLength((1-t) * l);
	      return "translate(" + p.x + "," + p.y + ")";
	    };
	  };
	}

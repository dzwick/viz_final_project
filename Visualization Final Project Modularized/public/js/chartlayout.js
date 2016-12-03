/*

  File: chartlayout.js

  Authors: Clark Barnett and Dylan Zwick

  Final Project: CS-6630 Visualization
  University of Utah
  Fall, 2016

  This file handles the creation of the bar charts.
*/

/*
  Constructor for the Data Load
*/

function ChartLayout(listLayout){
    var self = this;

    self.listLayout = listLayout;
    self.schoolSimilarityMatrix = listLayout.schoolSimilarityMatrix;
    self.nation = listLayout.nation;
    
    self.init()
}

ChartLayout.prototype.init = function(){

    var self = this;

    var metrics = ["COST","SAT_AVG_ALL","ADM_RATE_ALL","CCSIZSET"]
    
    self.margin = {top: 20, right: 20, bottom: 30, left: 100},
    self.width = 750 - self.margin.left - self.margin.right,
    self.height = 900 - self.margin.top - self.margin.bottom;

    self.y0 = d3.scaleBand()
	.rangeRound([0,self.height])
	.padding(.2)

    self.y1 = d3.scaleBand();

    self.yAxis = d3.axisLeft().scale(self.y0).tickSize(0);
    
    self.x0 = d3.scaleLinear().rangeRound([0,self.width]);
    self.x1 = d3.scaleLinear().rangeRound([0,self.width]);
    self.x2 = d3.scaleLinear().rangeRound([0,self.width]);
    self.x3 = d3.scaleLinear().rangeRound([0,self.width]);
    
    self.color = d3.scaleOrdinal()
	.domain(metrics)
	.range(["#d7191c","#fdae61","#abd9e9","#2c7bb6"]);

    self.svg = d3.select("#chart").append("svg")
	.attr("width",self.width + self.margin.left + self.margin.right)
	.attr("height",self.height + self.margin.top + self.margin.bottom)
	.append("g")
	.attr("transform",
	      "translate(" + self.margin.left + "," + self.margin.top + ")");

    self.svg.append("g")
	.attr("class","y-axis")

    
    var mapLayout = new MapLayout(self);
}

ChartLayout.prototype.drawCharts = function(schoolData){
    
    var self = this;

    var metrics = ["COST","SAT_AVG_ALL","ADM_RATE_ALL","CCSIZSET"];
    
    var schoolNames = schoolData.map(function(d){return d.INSTNM});

    schoolData.forEach(function(d){
	d.mets = metrics.map(function(met) {return {met: met, value: +d[met]}})
    });
    
    self.y0.domain(schoolNames);
    self.y1.domain(metrics)
	.rangeRound([self.y0.bandwidth(),0]);

    self.yAxis.ticks(schoolNames);

    d3.select(".y-axis")
	.call(self.yAxis)
	.selectAll(".tick text")
	.call(self.wrap, self.margin.left);
   
    var xDomains = {
	"COST":
	self.x0.domain([0,d3.max(schoolData.map(function(d){return d.COST}))]),
	"SAT_AVG_ALL":
	self.x1.domain([0,d3.max(schoolData.map(function(d){return d.SAT_AVG_ALL}))]),
	"ADM_RATE_ALL":
	self.x2.domain([0,d3.max(schoolData.map(function(d){return d.ADM_RATE_ALL}))]),
	"CCSIZSET":
	self.x3.domain([0,d3.max(schoolData.map(function(d){return d.CCSIZSET}))])
    };

    self.schoolCharts = self.svg.selectAll(".schoolChart");
    
    self.schoolCharts
	.data(schoolData)
	.exit()
	.remove();
    
    var schools = self.schoolCharts
	.data(schoolData)
	.enter().append("g")
	.merge(self.schoolCharts.data(schoolData))
	.attr("id",function(d){"BSID".concat(d.UNITID)})
	.attr("class","schoolChart")
	.attr("transform",function(d){
	    return "translate(0," + self.y0(d.INSTNM) + ")";});
    
    schools.selectAll("rect")
	.data(function(d){return d.mets; })
	.exit()
	.remove();
    
    schools.selectAll("rect")
	.data(function(d){return d.mets; })
	.enter().append("rect")
	.merge(schools.selectAll("rect").data(function(d){return d.mets; }))
	.transition()
	.duration(500)
	.attr("height", self.y1.bandwidth())
	.attr("y", function(d) {return self.y1(d.met); })
	.attr("x", function(d){ return 0; })
	.attr("width", function(d) {return xDomains[d.met](d.value); })
	.style("fill", function(d) {return self.color(d.met); });
}


ChartLayout.prototype.wrap = function(text, width) {
    var test = d3.select("#chart-contain").classed("hidden-div");
    if(test){d3.select("#chart-contain").classed("hidden-div",false)}
    text.each(function() {
	var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	while (word = words.pop()) {
	    line.push(word);
	    tspan.text(line.join(" "));
	    if (tspan.node().getComputedTextLength() > width) {
		line.pop();
		tspan.text(line.join(" "));
		line = [word];
		tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	    }
	}
    })
	if(test){d3.select("#chart-contain").classed("hidden-div",true)}
	};

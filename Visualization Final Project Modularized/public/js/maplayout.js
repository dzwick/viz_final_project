/*

  File: maplayout.js

  Authors: Clark Barnett and Dylan Zwick

  Final Project: CS-6630 Visualization
  University of Utah
  Fall, 2016

  This file handles the interactive map layout.
*/

/*
  Constructor for the MapLayout
*/

scaleFactor = 1;

function MapLayout(chartLayout){
    var self = this;

    self.chartLayout = chartLayout;
    self.listLayout = chartLayout.listLayout;
    self.nation = chartLayout.nation;
    self.schoolSimilarityMatrix = chartLayout.schoolSimilarityMatrix;
    
    self.init();
};

MapLayout.prototype.init = function(){
    var self = this;

    self.selTrans = false;
    
    self.width = 750;
    self.height = 500;

    self.svg = d3.select('#map').append('svg')
	.attr('width', self.width)
	.attr('height', self.height);
    
    self.mapFeatures = self.svg.append('g')
	.attr('class', 'features');
    
    self.mapSchools = self.svg.append('g')
	.attr('class','schools');
    
    self.mapSimilar = self.svg.append('g')
	.attr('class','similar');
    
    // We define a geographical projection
    //     https://github.com/mbostock/d3/wiki/Geo-Projections
    // and set the initial zoom to show the features.
    self.projection = d3.geoAlbersUsa()
	.translate([self.width/2,self.height/2])
	.scale(self.width*1.3);

    self.mapVoronoi = self.svg.append('g')
	.attr('class','voronoi')
	.classed('hidden-lines',true);
    
    self.zoom = d3.zoom()
	.scaleExtent([1,1000])
	.translateExtent([[0,0],
			  [self.width,self.height]])
	.on('zoom',function(){return self.zoomZoom(self)});

    self.svg.call(self.zoom).on('dblclick.zoom',null);

    //Defines the function of the "zoom reset" button.
    d3.select("#zoom-reset")
	.on('click',function(){
	    self.svg.transition().duration(750)
		.call(self.zoom.transform,d3.zoomIdentity);
	})

    // We prepare a path object and apply the projection to it.
    self.path = d3.geoPath()
	.projection(self.projection);
    
    //Draw the map
    self.mapFeatures
	.selectAll('path')
	.data(self.nation.features)
	.enter()
	.append('path')
	.attr('d', self.path);

    //Draw the schools
    self.mapSchools
	.selectAll('circle')
	.data(self.schoolSimilarityMatrix)
	.enter().append('circle')
	.attr("cx", function (d) {
	    return self.projection([d[0].LONGITUDE, d[0].LATITUDE])[0];
	})
	.attr("cy", function (d) {
	    return self.projection([d[0].LONGITUDE, d[0].LATITUDE])[1];
	})
	.attr("id",function(d) {
	    //CSID stands for Circle School ID
	    return "CSID".concat(d[0].UNITID);
	})
	.attr("r",function(){
	    return self.closeScale(this)});
    
    //Initializes the Voronoi tesselation
    self.voronoi = d3.voronoi()
	.extent([[0,0],[self.width,self.height]]);
    
    //Creates the set of school locations.
    self.schools = schoolSimilarityMatrix.map(function(d){
	return self.projection([d[0].LONGITUDE, d[0].LATITUDE])});
    
    //Creates the dataset to be used for the Voronoi tesselation.
    self.schoolDataVoronoi = self.zip([
	self.schoolSimilarityMatrix,
	self.voronoi.polygons(self.schools)]);
    
    //Creates the Voronoi tesselation in the d3 way.
    self.mapVoronoi
	.selectAll('path')
	.data(self.schoolDataVoronoi)
	.enter().append('path')
	.classed('vor',true)
	.call(self.redrawPolygon)
	.attr("id",function(d){
	    //VSID stands for Voronoi School ID
	    return "VSID".concat(d[0][0].UNITID)})
	.style('pointer-events','all')

    //Creates the checkbox for displaying (or not) the Voronoi tesselation.
    d3.select("#show-voronoi")
	.on("change",function(){
	    d3.selectAll(".voronoi").classed("hidden-lines",!this.checked);
	});

    var dataCharts = new DataCharts(self);
    
};

//Function that defines the application of the zoom feature.    
MapLayout.prototype.zoomZoom = function(){

    var self = this;
    
    var transform = d3.event.transform;
    scaleFactor = transform.k;
    
    self.mapFeatures.attr('transform',transform)
	.style('stroke-width', 0.5/scaleFactor);
    
    self.mapSchools.attr('transform',transform);
    
    self.mapVoronoi.attr('transform',transform)
	.style('stroke-width',0.5/scaleFactor);
    
    self.mapSchools.selectAll('circle')
	.attr('r',function(){return self.closeScale(this)});

    self.mapSimilar.attr('transform',transform)
	.style('stroke-width',0.5/scaleFactor);
};

//Redraws a polygon. But, you probably could have guessed that.
MapLayout.prototype.redrawPolygon = function(polygon){
    polygon
	.attr("d", function(d) {return d[1] ? "M" + d[1].join("L") + "Z" : null; });
};

//Zips two arrays. This is a built-in function in Python. Just saying.
MapLayout.prototype.zip = function(arrays){
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
};

//This function handles scaling for the circles representing
//the schools upon zoom.
MapLayout.prototype.closeScale = function(circ){
    
    var rank = 1;
    var testRank = d3.select(circ).attr("rank");
    var rBase = null;
    
    if(testRank != null){rank = testRank}
    
    if(d3.select(circ).classed('selected')){
	rBase = 12;
    } else if(d3.select(circ).classed('similar')){
	rBase = 6+2/rank;
    } else if(d3.select(circ).classed('selected-hover')){
	rBase = 6;
    } else if(d3.select(circ).classed('similar-hover')){
	rBase = 3 + 2/rank;
    } else{
	rBase = 2;
    }

    
    var rScale = Math.sqrt(scaleFactor);
    
    if (scaleFactor <= 20){
	return rBase/rScale;
    }
    else if (scaleFactor <= 40){
	return rBase/(2*rScale);
    }
    else if (scaleFactor <= 100){
	return rBase/(4*rScale);
    }
    else if (scaleFactor <= 500){
	return rBase/(8*rScale)
    }
    else {
	return rBase/(16*rScale);
    }
}



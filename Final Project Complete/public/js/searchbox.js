/*

  File: searchbox.js

  Authors: Clark Barnett and Dylan Zwick

  Final Project: CS-6630 Visualization
  University of Utah
  Fall, 2016

  This file handles the search box.
*/

/*
  Constructor for the Data Load
*/

function SearchBox(dataCharts){
    var self = this;

    self.dataCharts = dataCharts;
    self.mapLayout = dataCharts.mapLayout;
    self.listLayout = dataCharts.mapLayout.listLayout;
    self.topOfList = dataCharts.topOfList;
    
    self.init();
};

SearchBox.prototype.init = function(){

    var self = this;

    self.width = self.mapLayout.width;
    self.height = self.mapLayout.height;
    
    self.svg = self.mapLayout.svg;
    self.mapSimilar = self.mapLayout.mapSimilar;
    self.mapSchools = self.mapLayout.mapSchools;

    self.projection = self.mapLayout.projection;
    
    self.closeScale = self.mapLayout.closeScale;

    self.selTrans = self.mapLayout.selTrans;

    self.mapVoronoi = self.mapLayout.mapVoronoi;

    //Initiates the tooltip.
    self.tooltip = d3.select("#map")
	.append("div")
	.attr("class", "tooltip hidden-tooltip");
    
    //This creates the array of school names to be used by the searchbar.
    //The location (city and state) is appended to the school name, so
    //we can correctly identify a school if there are more than one
    //schools with the same name (like Westminster College).

    self.setSchoolNames(self.mapLayout.schoolSimilarityMatrix);

    /*
    self.schoolNames = self
	.dataCharts
	.mapLayout
	.schoolSimilarityMatrix
	.map(function(d,i){return {
	    label: d[0].INSTNM
		.concat(" - ")
		.concat(d[0].CITY)
		.concat(", ")
		.concat(d[0].STABBR),
	    value: d
	}})
    */
    
    //This is a jQuery function that tells the search bar
    //how to function.
    $( function() {
	$("#schoolchoice").autocomplete({
	    //This limits the number of responses to 100.
	    //Makes sure things don't slow down if the user
	    //inputs "University" or something with a lot of
	    //matches.
	    source: function(request, response){
		var results = $.ui.autocomplete
		    .filter(self.schoolNames, request.term);
		response(results.slice(0,100));
	    },
	    //Sets the minimum number of characters before
	    //matches are suggested.
	    minLength:3,
	    select: function(event, ui){
		self.hoverSimilarOff();
		if(!self.mapLayout.svg
		   .select("#CSID".concat(ui.item.value[0].UNITID))
		   .empty()){
		    self.selectSchool(ui.item.value,false);
		}
		else{
		    self.redraw(self.schoolDataStorage.concat([ui.item.value[0]])
				,self.filteredSimilarityMatrixStorage)
		    self.selectSchool(ui.item.value,false);
		    self.mapLayout.svg
			.select("#CSID".concat(ui.item.value[0].UNITID))
			.classed("selected-filtered",true);
		}
		$(this).val(''); //Clears the textbox after selection.
		return false;
	    },
	    focus: function(event,ui){
		$("#schoolchoice").val(ui.item.label);
		self.hoverSimilarOff();
		if(!self.mapLayout.svg
		   .select("#CSID".concat(ui.item.value[0].UNITID))
		   .empty()){
		    self.hoverSimilar(ui.item.value);
		}
		return false;
	    }
	});
    });

    var filterLayout = new FilterLayout(self)
};

SearchBox.prototype.setSchoolNames = function(filteredSimilarityMatrix) {

    var self = this;

    self.schoolNames = filteredSimilarityMatrix
	.map(function(d,i){return {
	    label: d[0].INSTNM
		.concat(" - ")
		.concat(d[0].CITY)
		.concat(", ")
		.concat(d[0].STABBR),
	    value: d
	}})
}

SearchBox.prototype.redraw = function(schoolData,filteredSimilarityMatrix) {

    var self = this;

    d3.select("#loading").classed("hidden-div",true);
    
    var schoolDataSimilarityMatrix = filteredSimilarityMatrix
	.filter(
	    function(d){
		if(schoolData.indexOf(d[0]) == -1){return false;}
		return true;
	    });
    
    self.setSchoolNames(filteredSimilarityMatrix);
    self.listLayout.filteredSimilarityMatrix = filteredSimilarityMatrix;
    self.mapLayout.drawSchools(schoolDataSimilarityMatrix);
    self.voronoiHover();
}

SearchBox.prototype.voronoiHover = function(){

    var self = this;

     self.mapVoronoi
	.selectAll('path')
	.on('mouseover',function(d){
	    self.hoverSimilar(d[0]);
	    self.showTooltip(d[0][0])})
	.on('mouseout',function(d){
	    self.hoverSimilarOff();
	    self.hideTooltip()})
	.on('click',function(d){
	    self.selectSchool(d[0],true);
	});
}
    

SearchBox.prototype.hoverSimilar = function(schoolData){

    var self = this;
    
    if(!d3.select('#CSID'.concat(schoolData[0].UNITID))
       .classed('selected') &&
       !d3.select('#CSID'.concat(schoolData[0].UNITID))
       .classed('similar') &&
       !d3.select('#CSID'.concat(schoolData[0].UNITID))
       .classed('selected-hover'))
    {
	
	d3.select('#CSID'.concat(schoolData[0].UNITID))
	    .classed('selected-hover',true)
	
	d3.select('#CSID'.concat(schoolData[0].UNITID))
	    .attr("r",function(){
		return self.closeScale(this)});
    }
    
    for(var i = 1; i < schoolData.length; i++){
	
	self.mapSimilar.append('line')
	    .attr("x1",self.projection([schoolData[0].LONGITUDE
					,schoolData[0].LATITUDE])[0])
	    .attr("y1",self.projection([schoolData[0].LONGITUDE
					,schoolData[0].LATITUDE])[1])
	    .attr("x2",self.projection([schoolData[i].LONGITUDE
					,schoolData[i].LATITUDE])[0])
	    .attr("y2",self.projection([schoolData[i].LONGITUDE
					,schoolData[i].LATITUDE])[1])
	    .attr("class","map-line")
	
	if(!d3.select('#CSID'.concat(schoolData[0].UNITID))
	   .classed('selected') &&
	   !d3.select('#CSID'.concat(schoolData[0].UNITID))
	   .classed('similar')){
	    d3.select('#CSID'.concat(schoolData[i].UNITID))
		.classed('similar-hover',true)
		.attr("rank",i)
		.attr("r",function(){
		    return self.closeScale(this)})
	}
    }   
}

SearchBox.prototype.hoverSimilarOff = function(){
    
    self = this;
    
    self.mapSimilar.selectAll('line').remove();
    
    self.mapSchools.selectAll('circle').classed('selected-hover',false)
	.classed('similar-hover',false);
    
    self.mapSchools.selectAll('circle').attr("r",function(){
	return self.closeScale(this)})
}

SearchBox.prototype.selectSchool =  function(selectedList,toRedraw){
    
    self = this;
    
    self.topOfList = selectedList[0];
    
    if(toRedraw){self.redraw(self.schoolDataStorage,
			     self.filteredSimilarityMatrixStorage)}
    
    if(!self.selTrans){
	
	if(!self.svg.select("#CSID".concat(selectedList[0].UNITID))
	   .classed('selected')){

	    self.selTrans = true;

	    self.svg.selectAll('circle').classed('selected',false);
	    self.svg.selectAll('circle').classed('similar',false);
	    self.svg.select('#CSID'.concat(selectedList[0].UNITID))
		.classed('selected',true);
	    for(var i=1; i < selectedList.length; i++){
		self.svg.select('#CSID'.concat(selectedList[i].UNITID))
		    .attr("rank",i)
		    .classed('similar',true);
	    }
	    
	    self.svg.selectAll('circle').transition().duration(200)
		.attr('r',function(){
		    return self.closeScale(this)})
		.on('end',function(){self.selTrans = false})
	}
    }

    self.listLayout.selectSchoolList(selectedList);

    d3.select('#selected-school-name')
	.on('mouseover', function(){
	    self.hoverSimilar(selectedList)})
	.on('mouseout', function(){
	    self.hoverSimilarOff()})
    
    d3.select('#closest-schools-list').selectAll('li')
	.on('mouseover', function(d){
	    d3.select('#LSID'.concat(d.UNITID)).classed('hover',true);
	    self.hoverSimilar(self.listLayout
			      .filteredSimilarityMatrix.filter(
		function(k){
		    return k[0].UNITID == d.UNITID}
	    )[0])})
	.on('mouseout', function(d){
	    d3.select('#LSID'.concat(d.UNITID)).classed('hover',false);
	    self.hoverSimilarOff()})
	.on('click', function(d){
	    self.selectSchool(self.listLayout
			      .filteredSimilarityMatrix.filter(
				  function(k){
				      return k[0].UNITID == d.UNITID}
			      )[0],true)})
};

SearchBox.prototype.showTooltip = function(data){
    
    var self = this;
    
    // Calculate the absolute left and top offsets of the tooltip. If the
    // mouse is close to the right border of the map, show the tooltip on
    // the left.

    var location = self.projection([data.LONGITUDE, data.LATITUDE])
    var left = Math.min(self.width/1.2-6 * data.INSTNM.length,location[0] + 5);
    var top = location[1] + self.height/(2*1.3)-15;

    self.tooltip.classed('hidden-tooltip',false)
	.attr("style", "left:" + left + "px; top:" + top + "px")
	.html(data.INSTNM)
}

/**
 * Hide the tooltip.
 */
SearchBox.prototype.hideTooltip = function(){

    var self = this;
    
    self.tooltip.classed('hidden-tooltip', true);
};

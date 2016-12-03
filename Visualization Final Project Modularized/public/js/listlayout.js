/*

  File: listlayout.js

  Authors: Clark Barnett and Dylan Zwick

  Final Project: CS-6630 Visualization
  University of Utah
  Fall, 2016

  This file handles the interactive layout for the school list.
*/

function ListLayout(nation,schoolSimilarityMatrix){

    var self = this;
    
    self.nation = nation;
    self.schoolSimilarityMatrix = schoolSimilarityMatrix;

    self.init();
};

ListLayout.prototype.init = function(){
    
    var self = this;
    
    self.template = d3.select('#template').html();
    
    Mustache.parse(self.template);

    var chartLayout = new ChartLayout(self);
};

ListLayout.prototype.selectSchoolList =
    function(selectedSchoolData){

	var self = this;
	
	//Deep copy. We don't want to alter the underlying data.
	self.formatSelectedList = $.extend({},selectedSchoolData[0]);

	//We format the metrics into a form for proper display.
	self.format = d3.format(",")
	self.formatSelectedList.COST
	    = self.format(self.formatSelectedList.COST);
	self.format = d3.format(".0f")
	self.formatSelectedList.SAT_AVG_ALL
	    = self.format(self.formatSelectedList.SAT_AVG_ALL);
	self.format = d3.format(",.2%")
	self.formatSelectedList.ADM_RATE_ALL
	    = self.format(self.formatSelectedList.ADM_RATE_ALL);

	//Provides the data to the main school data display
	//and reveals the display.
	var detailsHtml = Mustache.render(self.template,
					  self.formatSelectedList);
	d3.select('#details').html(detailsHtml);
	d3.select('#details').classed("hidden", false);

	//These next commands create the list from the provided
	//data in the usual d3 way.
	
	var listSimSchools = d3.select('#closest-schools-list')
	    .selectAll('li').data(selectedSchoolData.slice(1))
	
	listSimSchools.exit().remove();
    
	listSimSchools
	    .enter()
	    .append('li')
	    .merge(listSimSchools)
	    .attr('id',function(d){
		//LSID stands for "List School ID"
		return 'LSID'.concat(d.UNITID)})
	/*
	    .on('mouseover', function(d){
		d3.select('#LSID'.concat(d.UNITID)).classed('hover',true);
		hoverSimilar(schoolSimilarityMatrix.filter(
		    function(k){
			return k[0].UNITID == d.UNITID}
		)[0])})
	    .on('mouseout', function(d){
		d3.select('#LSID'.concat(d.UNITID)).classed('hover',false);
		hoverSimilarOff()})
	    .on('click', function(d){
		selectSchool(schoolSimilarityMatrix.filter(
		    function(k){
			return k[0].UNITID == d.UNITID}
		)[0])})
	*/
	    .text(function(d){return d.INSTNM})
    }

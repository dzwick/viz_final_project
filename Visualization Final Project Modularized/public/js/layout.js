/*

  File: layout.js

  Authors: Clark Barnett and Dylan Zwick

  Final Project: CS-6630 Visualization
  University of Utah
  Fall, 2016

  This file handles the interactive layout of the main page.
*/

/*
  Constructor for the Layout.
*/

function Layout(){
    var self = this;

    self.init();
};

/*
  Initializes all the button interactions.
*/
Layout.prototype.init = function(){
    var self = this;

    /*
      These determine the effects of the main buttons
      at the top of the main layout. 
      Essentially, they just hide all the layouts except
      the selected one.
    */
    
    d3.select("#map-button")
	.on('click',function(){
	    self.hideAll();
	    d3.select("#map-contain").classed("hidden-div",false);
	});

    d3.select("#chart-button")
	.on('click',function(){
	    self.hideAll();
	    d3.select("#chart-contain").classed("hidden-div",false);
	});

    d3.select("#filter-button")
	.on('click',function(){
	    self.hideAll();
	    d3.select("#filter-contain").classed("hidden-div",false);
	});

    d3.select("demo-button")
	.on('click',function(){
	    self.hideAll();
	    d3.select("#demo-contain").classed("hidden-div",false);
	});

    d3.select("process-button")
	.on('click',function(){
	    self.hideAll();
	    d3.select("#process-contain").classed("hidden-div",false);
	})
};

/*
  This function is used to hide all the main layout divs.
  It's called before any single layout div is displayed.
*/
Layout.prototype.hideAll = function(){
    var self = this;

    d3.select("#map-contain").classed("hidden-div",true);
    d3.select("#chart-contain").classed("hidden-div",true);
    d3.select("#filter-contain").classed("hidden-div",true);
    d3.select("#demo-contain").classed("hidden-div",true);
    d3.select("#process-contain").classed("hidden-div",true);
};

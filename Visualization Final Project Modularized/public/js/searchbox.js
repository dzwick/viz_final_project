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
    
    self.init();
};

SearchBox.prototype.init = function(){

    var self = this;

    //This creates the array of school names to be used by the searchbar.
    //The location (city and state) is appended to the school name, so
    //we can correctly identify a school if there are more than one
    //schools with the same name (like Westminster College).
    
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
		self.dataCharts.hoverSimilarOff();
		self.dataCharts.selectSchool(ui.item.value);
		$(this).val(''); //Clears the textbox after selection.
		return false;
	    },
	    focus: function(event,ui){
		$("#schoolchoice").val(ui.item.label);
		self.dataCharts.hoverSimilarOff();
		self.dataCharts.hoverSimilar(ui.item.value);
		return false;
	    }
	});
    });
};

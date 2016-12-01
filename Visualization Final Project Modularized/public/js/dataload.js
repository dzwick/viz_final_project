/*

  File: dataload.js

  Authors: Clark Barnett and Dylan Zwick

  Final Project: CS-6630 Visualization
  University of Utah
  Fall, 2016

  This file handles the loading of the data from the data folder.
*/

/*
  Constructor for the Data Load
*/

function DataLoad(){
    var self=this;

    self.init();
};

/*
  Loads the data, and initializes the data driven layouts.
*/

DataLoad.prototype.init = function(){
    
    var self = this;

    //This is temporary. The final function will accept
    //a filter, and return the appropriate file.

    d3.json('data/us-states.json', function(error, nation) {
	d3.csv("data/School_Data.csv", function (data1) {
            var schoolData = data1;
	    schoolData = schoolData.filter(function(d){
		return d.LONGITUDE != ""
		    && d.LATITUDE != ""
		    && d.STABBR != "GU"
		    && d.STABBR != "PR"
		    && d.STABBR != "VI"});
	    
	    d3.csv("data/similarity_rankings.csv", function (data2) {
		var schoolMatrix = data2;
		schoolSimilarityMatrix = [];
		
		//Ain't nothing efficient about this.
		
		for(var i = 0; i < schoolMatrix.length; i++){
		    var similarSchools = [];
		    for(var o in schoolMatrix[i]){
			similarSchools.push(schoolMatrix[i][o]);
		    }
		    var similarSchoolsData = [];
		    for(var j = 0; j < similarSchools.length; j++){
			similarSchoolsData.push(
			    schoolData.filter(function(d){
				return d.UNITID == similarSchools[j]})[0]
			);
		    }
		    schoolSimilarityMatrix.push(similarSchoolsData);
		}
		
		schoolSimilarityMatrix = schoolSimilarityMatrix.filter(function(d){
		    return d[0] != undefined
			&& d[0].LONGITUDE != ""
			&& d[0].LATITUDE != ""
			&& d[0].STABBR != "GU"
			&& d[0].STABBR != "PR"
			&& d[0].STABBR != "VI"});
		
		for(var i = 0; i < schoolSimilarityMatrix.length; i++){
		    schoolSimilarityMatrix[i] = schoolSimilarityMatrix[i]
			.filter(function(d){
			    return d != undefined
				&& d.LONGITUDE != ""
				&& d.LATITUDE != ""
				&& d.STABBR != "GU"
				&& d.STABBR != "PR"
				&& d.STABBR != "VI"});
		}

		var listLayout = new ListLayout(nation,schoolSimilarityMatrix);
	    })
	})
    })
};
	     
	    

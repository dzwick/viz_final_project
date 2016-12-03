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
    
    console.log('1')
    
    d3.json('data/us-states.json', function(error, nation) {
	d3.csv("data/School_Data.csv", function (data1) {
            var schoolData = data1;
	    schoolData = schoolData.filter(function(d){
		return d.LONGITUDE != ""
		    && d.LATITUDE != ""
		    && d.STABBR != "GU"
		    && d.STABBR != "PR"
		    && d.STABBR != "VI"});
	    
	    console.log('2')
	    //d3.csv("data/similarity_rankings.csv", function (data2) {
	    d3.csv("data/bigData/similarity_rankings_fullList.csv", function (data2) {
		//d3.csv("data/similarity_rankings_top30.csv", function (data2) {
		d3.csv("data/state_abbr_lookup.csv", function (data3) {
		    var schoolMatrix = data2;
		    var stateLookup = data3
		    // schoolSimilarityMatrix = [];
		    
		    // // //Ain't nothing efficient about this.
		    // for(var i = 0; i < schoolMatrix.length; i++){
		    //     var similarSchools = [];
		    //     for(var o in schoolMatrix[i]){
		    // 	similarSchools.push(schoolMatrix[i][o]);
		    //     }
		    //     var similarSchoolsData = [];
		    //     for(var j = 0; j < similarSchools.length; j++){
		    // 	similarSchoolsData.push(
		    // 	    schoolData.filter(function(d){
		    // 		return d.UNITID == similarSchools[j]})[0]
		    // 	);
		    //     }
		    //     schoolSimilarityMatrix.push(similarSchoolsData);
		    // }
		    
		    var schoolDataObject = {}
		    var schoolSimilarityMatrix = []
		    
		    console.log('3')
		    
		    schoolData.forEach(function (d,i) {
		        schoolDataObject[schoolData[i]['UNITID']] = schoolData[i]
		    })
		    
		    console.log('4')
		    
		    for (schoolIndex in schoolMatrix) {
		        schoolRow = []
		        schoolRow.push(schoolDataObject[schoolMatrix[schoolIndex]['UNITID']])
		        for (i=1; i<= schoolMatrix.length; i++) {
		            schoolRow.push(schoolDataObject[schoolMatrix[schoolIndex]['Similar School ' + i]])
		        }
		        
		        schoolSimilarityMatrix.push(schoolRow)
		    }
		    
		    console.log('5')
		    
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
		    
		    schoolSimilarityObj = {}
		    
		    for (var row in schoolMatrix) {
			var similarSchools = []
			for (i=1; i<= schoolMatrix.length; i++) {
                	    if (schoolMatrix[row]['Similar School ' + i] in schoolDataObject) {
                    		similarSchools.push(schoolMatrix[row]['Similar School ' + i])
			    }
			}
			if (schoolMatrix[row]['UNITID'] in schoolDataObject) {
                	    schoolSimilarityObj[schoolMatrix[row]['UNITID']] = similarSchools
			}
		    }
		    
		    console.log('6');
		    var listLayout = new ListLayout(nation, schoolSimilarityMatrix, schoolData, stateLookup, schoolSimilarityObj);
		    
		    
		})
	    })
	})
    })
};

	    

/*
 * Root file that handles instances of all the charts and loads the visualization
 */
(function(){
    var instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        self = this;
	
        d3.csv("data/School_Data.csv", function (data1) {
            schoolData = data1;
	    d3.csv("data/similarity_rankings.csv", function (data2) {
		var schoolMatrix = data2;
		schoolSimilarityMatrix = [];
		for(var i = 0; i < schoolMatrix.length; i++){
		    var similarSchools = $.map(schoolMatrix[i],
					       function(d,i){return[d]});
		    var similarSchoolsData = [];
		    for(var j = 0; j < similarSchools.length; j++){
			similarSchoolsData.push(
			    schoolData.filter(function(d){
				return d.UNITID == similarSchools[j]})[0]
			);
		    }
		    schoolSimilarityMatrix.push(similarSchoolsData);
		}
		var schoolMap = new SchoolMap();
		var script = new Script(schoolMap);
	    });
        });
    }
    
    /**
     *
     * @constructor
     */
    function Main(){
        if(instance  !== null){
            throw new Error("Cannot instantiate more than one Class");
        }
    }
    
    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function(){
        var self = this
        if(self.instance == null){
            self.instance = new Main();
	    
            //called only once when the class is initialized
            init();
        }
        return instance;
    }
    
    Main.getInstance();
})();

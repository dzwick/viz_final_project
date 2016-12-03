/*
 * 
 * File: main.js
 *
 * Authors: Clark Barnett and Dylan Zwick
 * 
 * Final Project : CS-6630 Visualization
 * University of Utah
 * Fall, 2016
 *
 * Root file that handles instances of all the charts and loads the visualization
 */
(function(){
    var instance = null;
    
    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
	
	var layout = new Layout();
	var data = new DataLoad();
	//var filter = new Filter();
	//var demo = new Demo();
	//var processBook = new ProcessBook();
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
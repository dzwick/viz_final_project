/*
 * 
 * File: main.js
 *
 * Authors: Dylan Zwick and Clark Barnett
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
        self = this;
	
	var layout = new Layout();
	var data = new Data();
	var filter = new Filter();
	var demo = new Demo();
	var processBook = new ProcessBook();
	
    });
 
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

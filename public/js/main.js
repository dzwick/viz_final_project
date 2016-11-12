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
        //Creating instances for each visualization
        // var barChart = new BarChart();

        // var tileChart = new TileChart();

        // var shiftChart = new ShiftChart();

        // var electoralVoteChart = new ElectoralVoteChart(shiftChart);

        var barChart = new BarChart();

        //load the data corresponding to all the election years
        //pass this data and instances of all the charts that update on year selection to yearChart's constructor
        d3.csv("data/School_Data.csv", function (data) {
            //pass the instances of all the charts that update on selection change in YearChart
            schoolData = data;
            var script = new Script(barChart, schoolData);
            var sliderLayout = new SliderLayout(barChart, schoolData);
            console.log('sliderLayoutUpdate')
            sliderLayout.update()
        });

    //     d3.csv('data/Year_Timeline_2012.csv', function (error, csv) {
    //     var electionYearData = csv;
    //     var electoralVoteChart = new ElectoralVoteChart(shiftChart);
    //     electoralVoteChart.update(electionYearData)
    //     votePercentageChart.update(electionYearData)
    // })
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
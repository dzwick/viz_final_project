/**
 * Constructor for the Bar Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function SliderLayout(barChart, schoolData) {
    var self = this;

    self.barChart = barChart
    self.schoolData = schoolData
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
SliderLayout.prototype.init = function(){
    var self = this;
    self.tuitionBrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['COST']}),
                                    d3.max(self.schoolData, function (d) {return +d['COST']})]
    self.sizeBrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['CCSIZSET']}),
                                    d3.max(self.schoolData, function (d) {return +d['CCSIZSET']})]
    self.SAT_BrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['SAT_AVG_ALL']}),
                                    d3.max(self.schoolData, function (d) {return +d['SAT_AVG_ALL']})]
    self.admRateBrushCoordinates = [d3.min(self.schoolData, function (d) {return +d['ADM_RATE_ALL']}),
                                    d3.max(self.schoolData, function (d) {return +d['ADM_RATE_ALL']})]
    self.selectedSchools = []
    console.log(self.sizeBrushCoordinates)
    self.margin = {top: 10, right: 20, bottom: 30, left: 20};
    var divSliderLayout = d3.select("#sliderLayout").classed("view", true);

    // //Gets access to the div element created for this chart from HTML
    self.svgBounds = divSliderLayout.node().getBoundingClientRect();
    self.svgWidth = 500 //self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 300 //self.svgBounds.height;
    self.sliderWidth = self.svgWidth - self.margin.left - self.margin.right
    self.sliderHeight = 10
    self.sliderSpacing = 75
    self.firstSliderPosition = 40
    self.firstTextPosition = 30

    //creates svg element within the div
    self.svg = divSliderLayout
        .append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)

};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */

SliderLayout.prototype.update = function () { //function(selectedDimension){
    var self = this;

    console.log(self.schoolData)

    var tuitionScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d['COST'];
        })])
        .range([0, self.sliderWidth]);

    var sizeScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d['CCSIZSET'];
        })])
        .range([0, self.sliderWidth]);

    var SAT_Scale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d['SAT_AVG_ALL'];
        })])
        .range([0, self.sliderWidth]);

    var admRateScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d['ADM_RATE_ALL'];
        })])
        .range([0, self.sliderWidth]);

    var tuitionSliderGroup = self.svg
        .append('g')
        .attr('id', 'tuitionSlider')

    self.svg
        .append('text')
        .text('What tuition range are you interested in?')
        .attr('y', self.firstTextPosition + self.sliderSpacing*0)
        .attr('x', self.margin.left)

    self.svg
        .append('text')
        .text('What school size range are you interested in?')
        .attr('y', self.firstTextPosition + self.sliderSpacing*1)
        .attr('x', self.margin.left)

    self.svg
        .append('text')
        .text('What SAT range are you interested in?')
        .attr('y', self.firstTextPosition + self.sliderSpacing*2)
        .attr('x', self.margin.left)

    self.svg
        .append('text')
        .text('What admission rate range are you interested in?')
        .attr('y', self.firstTextPosition + self.sliderSpacing*3)
        .attr('x', self.margin.left)

    tuitionSliderGroup
        .append('rect')
        .attr('id', 'tuitionBar')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)
        .attr('x', self.margin.left)
        .attr('y', self.firstSliderPosition + self.sliderSpacing*0)

    var sizeSliderGroup = self.svg
        .append('g')
        .attr('id', 'sizeSlider')

    sizeSliderGroup
        .append('rect')
        .attr('id', 'sizeBar')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)
        .attr('x', self.margin.left)
        .attr('y', self.firstSliderPosition + self.sliderSpacing*1)

    var SAT_SliderGroup = self.svg
        .append('g')
        .attr('id', 'SAT_Slider')

    SAT_SliderGroup
        .append('rect')
        .attr('id', 'SAT_Bar')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)
        .attr('x', self.margin.left)
        .attr('y', self.firstSliderPosition + self.sliderSpacing*2)

    var admRateSliderGroup = self.svg
        .append('g')
        .attr('id', 'admRateSlider')

    admRateSliderGroup
        .append('rect')
        .attr('id', 'admRateBar')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)
        .attr('x', self.margin.left)
        .attr('y', self.firstSliderPosition + self.sliderSpacing*3)

    // create a new Slider that has the ticks and labels on the bottom
    var tuitionAxis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(tuitionScale)

    tuitionSliderGroup
        .append('g')
        .attr("transform", "translate(" + self.margin.left + "," + (self.firstSliderPosition + self.sliderHeight + self.sliderSpacing*0) + ")")
        .call(tuitionAxis)

    // create a new Slider that has the ticks and labels on the bottom
    var sizeAxis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(sizeScale)

    sizeSliderGroup
        .append('g')
        .attr("transform", "translate(" + self.margin.left + "," + (self.firstSliderPosition + self.sliderHeight + self.sliderSpacing*1) + ")")
        .call(sizeAxis)

    // create a new Slider that has the ticks and labels on the bottom
    var SAT_Axis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(SAT_Scale)

    SAT_SliderGroup
        .append('g')
        .attr("transform", "translate(" + self.margin.left + "," + (self.firstSliderPosition + self.sliderHeight + self.sliderSpacing*2) + ")")
        .call(SAT_Axis)

    // create a new Slider that has the ticks and labels on the bottom
    var admRateAxis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(admRateScale)

    admRateSliderGroup
        .append('g')
        .attr("transform", "translate(" + self.margin.left + "," + (self.firstSliderPosition + self.sliderHeight + self.sliderSpacing*3) + ")")
        .call(admRateAxis)

    var tuitionBrush = d3.brushX().extent([[self.margin.left,self.firstSliderPosition + self.sliderSpacing*0],[self.svgWidth - self.margin.right,self.firstSliderPosition + self.sliderSpacing*0 + self.sliderHeight + 1]])

    tuitionSliderGroup.append("g").attr("class", "brush").call(tuitionBrush);

    tuitionBrush
        .on("end", function(d){ self.tuitionBrushed(d)})

    var sizeBrush = d3.brushX().extent([[self.margin.left,self.firstSliderPosition + self.sliderSpacing*1],[self.svgWidth - self.margin.right,self.firstSliderPosition + self.sliderSpacing*1 + self.sliderHeight + 1]])

    sizeSliderGroup.append("g").attr("class", "brush").call(sizeBrush);

    sizeBrush
        .on("end", function(d){ self.sizeBrushed(d)})

    var SAT_Brush = d3.brushX().extent([[self.margin.left,self.firstSliderPosition + self.sliderSpacing*2],[self.svgWidth - self.margin.right,self.firstSliderPosition + self.sliderSpacing*2 + self.sliderHeight + 1]])

    SAT_SliderGroup.append("g").attr("class", "brush").call(SAT_Brush);

    SAT_Brush
        .on("end", function(d){ self.SAT_Brushed(d)})

    var admRateBrush = d3.brushX().extent([[self.margin.left,self.firstSliderPosition + self.sliderSpacing*3],[self.svgWidth - self.margin.right,self.firstSliderPosition + self.sliderSpacing*3 +self.sliderHeight + 1]])

    admRateSliderGroup.append("g").attr("class", "brush").call(admRateBrush);

    admRateBrush
        .on("end", function(d){ self.admRateBrushed(d)})
}

SliderLayout.prototype.tuitionBrushed = function(d) {
    var self = this;

    var reverseTuitionScale = d3.scaleLinear()
    .domain([self.margin.left, self.svgWidth - self.margin.right])
    .range([0, d3.max(self.schoolData, function (d) {
            return +d['COST'];
        })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.tuitionBrushCoordinates[index] = reverseTuitionScale(coordinate);
    });

    console.log(self.tuitionBrushCoordinates)
    self.selectData()
};

SliderLayout.prototype.sizeBrushed = function(d) {
    var self = this;

    var reverseSizeScale = d3.scaleLinear()
    .domain([self.margin.left, self.svgWidth - self.margin.right])
    .range([0, d3.max(self.schoolData, function (d) {
            return +d['CCSIZSET'];
        })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.sizeBrushCoordinates[index] = reverseSizeScale(coordinate);
    });
    
    console.log(self.sizeBrushCoordinates)
    self.selectData()
};

SliderLayout.prototype.SAT_Brushed = function(d) {
    var self = this;

    var reverseSAT_Scale = d3.scaleLinear()
    .domain([self.margin.left, self.svgWidth - self.margin.right])
    .range([0, d3.max(self.schoolData, function (d) {
            return +d['SAT_AVG_ALL'];
        })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.SAT_BrushCoordinates[index] = reverseSAT_Scale(coordinate);
    });
    
    console.log(self.SAT_BrushCoordinates)
    self.selectData()
};

SliderLayout.prototype.admRateBrushed = function(d) {
    var self = this;

    var reverseAdmRateScale = d3.scaleLinear()
    .domain([self.margin.left, self.svgWidth - self.margin.right])
    .range([0, d3.max(self.schoolData, function (d) {
            return +d['ADM_RATE_ALL'];
        })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.admRateBrushCoordinates[index] = reverseAdmRateScale(coordinate);
    });
    
    console.log(self.admRateBrushCoordinates)
    self.selectData()
};

SliderLayout.prototype.selectData = function(d) {
    var self = this;

    self.selectedSchools = self.schoolData.filter(function (d) {
            return (
                d['COST'] >= self.tuitionBrushCoordinates[0] &
                d['COST'] <= self.tuitionBrushCoordinates[1] &
                d['CCSIZSET'] >= self.sizeBrushCoordinates[0] &
                d['CCSIZSET'] <= self.sizeBrushCoordinates[1] &
                d['SAT_AVG_ALL'] >= self.SAT_BrushCoordinates[0] &
                d['SAT_AVG_ALL'] <= self.SAT_BrushCoordinates[1] &
                d['ADM_RATE_ALL'] >= self.admRateBrushCoordinates[0] &
                d['ADM_RATE_ALL'] <= self.admRateBrushCoordinates[1]
            )
        });

    self.barChart.updateData(self.selectedSchools)
};
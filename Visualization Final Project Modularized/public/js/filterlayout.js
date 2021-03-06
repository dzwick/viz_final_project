/**
 * Constructor for the Bar Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function FilterLayout(searchBox) {
//function FilterPanel(schoolData, nation, schoolSimilarityMatrix, states) {
    var self = this;
    self.searchBox = searchBox
    self.schoolData = searchBox.dataCharts.mapLayout.listLayout.schoolData
    self.nation = searchBox.dataCharts.mapLayout.listLayout.nation
    self.schoolSimilarityMatrix = searchBox.dataCharts.mapLayout.listLayout.schoolSimilarityMatrix
    self.stateLookup = searchBox.dataCharts.mapLayout.listLayout.stateLookup
    self.schoolSimilarityObj = searchBox.dataCharts.mapLayout.listLayout.schoolSimilarityObj
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
FilterLayout.prototype.init = function(){
    var self = this;

    self.width = 600;
    self.height = 400;

    self.svg = d3.select('#filter').append('svg')
        .attr('width', self.width)
        .attr('height', self.height)
        .attr('id','filterPanelSVG')

    self.filterOptionsData = [
        {'filter':'COST'}
        ,{'filter':'ADM_RATE_ALL'}
        ,{'filter':'CCSIZSET'}
        ,{'filter':'SAT_AVG_ALL'}
        ,{'filter':'State'}
    ]

    // self.filterOptionsData = [
    //     {'filter':'Tuition'}
    //     ,{'filter':'Admission Rate'}
    //     ,{'filter':'Size'}
    //     ,{'filter':'Average SAT'}
    //     ,{'filter':'State'}
    // ]
    
    self.brushCoordinatesScaled = {}
    self.brushCoordinatesActual = {}

    console.log(self.schoolData);
    
    schoolCountByState = d3.nest()
        .key(function (d) {
            return d.STABBR;
        })
        .rollup(function (leaves) {
            return {
                'schoolCount': d3.sum(leaves,function(d){return 1}),
            }
        })
    .entries(self.schoolData); 

    self.schoolCountByStateObj = {}

    schoolCountByState.forEach(function (d) {
        self.schoolCountByStateObj[d.key] = d.value.schoolCount
    })

    for (i = 0; i < self.filterOptionsData.length - 1; i++) {
        var coordinates = []
        coordinates[0] = 0 //d3.min(self.schoolData, function (d) {return +d[self.filterOptionsData[i]['filter']]})
        coordinates[1] = d3.max(self.schoolData, function (d) {return +d[self.filterOptionsData[i]['filter']]})
        self.brushCoordinatesScaled[self.filterOptionsData[i]['filter']] = coordinates
    }

    for (i = 0; i < self.filterOptionsData.length - 1; i++) {
        var coordinates = []
        coordinates[0] = 0 //d3.min(self.schoolData, function (d) {return +d[self.filterOptionsData[i]['filter']]})
        coordinates[1] = 0
        self.brushCoordinatesActual[self.filterOptionsData[i]['filter']] = coordinates
    }

    self.selectedSchools = self.schoolData
    self.selectedSchoolsObj = {}
    self.selectData()

    self.histogram_arr = {}
    self.totBins = {}
    self.selectedBins = {}

    self.margin = {top: 30, right: 30, bottom: 30, left: 30};

    self.stateLookupObj = {}

    self.stateLookup.forEach(function (d,i) {
        self.stateLookupObj[self.stateLookup[i]['State']] = self.stateLookup[i]['Abbreviation']
    })

    // //Gets access to the div element created for this chart from HTML
    self.svgWidth = self.width-2;
    self.svgHeight = self.height-2;
    self.firstTextPosition = 30
    self.mapWidth = 300
    self.mapHeight = 200
    self.optionsPanel_posX = self.svgWidth*(4/5) - self.margin.right
    self.optionsPanel_posY = self.svgHeight/5
    self.optionsPanelWidth = self.svgWidth/5
    self.optionsPanelHeight = self.svgHeight/2
    self.optionsWidth = self.svgWidth/6
    self.optionsHeight = 30
    self.options_posX = self.optionsPanel_posX + (self.optionsPanelWidth - self.optionsWidth)/2
    self.options_posY_start = self.optionsPanel_posY + 40
    self.optionsText_posX = self.options_posX + self.optionsWidth/2
    self.optionsText_posY_start = self.options_posY_start
    self.buttonHeight = 30
    self.buttonWidth = self.svgWidth/7
    self.ApplyButton_posX = self.svgWidth - self.margin.right - self.buttonWidth
    self.ApplyButton_posY = self.svgHeight - self.margin.bottom - self.buttonHeight
    self.CancelButton_posX = self.svgWidth - self.margin.right*2 - self.buttonWidth*2
    self.CancelButton_posY = self.svgHeight - self.margin.bottom - self.buttonHeight
    self.filterWidth = self.optionsPanel_posX - 2
    self.filterPanelHeight = self.ApplyButton_posY - 60
    self.filterDiv_posX = 300
    self.filterDiv_posY = 100
    self.filterPanelsDiv_posX = self.filterDiv_posX + 1
    self.filterPanelsDiv_posY = self.filterDiv_posY + 1
    self.sliderWidth = self.svgWidth - self.margin.left - self.margin.right
    self.sliderHeight = 35
    self.slider_posX = self.margin.left
    self.slider_posY = self.filterPanelHeight*(3/4)
    self.axis_posX = self.slider_posX
    self.axis_posY = self.slider_posY + self.sliderHeight
    self.brush_posX1 = 0
    self.brush_posX2 = self.sliderWidth
    self.brush_posY1 = 0
    self.brush_posY2 = self.sliderHeight
    self.freqDistGroup_posX = self.slider_posX
    self.freqDistGroup_posY = self.slider_posY - 10
    self.freqDistGroupHeight = self.freqDistGroup_posY - self.margin.top
    self.freqDistGroupWidth = self.sliderWidth
    self.ticksCount = 10
    self.selectedSchoolCountContainerWidth = 80
    self.selectedSchoolCountContainerHeight = 60
    self.selectedSchoolCountContainer_posX = self.margin.left
    self.selectedSchoolCountContainer_posY = self.svgHeight - self.margin.bottom - self.selectedSchoolCountContainerHeight
    self.similarSchoolCount = 15
    self.filterWidth = 600
    self.filterHeight = 400
    self.selectAllStatesButton_posX = self.filterWidth/3
    self.selectAllStatesButton_posY = self.filterHeight - self.filterHeight/5
    self.clearAllStatesButton_posX = self.filterWidth*(2/3)
    self.clearAllStatesButton_posY = self.filterHeight - self.filterHeight/5

    d3.select('#cost-button')
        .on('click', function (d) {self.updateSlider(self.filterOptionsData[0]['filter'])})
    d3.select('#SAT-button')
        .on('click', function (d) {self.updateSlider(self.filterOptionsData[3]['filter'])})
    d3.select('#adm-button')
        .on('click', function (d) {self.updateSlider(self.filterOptionsData[1]['filter'])})
    d3.select('#size-button')
        .on('click', function (d) {self.updateSlider(self.filterOptionsData[2]['filter'])})
    d3.select('#location-button')
        .on('click', function (d) {self.updateMap()})

    self.filterPanels = d3.select('#filter-contain').selectAll('.FilterDiv').data(self.filterOptionsData)
        .enter()
        .append('div')
        .classed('FilterDiv', true)
        .attr('id', function (d) {return d.filter + 'FilterDiv'})
        .style('position', 'absolute')
        //.style('background-color', 'white')
        .style('border-radius', '15px')
        .style('z-index',1)
        .style('opacity', 1)

    self.filterPanels
        .filter(function (d) {return d.filter == self.filterOptionsData[0]['filter']})
        .style('z-index',5)

    self.FilterSVG = self.filterPanels
        .append('svg')
        .attr('id', function (d) {return d.filter + 'FilterSVG'})
        .attr('class','FilterSVG')
        .attr('width', self.svgWidth)
        .attr('height', self.svgHeight)   

    self.drawMap()

    for (i = 0; i < self.filterOptionsData.length - 1; i++) {
        self.drawSlider(self.filterOptionsData[i]['filter'])
    }

    d3.select("#apply-button")
        .on('click', function (d) {self.applyFilters()})

    d3.select('#reset-button')
        .on('click', function (d) {
            d3.selectAll('.FilterDiv').remove()
            d3.select('#filter').select('svg').remove()
            self.init()
        })

    self.selectedSchoolCount = self.svg
        .append('rect')
        .attr('stroke', 'black')
        .attr('stroke-width', 5)
        .attr('height',self.selectedSchoolCountContainerHeight)
        .attr('width',self.selectedSchoolCountContainerWidth)
        .attr('fill', 'red')
        .attr('x', self.selectedSchoolCountContainer_posX)
        .attr('y', self.selectedSchoolCountContainer_posY)  

    self.selectedSchoolCountText = self.svg
        .append('text')
        .attr('id','selectedSchoolCountText')
        .text(self.schoolData.length)
        .attr('x', self.selectedSchoolCountContainer_posX + self.selectedSchoolCountContainerWidth/2)
        .attr('y', self.selectedSchoolCountContainer_posY + self.selectedSchoolCountContainerHeight/2) 
        .attr('fill', 'black')
        .attr('font-size',25)
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central") 

    self.updateSlider(self.filterOptionsData[0]['filter'])
};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */

FilterLayout.prototype.update = function () {
    var self = this;
    
    d3.select('#selectedSchoolCountText')
        .text(self.selectedSchools.length)

}

FilterLayout.prototype.brushed = function(filterName) {
    var self = this;

    self.selectData()

    var slider_xScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d[filterName];
        })])
        .range([0, self.sliderWidth]);

    var FilterSVG = d3.selectAll('.FilterSVG')
        .filter(function (d) {
            return this.id == filterName + 'FilterSVG'
        })

    var histogram_arr = []

    self.selectedSchoolsObj[filterName].forEach(function (d) {histogram_arr.push(d[filterName])})

    self.histogram_arr[filterName] = histogram_arr

    histogram_arr = self.histogram_arr[filterName].sort(d3.ascending)

    var histogram = d3.histogram()
        .domain(slider_xScale.domain())
        .thresholds(slider_xScale.ticks(self.ticksCount))
      
    self.selectedBins[filterName] = histogram(histogram_arr)

    var reverseScale = d3.scaleLinear()
        .domain([self.brush_posX1, self.brush_posX2])
        .range([0, d3.max(self.schoolData, function (d) {
                return +d[filterName];
            })])

    d3.event.selection.forEach(function(coordinate, index) {
        self.brushCoordinatesScaled[filterName][index] = reverseScale(coordinate);
        self.brushCoordinatesActual[filterName][index] = coordinate;
    });

    self.updateSlider(filterName)
};

FilterLayout.prototype.selectData = function(d) {
    var self = this;

    var selectedStates = d3.select('#thisMap').selectAll('.stateSelected').data()

    var selectedStatesObj = {}

    selectedStates.forEach(function (d,i) {
        selectedStatesObj[self.stateLookupObj[selectedStates[i]['properties']['name']]] = selectedStates[i]['properties']['name']
    })

    self.selectedSchools = self.schoolData.filter(function (d) {
            return (
                d[self.filterOptionsData[0]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[0]['filter']][0] &
                d[self.filterOptionsData[0]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[0]['filter']][1] &
                d[self.filterOptionsData[1]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[1]['filter']][0] &
                d[self.filterOptionsData[1]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[1]['filter']][1] &
                d[self.filterOptionsData[2]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[2]['filter']][0] &
                d[self.filterOptionsData[2]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[2]['filter']][1] &
                d[self.filterOptionsData[3]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[3]['filter']][0] &
                d[self.filterOptionsData[3]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[3]['filter']][1] &
                d['STABBR'] in selectedStatesObj
            )
        });


    for (i=0; i<=3; i++) {
        self.selectedSchoolsObj[self.filterOptionsData[i]['filter']] = self.schoolData.filter(function (d) {
            if (i==0) {
                return (
                    d[self.filterOptionsData[1]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[1]['filter']][0] &
                    d[self.filterOptionsData[1]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[1]['filter']][1] &
                    d[self.filterOptionsData[2]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[2]['filter']][0] &
                    d[self.filterOptionsData[2]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[2]['filter']][1] &
                    d[self.filterOptionsData[3]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[3]['filter']][0] &
                    d[self.filterOptionsData[3]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[3]['filter']][1] &
                    d['STABBR'] in selectedStatesObj
                )
            }
            if (i==1) {
                 return (
                    d[self.filterOptionsData[0]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[0]['filter']][0] &
                    d[self.filterOptionsData[0]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[0]['filter']][1] &
                    d[self.filterOptionsData[2]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[2]['filter']][0] &
                    d[self.filterOptionsData[2]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[2]['filter']][1] &
                    d[self.filterOptionsData[3]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[3]['filter']][0] &
                    d[self.filterOptionsData[3]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[3]['filter']][1] &
                    d['STABBR'] in selectedStatesObj
                )               
            }
            if (i==2) {
                return (
                    d[self.filterOptionsData[0]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[0]['filter']][0] &
                    d[self.filterOptionsData[0]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[0]['filter']][1] &
                    d[self.filterOptionsData[1]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[1]['filter']][0] &
                    d[self.filterOptionsData[1]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[1]['filter']][1] &
                    d[self.filterOptionsData[3]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[3]['filter']][0] &
                    d[self.filterOptionsData[3]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[3]['filter']][1] &
                    d['STABBR'] in selectedStatesObj
                )
            }
            else {
                return (
                    d[self.filterOptionsData[0]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[0]['filter']][0] &
                    d[self.filterOptionsData[0]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[0]['filter']][1] &
                    d[self.filterOptionsData[1]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[1]['filter']][0] &
                    d[self.filterOptionsData[1]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[1]['filter']][1] &
                    d[self.filterOptionsData[2]['filter']] >= self.brushCoordinatesScaled[self.filterOptionsData[2]['filter']][0] &
                    d[self.filterOptionsData[2]['filter']] <= self.brushCoordinatesScaled[self.filterOptionsData[2]['filter']][1] &
                    d['STABBR'] in selectedStatesObj
                )
            }
        });
    }

    self.update()

}

FilterLayout.prototype.drawMap = function () {
    var self = this;

    var mapGroup = d3.selectAll('.FilterSVG')
        .filter(function (d) {return this.id == 'StateFilterSVG'})
        .append('g')
        .attr('id','thisMap')
        //.attr("transform", "translate(" + self.svgWidth/4 + "," + self.margin.top + ")")

    var projection = d3.geoAlbersUsa()
            .translate([self.svgWidth/2, self.margin.top + self.svgHeight/3])
            .scale([self.svgWidth]);

    var path = d3.geoPath()
            .projection(projection);

    mapGroup.selectAll(".mapPath")
        .data(self.nation.features)
        .enter()
        .append("path")
        .style('fill','b2e2e2')
        .attr("d", path)
        .classed('stateSelected', true)
        .classed('mapPath', true)
        .style('cursor', 'pointer')

    
    stateSchoolCounts = mapGroup.selectAll('text')
        .data(self.nation.features)
        .enter()
        .filter(function (d) {return d.properties.name != 'Puerto Rico'})
        .append('text')
        .text(function (d) {return self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]})
        .attr('x', function (d) {
            return self.svgWidth/2 + path.centroid(d)[0];
        })
        .attr("y", function(d){
            return  path.centroid(d)[1];
        })
        .style('text-anchor', 'middle')
        .style('cursor', 'pointer')
        .attr("dominant-baseline", "central")
        .attr('font-size',10)

    country = d3.select("#thisMap").selectAll("path")
    
    country.on("click", function (d) {
        selectedState = d3.select(this)
        
        if (selectedState.classed('stateSelected')) {
            selectedState
                .style('fill','black')
                .classed('stateSelected',false)
        }
        else {
            selectedState
                .style('fill','red')
                .classed('stateSelected',true)
        }

        self.selectData()
        self.updateMap()
    })

    mapGroup
        .append('rect')
        .attr('height',self.buttonHeight)
        .attr('width',self.buttonWidth)
        .attr('fill', 'red')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.selectAllStatesButton_posX)
        .attr('y', self.selectAllStatesButton_posY)
        .style('cursor', 'pointer')
        .attr('stroke', 'black')
        .on('click', function (d) {
            d3.select('#thisMap').selectAll("path")
                .classed('stateSelected', true)
            self.selectData()
            self.updateMap()
        })

    mapGroup
        .append('text')
        .text('Select All')
        .attr('width', 100)
        .attr('x', self.selectAllStatesButton_posX + self.buttonWidth/2)
        .attr('y', self.selectAllStatesButton_posY + self.buttonHeight/2)
        .attr('fill','white')
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")
        .style('cursor', 'pointer') 
        .style('pointer-events', 'none')

    mapGroup
        .append('rect')
        .attr('height',self.buttonHeight)
        .attr('width',self.buttonWidth)
        .attr('fill', 'white')
        .attr('rx',"15")
        .attr('ry',"15")
        .attr('x', self.clearAllStatesButton_posX)
        .attr('y', self.clearAllStatesButton_posY)
        .style('cursor', 'pointer')
        .attr('stroke', 'black')
        .on('click', function (d) {
            d3.select('#thisMap').selectAll("path")
                .style('fill','black')
                .classed('stateSelected', false)
            self.selectData()
            self.updateMap()
        })

    mapGroup
        .append('text')
        .text('Clear All')
        .attr('width', 100)
        .attr('x', self.clearAllStatesButton_posX + self.buttonWidth/2)
        .attr('y', self.clearAllStatesButton_posY + self.buttonHeight/2)
        .attr('fill','white')
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")
        .style('cursor', 'pointer') 
        .style('pointer-events', 'none')
}    

FilterLayout.prototype.updateMap = function () {
    var self = this

    d3.selectAll('.FilterDiv')
        .style('z-index',-100)
        .filter(function (d) {
            return this.id == 'StateFilterDiv'
        })
        .style('z-index',100)

    schoolCountByState = d3.nest()
        .key(function (d) {
            return d.STABBR;
        })
        .rollup(function (leaves) {
            return {
                'schoolCount': d3.sum(leaves,function(d){return 1}),
            }
        })
        .entries(self.selectedSchools); 

    self.schoolCountByStateObj = {}
    
    schoolCountByState.forEach(function (d) {
        self.schoolCountByStateObj[d.key] = d.value.schoolCount
    })

    var mapGroup = d3.selectAll('.FilterSVG')
        .filter(function (d) {return this.id == 'StateFilterSVG'})

    var projection = d3.geoAlbersUsa()
            .translate([self.svgWidth/2, self.margin.top + self.svgHeight/3])
            .scale([self.svgWidth]);

    var path = d3.geoPath()
            .projection(projection);


    mapSchoolCounts = mapGroup.select('#thisMap').selectAll('text').data(self.nation.features)
        
    mapSchoolCounts
        .exit()
        .remove()

    mapSchoolCounts
        .filter(function (d) {return d.properties.name != 'Puerto Rico'})
        .text(function (d) {
            if (self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]) {
                return self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]
            }
            else {return 0}
        })
        .attr('x', function (d) {
            return path.centroid(d)[0];
        })
        .attr("y", function(d){
            return  path.centroid(d)[1];
        })
        //.attr('id', function (d) {return d.})
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")
        .attr('font-size',10)
        .on("click", function (d) {
            var selectedStateText = d3.select(this)

            var selectedState = d3.select('#thisMap').selectAll('path')
                .filter(function (d) {return selectedStateText.datum().properties.name == d.properties.name })

            if (selectedState.classed('stateSelected')) {
                selectedState
                    .style('fill','black')
                    .classed('stateSelected',false)
            }
            else {
                selectedState
                    .style('fill','red')
                    .classed('stateSelected',true)
            }
            self.selectData()
            self.updateMap()
        })
        .on("mouseover", function (d) {
            d3.select(this)
                .attr('font-weight', 'bold')
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .attr('font-weight', 'normal')
        })

    mapSchoolCounts.filter(function (d) {return self.stateLookupObj[d.properties.name] == 'DE'})
        .attr('x', function (d) {
            return (path.centroid(d)[0] + 25);
        })
        .attr("y", function(d) {
            return  path.centroid(d)[1] - 10;
        })
        .text(function (d) {
                if (self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]) {
                return self.stateLookupObj[d.properties.name] + ' - ' + self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]
            }
            else {return self.stateLookupObj[d.properties.name] + ' - ' + 0}
        })
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")
        .attr('font-size',10)
        .style('pointer-events', 'all')
        .style('cursor', 'pointer')

    mapSchoolCounts.filter(function (d) {return self.stateLookupObj[d.properties.name] == 'RI'})
        .attr('x', function (d) {
            return (path.centroid(d)[0] + 22);
        })
        .attr("y", function(d) {
            return  path.centroid(d)[1] + 5;
        })
        .text(function (d) {
                if (self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]) {
                return self.stateLookupObj[d.properties.name] + ' - ' + self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]
            }
            else {return self.stateLookupObj[d.properties.name] + ' - ' + 0}
        })
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")
        .attr('font-size',10)
        .style('pointer-events', 'all')
        .style('cursor', 'pointer')

    mapSchoolCounts.filter(function (d) {return self.stateLookupObj[d.properties.name] == 'DC'})
        .attr('x', function (d) {
            return (path.centroid(d)[0] + 40);
        })
        .attr("y", function(d) {
            return  path.centroid(d)[1] + 10;
        })
        .text(function (d) {
                if (self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]) {
                return self.stateLookupObj[d.properties.name] + ' - ' + self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]
            }
            else {return self.stateLookupObj[d.properties.name] + ' - ' + 0}
        })
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")
        .attr('font-size',10)
        .style('pointer-events', 'all')
        .style('cursor', 'pointer')

    mapSchoolCounts.filter(function (d) {return self.stateLookupObj[d.properties.name] == 'MA'})
        .attr('x', function (d) {
            return (path.centroid(d)[0] + 30);
        })
        .attr("y", function(d) {
            return  path.centroid(d)[1] - 10;
        })
        .text(function (d) {
                if (self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]) {
                return self.stateLookupObj[d.properties.name] + ' - ' + self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]
            }
            else {return self.stateLookupObj[d.properties.name] + ' - ' + 0}
        })
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")
        .attr('font-size',10)
        .style('pointer-events', 'all')
        .style('cursor', 'pointer')

    mapSchoolCounts.filter(function (d) {return self.stateLookupObj[d.properties.name] == 'CT'})
        .attr('x', function (d) {
            return (path.centroid(d)[0] + 42);
        })
        .attr("y", function(d) {
            return  path.centroid(d)[1] - 8;
        })
        .text(function (d) {
                if (self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]) {
                return self.stateLookupObj[d.properties.name] + ' - ' + self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]
            }
            else {return self.stateLookupObj[d.properties.name] + ' - ' + 0}
        })
        .style('text-anchor', 'middle')
        .attr("dominant-baseline", "central")
        .attr('font-size',10)
        .style('pointer-events', 'all')
        .style('cursor', 'pointer')

    mapSchoolCounts.filter(function (d) {return self.stateLookupObj[d.properties.name] == 'MD'})
        .attr('x', function (d) {
            return (path.centroid(d)[0] + 40);
        })
        .attr("y", function(d) {
            return  path.centroid(d)[1];
        })
        .text(function (d) {
                if (self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]) {
                return self.stateLookupObj[d.properties.name] + ' - ' + self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]
            }
            else {return self.stateLookupObj[d.properties.name] + ' - ' + 0}
        })
        .style('pointer-events', 'all')
        .style('cursor', 'pointer')

    mapSchoolCounts.filter(function (d) {return self.stateLookupObj[d.properties.name] == 'NJ'})
        .attr('x', function (d) {
            return (path.centroid(d)[0] + 33);
        })
        .attr("y", function(d) {
            return  path.centroid(d)[1] - 6;
        })
        .text(function (d) {
                if (self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]) {
                return self.stateLookupObj[d.properties.name] + ' - ' + self.schoolCountByStateObj[self.stateLookupObj[d.properties.name]]
            }
            else {return self.stateLookupObj[d.properties.name] + ' - ' + 0}
        })
        .style('pointer-events', 'all')
        .style('cursor', 'pointer')

    mapSchoolCounts.filter(function (d) {return self.stateLookupObj[d.properties.name] == 'MI'})
        .attr('x', function (d) {
            return (path.centroid(d)[0] + 10);
        })
        .attr("y", function(d) {
            return  path.centroid(d)[1] + 20;
        })

    mapSchoolCounts.filter(function (d) {return self.stateLookupObj[d.properties.name] == 'LA'})
        .attr('x', function (d) {
            return (path.centroid(d)[0] - 8);
        })
}

FilterLayout.prototype.updateSlider = function (filterName) {
    var self = this

    d3.selectAll('.FilterDiv')
        .style('z-index',-100)
        .filter(function (d) {
            return this.id == filterName + 'FilterDiv'
        })
        .style('z-index',100)

    self.selectData()

    var slider_xScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d[filterName];
        })])
        .range([0, self.sliderWidth]);

    var FilterSVG = d3.selectAll('.FilterSVG')
        .filter(function (d) {
            return this.id == filterName + 'FilterSVG'
        })

    var histogram_arr = []

    self.selectedSchoolsObj[filterName].forEach(function (d) {histogram_arr.push(d[filterName])})

    self.histogram_arr[filterName] = histogram_arr

    histogram_arr = self.histogram_arr[filterName].sort(d3.ascending)

    var histogram = d3.histogram()
        .domain(slider_xScale.domain())
        .thresholds(slider_xScale.ticks(self.ticksCount))
      
    self.selectedBins[filterName] = histogram(histogram_arr)

    var reverseScale = d3.scaleLinear()
        .domain([self.brush_posX1, self.brush_posX2])
        .range([0, d3.max(self.schoolData, function (d) {
                return +d[filterName];
            })])

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(self.totBins[filterName], function(d) {return d.length})])
        .range([0, self.freqDistGroupHeight]);

    var line_xScale = d3.scaleLinear()
        .domain([d3.min(self.totBins[filterName], function (d) {return (d.x0 + d.x1)/2}), 
            d3.max(self.totBins[filterName], function(d) {return (d.x0 + d.x1)/2})])
        .range([0, self.freqDistGroupWidth]);

    var areaAboveLine = d3.area()
        .x(function(d) { return line_xScale((d.x0 + d.x1)/2); })
        .y0(self.freqDistGroupHeight)
        .y1(function(d) { return yScale(d.length);})
        .curve(d3.curveBasis)

    var areaBelowLine = d3.area()
        .x(function(d) { return line_xScale((d.x0 + d.x1)/2); })
        .y0(0)
        .y1(function(d) { return yScale(d.length);})
        .curve(d3.curveBasis)

    var valueLine = d3.line()
        .x(function(d) { return line_xScale((d.x0 + d.x1)/2); })
        .y(function(d) { return yScale(d.length); })
        .curve(d3.curveBasis)
        //.curve(d3.curveCardinal);

    var allSchoolsAreaBelowLineGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr("d", areaBelowLine(self.totBins[filterName]))
        .style('stroke','black')
        .attr('stroke-width',1.5)

    d3.select('#' + filterName + 'SelectedSchoolsAreaBelowLineGroup')
        .remove()

    var selectedSchoolsAreaBelowLineGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr("d", areaBelowLine(self.selectedBins[filterName]))
        .style('fill', 'GhostWhite')
        .style('opacity',.5)
        .style('stroke','dimGrey')
        .style('stroke-width',1.5)
        .attr('id', filterName + 'SelectedSchoolsAreaBelowLineGroup')

    d3.select('#' + filterName + 'SliderAreaSelection')
        .remove()

    var selectedSchoolsAreaSelection = FilterSVG
        .append('g')
        .attr('id', filterName + 'SliderAreaSelection')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append('rect')
        .attr('width',self.brushCoordinatesActual[filterName][1] - self.brushCoordinatesActual[filterName][0])
        .attr('x', self.brushCoordinatesActual[filterName][0])
        .attr('height',self.freqDistGroupHeight)
        .style('fill','#d95f0e')
        //.style('opacity',.7)

    d3.select('#' + filterName + 'AreaAboveSelectedSchoolsLine')
        .remove()

     var selectedSchoolsAreaAboveLineGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr('id', filterName + 'AreaAboveSelectedSchoolsLine')
        .attr("d", areaAboveLine(self.selectedBins[filterName]))
        .style('fill', 'dimGrey')
        .style('stroke','white')  
        .style('stroke-opacity',0)
        .style('opacity',.7)     

    d3.select('#' + filterName + 'AreaAboveAllSchoolsLine')
        .remove()

    var allSchoolsAreaAboveLineGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr('id', filterName + 'AreaAboveAllSchoolsLine')
        .attr("d", areaAboveLine(self.totBins[filterName]))
        .style('fill','#edf8fb')
        .style('stroke','#edf8fb')
        // .style('stroke-opacity',0)
        // .style('stroke-width',1.5)

    var allSchoolsLineGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr("d", valueLine(self.totBins[filterName]))
        .style('stroke-width',1.5)
        .style('stroke','black')
        .style('stroke-linejoin',"miter")
        .style('stroke-opacity',1)
        .style('fill','none')

    d3.select('#' + filterName + 'selectedSchoolsLine')
        .remove()

    var selectedSchoolsLineGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr('id',filterName + 'selectedSchoolsLine')
        .attr("d", valueLine(self.selectedBins[filterName]))
        .style('stroke-width',1.5)
        .style('stroke','dimGrey')
        .style('fill','none')
        .style('stroke-linejoin',"miter")
}

FilterLayout.prototype.drawSlider = function (filterName) {
    var self = this

    var slider_xScale = d3.scaleLinear()
        .domain([0, d3.max(self.schoolData, function (d) {
            return +d[filterName];
        })])
        .range([0, self.sliderWidth]);

    // create a new Slider that has the ticks and labels on the bottom
    var axis = d3.axisBottom()
    // assign the scale to the Slider
        .scale(slider_xScale)

    var FilterSVG = d3.selectAll('.FilterSVG')
        .filter(function (d) {
            return this.id == filterName + 'FilterSVG'
        })

    var sliderGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.slider_posX + "," + self.slider_posY + ")")
        .append('rect')
        .attr('width', self.sliderWidth)
        .attr('height', self.sliderHeight)

    var axisGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.axis_posX + "," + self.axis_posY + ")")
        .style('font-size',20)
        .call(axis)

    var brush = d3.brushX().extent([[self.brush_posX1,self.brush_posY1],[self.brush_posX2,self.brush_posY2]])

    var brushGroup = FilterSVG
        .append("g")    
        .attr("transform", "translate(" + self.slider_posX + "," + self.slider_posY + ")")
        .attr("class", "brush")
        .call(brush);

    brush
        .on("brush", function (d) {
            self.brushed(filterName)
        })

    var histogram_arr = []

    self.schoolData.forEach(function (d) {histogram_arr.push(d[filterName])})

    self.histogram_arr[filterName] = histogram_arr

    histogram_arr = self.histogram_arr[filterName].sort(d3.ascending)

    var histogram = d3.histogram()
        .domain(slider_xScale.domain())
        .thresholds(slider_xScale.ticks(self.ticksCount))
      
    self.totBins[filterName] = histogram(histogram_arr)

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(self.totBins[filterName], function(d) {return d.length})])
        .range([0, self.freqDistGroupHeight]);

    var line_xScale = d3.scaleLinear()
        .domain([d3.min(self.totBins[filterName], function (d) {return (d.x0 + d.x1)/2}), 
            d3.max(self.totBins[filterName], function(d) {return (d.x0 + d.x1)/2})])
        .range([0, self.freqDistGroupWidth]);

    var valueLine = d3.line()
        .x(function(d) { return line_xScale((d.x0 + d.x1)/2); })
        .y(function(d) { return yScale(d.length); })
        .curve(d3.curveBasis)
        //.curve(d3.curveCardinal);

    var lineGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr("class", "line")
        .attr("d", valueLine(self.totBins[filterName]))
        //.attr('stroke','none')

    var areaBelowLine = d3.area()
        .x(function(d) { return line_xScale((d.x0 + d.x1)/2); })
        .y0(0)
        .y1(function(d) { return yScale(d.length);})
        .curve(d3.curveBasis)

    var selectedSchoolsAreaBelowLineGroup = FilterSVG
        .append('g')
        .attr("transform", "translate(" + self.freqDistGroup_posX + "," + self.freqDistGroup_posY + ") scale(1, -1)")
        .append("path")
        .attr("class", "area")
        .attr("d", areaBelowLine(self.totBins[filterName]))
        //.style('fill', 'dimGrey')
        .style('stroke','black')
        .style('stroke-width',1.5)

}

FilterLayout.prototype.applyFilters = function () {
    var self = this

    var selectedSchoolsObj = {}
    var filteredSchoolMatrix = []

    self.selectedSchools.forEach(function (d,i) {
        selectedSchoolsObj[self.selectedSchools[i]['UNITID']] = self.selectedSchools[i]
    })

    for (schoolIndex in self.schoolData) {
        schoolRow = []
        schoolRow.push(self.schoolData[schoolIndex])
        //console.log(self.schoolData[schoolIndex])
        for (similarIndex in self.schoolSimilarityObj[self.schoolData[schoolIndex]['UNITID']]) {
            if (schoolRow.length < self.similarSchoolCount + 1) {
                //console.log(self.schoolSimilarityObj[self.schoolData[schoolIndex]['UNITID']][similarIndex])
                if (self.schoolSimilarityObj[self.schoolData[schoolIndex]['UNITID']][similarIndex] in selectedSchoolsObj) {
                    schoolRow.push(selectedSchoolsObj[self.schoolSimilarityObj[self.schoolData[schoolIndex]['UNITID']][similarIndex]])
                }
                //else {console.log('no')}
            }
        }      
        filteredSchoolMatrix.push(schoolRow)
    }

    console.log(filteredSchoolMatrix)
    self.searchBox.redraw(self.selectedSchools,filteredSchoolMatrix)
    d3.selectAll('.FilterDiv').remove()
    d3.select('#filter').select('svg').remove()
    self.init()
}


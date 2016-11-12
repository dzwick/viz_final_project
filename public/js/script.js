//CS-5630/6630
//University of Utah
//Assignment #3
//Dylan Zwick
//u0075213

function Script (barChart, schoolData) {
    var self = this;
    self.barChart = barChart
    // self.electoralVoteChart = electoralVoteChart;
    // self.tileChart = tileChart;
    // self.votePercentageChart = votePercentageChart;
    // self.shiftChart = shiftChart;
    self.schoolData = schoolData;
    self.init();
};

Script.prototype.init = function(){
    var self = this;
    console.log('5')
    self.update()
    self.mapWidth = 500
    self.mapHeight = 300
};

Script.prototype.update = function() {
    var self = this;

    console.log('6')
    schoolNames = self.schoolData.map(function(d,i){return d.INSTNM});
    $( function() {
    $("#schoolchoice").autocomplete({
        source:schoolNames,
        max:10,
        autoFocus:true,
        select: function(event, ui){
        self.updateMainInfo(ui.item.value);
        }
    });
    });

// var schoolData

var schooMatrix

// var schoolNames

// d3.csv("data/School_Data.csv", function(data) {
//     schoolData = data;
//     schoolNames = schoolData.map(function(d,i){return d.INSTNM});
//     $( function() {
// 	$("#schoolchoice").autocomplete({
// 	    source:schoolNames,
// 	    max:10,
// 	    autoFocus:true,
// 	    select: function(event, ui){
// 		updateMainInfo(ui.item.value);
// 	    }
// 	});
//     });
// });

d3.csv("data/similarity_rankings.csv", function (data) {
    schoolMatrix = data;
});

d3.json("data/us-states.json", function (error, nation) {
    if (error) throw error;
    self.drawMap(nation);
});

}

Script.prototype.updateMainInfo = function (selectedSchool) {
    var self = this
    self.clearSimilarInfo()
    
    var selectedSchoolData = self.schoolData.filter(function(d){return d.INSTNM == selectedSchool})[0];
    var similarSchools = schoolMatrix.filter(function(d){
	return d.UNITID == selectedSchoolData.UNITID})[0];
    var similarSchoolIDs = $.map(similarSchools, function(d,i){return[d]});
    var similarSchoolsArray = [];
    console.log('sim: ' + similarSchools)
    for(var i = 0; i < similarSchoolIDs.length; i++)
    {
	similarSchoolsArray.push(
	    self.schoolData.filter(function(d){
		return d.UNITID == similarSchoolIDs[i]})[0]
	);
    }

    self.barChart.updateData(similarSchoolsArray, selectedSchool)

    //Pretty straightforward.
    d3.select('#topschool').select('#schoolname').text(selectedSchoolData.INSTNM);
    d3.select('#topschool').select('#tuition').text(selectedSchoolData.COST);
    d3.select('#topschool').select('#SAT').text(selectedSchoolData.SAT_AVG_ALL);
    d3.select('#topschool').select('#admission').text(selectedSchoolData.ADM_RATE_ALL);
    d3.select('#topschool').select('#location').text((selectedSchoolData.CITY).concat(", ".concat(selectedSchoolData.STABBR)));
    
    var schoolnames = d3.select("#school-list")
	.selectAll("li")
	.data(similarSchoolsArray.slice(1))

    schoolnames
	.exit()
	.remove()
    
    schoolnames = schoolnames
	.enter()
	.append("li")
	.attr("id",function(d) {
	    return d.INSTNM.replace(/\s/g,'').replace("'","");
	})
	.on("click", function(d) {
	    self.updateSimilarInfo(d)})
	.text(function(d) {return d.INSTNM})
	.merge(schoolnames);

    schoolnames
	.attr("id",function(d) {
	    return d.INSTNM.replace(/\s/g,'');
	})
	.on("mouseover", function(d) {
	    self.updateHoverInfo(d)})
	.on("mouseout", function() {
	    self.clearHoverInfo()})
	.on("click", function(d) {
	    self.updateSimilarInfo(d)})
	.text(function(d) {return d.INSTNM})
    
    var mapsvg = d3.select("#map-layout");
    
    var projection = d3.geoAlbersUsa()
        .translate([self.mapWidth/2, self.mapHeight/2])
        .scale([self.mapWidth]);

    mapsvg.selectAll("circle").data([]).exit().remove();
    
    mapsvg.selectAll("circle")
        .data(similarSchoolsArray.slice(1))
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return projection([d.LONGITUDE, d.LATITUDE])[0];
        })
        .attr("cy", function (d) {
            return projection([d.LONGITUDE, d.LATITUDE])[1];
        })
        .attr("r", function(d) {
	    return Math.sqrt(d.COST)/30;
	})
	.attr("id",function(d) {
	    return d.INSTNM.replace(/\s/g,'').replace("'","");
	})
	.classed("similar-school",true)
	.on("mouseover", function(d) {
	    self.updateHoverInfo(d)})
	.on("mouseout", function() {
	    self.clearHoverInfo()})
	.on("click", function(d){
	    self.updateSimilarInfo(d)});

    mapsvg
	.append("circle")
        .attr("cx", projection([selectedSchoolData.LONGITUDE, selectedSchoolData.LATITUDE])[0])
        .attr("cy", projection([selectedSchoolData.LONGITUDE, selectedSchoolData.LATITUDE])[1])
        .attr("r", Math.sqrt(selectedSchoolData.COST)/30)
	.classed("top-school",true);
}

Script.prototype.clearSimilarInfo = function() {
    var self = this;

    //Pretty straightforward.
    d3.select('#choiceschool').select('#schoolname').text("");
    d3.select('#choiceschool').select('#tuition').text("");
    d3.select('#choiceschool').select('#SAT').text("");
    d3.select('#choiceschool').select('#admission').text("");
    d3.select('#choiceschool').select('#location').text("");

    d3.select('#school-list').selectAll("li")
	.classed("selected-school",false)
    
    self.clearHoverInfo();
}

Script.prototype.clearHoverInfo = function () {
    var self = this
    d3.select('#school-list').selectAll("li")
	.classed("school-hover",false)

    d3.select("#map-layout").selectAll("circle")
	.classed("school-hover",false)
}

Script.prototype.updateHoverInfo = function (selectedSchool) {
    var self = this;
    d3.select('#school-list').selectAll("li")
	.classed("school-hover",false)

    d3.select('#school-list')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'').replace("'","")))
	.classed("school-hover",true)

    d3.select("#map-layout").selectAll("circle")
	.classed("school-hover",false)

    d3.select('#map-layout')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'').replace("'","")))
	.classed("school-hover",true)
}

Script.prototype.updateSimilarInfo = function (selectedSchool) {
    var self = this;
    //Pretty straightforward.
    d3.select('#choiceschool').select('#schoolname').text(selectedSchool.INSTNM);
    d3.select('#choiceschool').select('#tuition').text(selectedSchool.COST);
    d3.select('#choiceschool').select('#SAT').text(selectedSchool.SAT_AVG_ALL);
    d3.select('#choiceschool').select('#admission').text(selectedSchool.ADM_RATE_ALL);
    d3.select('#choiceschool').select('#location').text((selectedSchool.CITY).concat(", ".concat(selectedSchool.STABBR)));
    
    d3.select('#school-list').selectAll("li")
	.classed("selected-school",false)

    d3.select('#school-list')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'').replace("'","")))
	.classed("selected-school",true)
    
    d3.select("#map-layout").selectAll("circle")
	.classed("selected-school",false)
    
    d3.select('#map-layout')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'').replace("'","")))
	.classed("selected-school",true)
}

Script.prototype.drawMap = function (nation) {
    var self = this;
    var mapsvg = d3.select("#map-layout");

    var projection = d3.geoAlbersUsa()
            .translate([self.mapWidth/2, self.mapHeight/2])
            .scale([self.mapWidth]);

    var path = d3.geoPath()
            .projection(projection);
    
    mapsvg.selectAll("path")
        .data(nation.features)
        .enter()
        .append("path")
        .attr("d", path);
}    
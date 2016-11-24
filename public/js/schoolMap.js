function SchoolMap() {
    var self = this;
    self.init();
};

SchoolMap.prototype.init = function(){
    var self = this;
    var nation;
    self.mapWidth = 1000;
    self.mapHeight = 500;
    self.projection = d3.geoAlbersUsa()
	.translate([self.mapWidth/2,self.mapHeight/2])
	.scale([self.mapWidth]);
    self.mapsvg = d3.select("#map-layout");

    d3.json("data/us-states.json", function (error, nation) {
	if (error) throw error;
	self.drawMap(nation);
	self.drawSchools();
    });
};

SchoolMap.prototype.drawMap = function(nation){
    var self = this;
    var path = d3.geoPath().projection(self.projection);
    
    self.mapsvg
	.selectAll("path")
        .data(nation.features)
        .enter()
        .append("path")
        .attr("d", path);
}

SchoolMap.prototype.drawSchools = function(){
    var self = this;

    //These filters fix a temporary problem. Should not be necessary
    //in the final project.
    var schoolDataMap = schoolSimilarityMatrix.filter(function(d) {
	return d[0].LONGITUDE != ""});
    schoolDataMap = schoolDataMap.filter(function(d){
	return d[0].STABBR != "GU"
	    && d[0].STABBR != "PR"
	    && d[0].STABBR != "VI"});
    
    self.similarSchools = self.mapsvg
	.selectAll("circle")
	.data(schoolDataMap);
    
    self.similarSchools.exit().remove();
    
    self.similarSchools = self.similarSchools
	.enter()
	.append("circle")
	.merge(self.similarSchools)
        .attr("cx", function (d) {
            return self.projection([d[0].LONGITUDE, d[0].LATITUDE])[0];
        })
        .attr("cy", function (d) {
            return self.projection([d[0].LONGITUDE, d[0].LATITUDE])[1];
        })
	.attr("id",function(d) {
	    //SID stands for School ID
	    return "SID".concat(d[0].UNITID);
	})
	.attr("class","regular-school")
	.on("mouseover", function(d) {
	    updateHoverInfo(d,self.projection)})
	.on("mouseout", function() {
	    clearHoverInfo()})
	.on("click", function(d){
	    self.updateSimilarInfo(d)});
    
};

SchoolMap.prototype.updateValues = function(){
    var self = this;

    self.similarSchools.attr("r",function(d){
	return Math.sqrt(d[self.selectedMetric])/30
    })
}

SchoolMap.prototype.updateHoverInfo = function (selectedSchool) {
    var self = this;
    
    d3.select("#map-layout").selectAll("circle")
	.classed("school-hover",false)

    d3.select('#map-layout')
	.select('#'.concat(selectedSchool[0].UNITID))
	.classed("school-hover",true)

    for(var i = 1; i < selectedSchool.length; i++)
    {
	d3.select('#map-layout')
	    .select('#'.concat(selectedSchool[i].UNITID))
	    .classed("school-hover",true)
    }
}

SchoolMap.prototype.updateMetric = function(){
    console.log(document.getElementById("data-select").value)
}


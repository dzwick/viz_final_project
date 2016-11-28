function SchoolMap() {
    var self = this;
    self.init();
};

SchoolMap.prototype.init = function(){
    var self = this;
    var nation;
    self.mapsvg = d3.select("#map-layout");

    d3.json("data/us-states.json", function (error, nation) {
	if (error) throw error;
	self.drawMap(nation);
	self.drawSchools();
	self.zoomMap();
    });
};

SchoolMap.prototype.drawMap = function(nation){
    var self = this;
    var path = d3.geoPath().projection(proj);

    /*var zoom = d3.behavior.zoom()
	.scaleExtent([1,10])
	.on("zoom",zoomed)
    */
    //self.mapsvg.call(zoom);
    
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

    var div = d3.select("body")
	.append("div")
	.attr("class","tooltip")
	.style("opacity",0)
    
    similarSchools = self.mapsvg
	.selectAll("circle")
	.data(schoolDataMap);
    
    similarSchools.exit().remove();
    
    similarSchools = similarSchools
	.enter()
	.append("circle")
	.merge(similarSchools)
        .attr("cx", function (d) {
            return proj([d[0].LONGITUDE, d[0].LATITUDE])[0];
        })
        .attr("cy", function (d) {
            return proj([d[0].LONGITUDE, d[0].LATITUDE])[1];
        })
	.attr("id",function(d) {
	    //SID stands for School ID
	    return "SID".concat(d[0].UNITID);
	})
	.attr("class","regular-school")
	.on("mouseover", function(d) {
	    updateHoverInfo(d);
	    div.transition()
		.duration(500)
		.style("opacity",.9)
	    div.html("<b>" + d[0].INSTNM
		     + "</b><br/><br/>"
		     + d[0].CITY
		     + ", " + d[0].STABBR)
		.style("left", (d3.event.pageX + 5) + "px")
		.style("top", (d3.event.pageY - 28) + "px");
	})
	.on("mouseout", function() {
	    div.transition()
		.duration(500)
		.style("opacity",0)
	    clearHoverInfo()})
	.on("click", function(d){
	    updateSelectedSchool(d)});
    
};

SchoolMap.prototype.zoomMap = function(){
    var self = this;
    
    self.mapsvg.append("rect")
	.attr("width",mapWidth)
	.attr("height",mapHeight)
	.style("fill","none")
	.style("pointer-events","all")
	.call(d3.zoom()
	      .scaleExtent([1/2,4])
	      .on("zoom",zoomed));
}

SchoolMap.prototype.updateValues = function(){
    var self = this;
    
    self.similarSchools.attr("r",function(d){
	return Math.sqrt(d[self.selectedMetric])/30
    })
}

function zoomed() {
    console.log(similarSchools);
    var transform = d3.event.transform;
    similarSchools.attr("transform", function(d) {
	console.log(d);
	return "translate(" + transform.applyX(proj([d[0].LONGITUDE, d[0].LATITUDE])[0])
	    + ","
	    + transform.applyY(proj([d[0].LONGITUDE, d[0].LATITUDE])[1])
	    + ")";
    });
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


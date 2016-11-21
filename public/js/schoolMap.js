console.log("Sup");

function SchoolMap() {
    var self = this;
    self.init();
};

SchoolMap.prototype.init() = function(){
    var self = this;
    self.mapWidth = 1000;
    self.mapHeight = 500;
};

SchoolMap.prototype.update = function(){
    var self = this;
    var mapsvg = d3.select("#map-layout");
    var projection = d3.geoAlbertsUsa()
	.translate([self.mapWidth/2,self.mapHeight/2])
	.scale([self.mapWidth]);

    var similarSchools = mapsvg.selectAll("circle").data(similarSchoolsArray);

    similarSchools.exit().remove();

    similarSchools = similarSchools
	.enter()
	.append("circle")
	.merge(similarSchools)
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
    
};


//CS-5630/6630
//University of Utah
//Assignment #3
//Dylan Zwick
//u0075213

mapWidth = 1050;
mapHeight = 525;
proj = d3.geoAlbersUsa()
    .translate([self.mapWidth/2,self.mapHeight/2])
    .scale([self.mapWidth]);

var div = d3.select("body")
	.append("div")
	.attr("id","list-tip")
	.attr("class","tooltip")
	.style("opacity",0)

function Script (schoolMap) {
    var self = this;
    self.schoolMap = schoolMap;
    self.init();
};

Script.prototype.init = function(){
    var self = this;
    
    schoolNames = schoolSimilarityMatrix
	.map(function(d,i){return {
	    label: d[0].INSTNM
		.concat(" - ")
		.concat(d[0].CITY)
		.concat(", ")
		.concat(d[0].STABBR),
	    value: d
	}})
    
    $( function() {
	$("#schoolchoice").autocomplete({
            source:schoolNames,
            max:10,
            autoFocus:true,
            select: function(event, ui){
		event.preventDefault();
		updateSelectedSchool(ui.item.value);
            },
	    focus: function(event,ui){
		event.preventDefault();
		$("#schoolchoice").val(ui.item.label);
	    }
	});
    });
};

/*Script.prototype.updateMainInfo = function(selectedSchool){
    var self = this;
    
    var selectedSchoolData = schoolData.filter(function(d){
	return d.INSTNM == selectedSchool})[0];
    var similarSchools = schoolSimilarityMatrix.filter(function(d){
	return d[0].UNITID == selectedSchoolData.UNITID})[0];
    /*var similarSchoolIds = $.map(similarSchools, function(d,i){return[d]});
    var similarSchoolsArray = [];
    for(var i = 0; i < similarSchoolIds.length; i++)
    {
	similarSchoolsArray.push(
	    self.schoolData.filter(function(d){
		return d.UNITID == similarSchoolIds[i]})[0]
	);
    }
    */
/*
    //self.barChart.updateData(similarSchoolsArray, selectedSchool)
    
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

    schoolnames
	.enter()
	.append("li")
	.merge(schoolnames)
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
    
    /*
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
    */
    /*
    self.schoolMap.updateSchools(similarSchoolsArray);
}

Script.prototype.clearSimilarInfo = function() {
    var self = this;

    //Pretty straightforward.
    d3.select('#selected-school').select('#schoolname').text("");
    d3.select('#selected-school').select('#tuition').text("");
    d3.select('#selected-school').select('#SAT').text("");
    d3.select('#selected-school').select('#admission').text("");
    d3.select('#selected-school').select('#location').text("");

    d3.select('#school-list').selectAll("li")
	.classed("selected-school",false)
    
    self.clearHoverInfo();
}
    */
/*
Script.prototype.updateSimilarInfo = function (selectedSchool) {
    var self = this;
    //Pretty straightforward.
    d3.select('#selected-school').select('#schoolname').text(selectedSchool.INSTNM);
    d3.select('#selected-school').select('#tuition').text(selectedSchool.COST);
    d3.select('#selected-school').select('#SAT').text(selectedSchool.SAT_AVG_ALL);
    d3.select('#selected-school').select('#admission').text(selectedSchool.ADM_RATE_ALL);
    d3.select('#selected-school').select('#location').text((selectedSchool.CITY).concat(", ".concat(selectedSchool.STABBR)));
    
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
*/

function updateHoverInfo(selectedSchool) {
    var mapsvg = d3.select("#map-layout")

    mapsvg.select('#SID'.concat(selectedSchool[0].UNITID))
	.classed("school-hover",true)

    for(var i = 1; i < selectedSchool.length; i++)
    {
	mapsvg.select('#SID'.concat(selectedSchool[i].UNITID))
	    .classed("school-hover-similar",true)
	
	
	mapsvg.append("line")
	    .attr("x1",proj([selectedSchool[0].LONGITUDE,
			     selectedSchool[0].LATITUDE])[0])
	    .attr("y1",proj([selectedSchool[0].LONGITUDE,
			     selectedSchool[0].LATITUDE])[1])
	    .attr("x2",proj([selectedSchool[i].LONGITUDE,
			     selectedSchool[i].LATITUDE])[0])
	    .attr("y2",proj([selectedSchool[i].LONGITUDE,
			     selectedSchool[i].LATITUDE])[1])
	    .attr("class","map-line")
    }

    d3.select("#similar-schools-list")
	.select("#SIDL".concat(selectedSchool[0].UNITID))
	.classed("school-hover",true)
}

function clearHoverInfo(){
    var mapsvg = d3.select("#map-layout");
    
    mapsvg.selectAll("circle")
	.classed("school-hover",false)
	.classed("school-hover-similar",false);

    mapsvg.selectAll("line").remove();

    var schoolnames = d3.select("#similar-schools-list")
	.selectAll("li")
	.classed("school-hover",false);
}

function updateSelectedSchool(selectedSchool){

    clearSelectedInfo();
    
    var mapsvg = d3.select("#map-layout")
    
    d3.select("#ss-value").text(selectedSchool[0].INSTNM);
    d3.select("#size-value").text(selectedSchool[0].CCSIZSET);
    d3.select("#cost-value").text(selectedSchool[0].COST);
    d3.select("#admission-value").text(selectedSchool[0].ADM_RATE_ALL);
    d3.select("#sat-value").text(selectedSchool[0].SAT_AVG_ALL);

    mapsvg.select('#SID'.concat(selectedSchool[0].UNITID))
	.classed("selected-school",true)
    
    d3.select("#selected-school-display")
	.on("mouseover", function(){
	    updateHoverInfo(d3.select('#map-layout')
			    .select('#SID'.concat(selectedSchool[0]
						  .UNITID))
			    .datum()
			   )})
	.on("mouseout", function() {
	    clearHoverInfo()})
	.text(selectedSchool[0].INSTNM)
	.style("font-weight","bold")
    
    updateSimilarInfo(selectedSchool);
    
}

function clearSelectedInfo(){
    d3.selectAll("circle")
	.classed("selected-school", false)
	.classed("similar-school", false)
	.style("r",null);
}

function updateSimilarInfo(selectedSchool){

    var schoolnames = d3.select("#similar-schools-list")
	.selectAll("li")
	.data(selectedSchool.slice(1));
    
    schoolnames.exit().remove()

    schoolnames
	.enter()
	.append("li")
	.merge(schoolnames)
	.attr("id",function(d){
	    //SIDL stands for School ID List
	    return "SIDL".concat(d.UNITID)})
	.on("mouseover", function(d) {
	    updateHoverInfo(d3.select('#map-layout')
			    .select('#SID'.concat(d.UNITID))
			    .datum());
	    div.transition()
		.duration(500)
		.style("opacity",.9)
	    div.html("<b>" + d.CITY
		     + ", " + d.STABBR + "</b>"
		     + "<br>" + d.ADM_RATE_ALL
		     + "<br>" + d.SAT_AVG_ALL
		    + "<br>" + d.COST)
		.style("left", $(this).position().left
		       -$("#list-tip").width() - 40 + "px")
		.style("top", $(this).position().top + "px");
	})
	.on("mouseout", function() {
	    div.transition()
		.duration(200)
		.style("opacity",0);
	    clearHoverInfo()})
	.on("click", function(d){
	    div.transition()
		.duration(200)
		.style("opacity",0);
	    updateSelectedSchool(d3.select('#map-layout')
				 .select('#SID'.concat(d.UNITID))
				 .datum())})
	.text(function(d) {return d.INSTNM})
    
    for(var i = 1; i < selectedSchool.length; i++)
    {
	d3.select("#map-layout")
	    .select('#SID'.concat(selectedSchool[i].UNITID))
	    .classed("similar-school",true)
	    .style("r",3/i+5)
    }
}

//CS-5630/6630
//University of Utah
//Assignment #3
//Dylan Zwick
//u0075213

function Script (schoolMap) {
    var self = this;
    self.schoolMap = schoolMap;
    self.init();
};

Script.prototype.init = function(){
    var self = this;
    
    schoolNames = schoolData.map(function(d,i){return d.INSTNM});
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
};

Script.prototype.updateMainInfo = function(selectedSchool){
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

function updateHoverInfo(selectedSchool, proj) {
    var mapsvg = d3.select("#map-layout")

    clearHoverInfo();

    mapsvg.select('#SID'.concat(selectedSchool[0].UNITID))
	.attr("class","school-hover")

    for(var i = 1; i < selectedSchool.length; i++)
    {
	mapsvg.select('#SID'.concat(selectedSchool[i].UNITID))
	    .attr("class","school-hover-similar")
	
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
}

function clearHoverInfo(){
    var mapsvg = d3.select("#map-layout");
    
    mapsvg.selectAll("circle")
	.attr("class","regular-school");

    mapsvg.selectAll("line").remove();
}

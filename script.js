//Utah Big Data Competition
//The A-Team

var schoolData

var schooMatrix

var schoolNames

d3.csv("data/School_Data.csv", function(data) {
    schoolData = data;
    schoolNames = schoolData.map(function(d,i){return d.INSTNM});
    $( function() {
	$("#schoolchoice").autocomplete({
	    source:schoolNames,
	    max:10,
	    autoFocus:true,
	    select: function(event, ui){
		updateMainInfo(ui.item.value);
	    }
	});
    });
});

d3.csv("data/similarity_rankings.csv", function(data) {
    schoolMatrix = data;
});

d3.json("data/us-states.json", function (error, nation) {
    if (error) throw error;
    drawMap(nation);
});

function updateMainInfo(selectedSchool) {

    clearSimilarInfo()
    
    var selectedSchoolData = schoolData.filter(function(d){return d.INSTNM == selectedSchool})[0];
    var similarSchools = schoolMatrix.filter(function(d){
	return d.UNITID == selectedSchoolData.UNITID})[0];
    var similarSchoolIDs = $.map(similarSchools, function(d,i){return[d]});
    var similarSchoolsArray = [];
    
    for(var i = 0; i < similarSchoolIDs.length; i++)
    {
	similarSchoolsArray.push(
	    schoolData.filter(function(d){
		return d.UNITID == similarSchoolIDs[i]})[0]
	);
    }
    
    //Pretty straightforward.
    d3.select('#topschool').select('#schoolname').text(selectedSchoolData.INSTNM);
    d3.select('#topschool').select('#tuition')
	.text("$".concat(selectedSchoolData.COST.toString()
			 .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			 .split(".")[0]));
    d3.select('#topschool').select('#SAT').text(selectedSchoolData.SAT_AVG_ALL
						.toString().split(".")[0]);
    d3.select('#topschool').select('#admission')
	.text((selectedSchoolData.ADM_RATE_ALL*100).toString()
	      .substring(0,5).concat("%"));
    d3.select('#topschool').select('#location')
	.text((selectedSchoolData.CITY).concat(", ".concat(selectedSchoolData.STABBR)));
    d3.select('#topschool').select('#finaid')
	.attr("href","http://"+String(selectedSchoolData.FINAID_URL))
	.text("Financial Aid")
    
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
	    return d.INSTNM.replace(/\s/g,'')
		.replace("'","").replace("&","");
	})
	.on("click", function(d) {
	    updateSimilarInfo(d)})
	.text(function(d) {return d.INSTNM})
	.merge(schoolnames);

    schoolnames
	.attr("id",function(d) {
	    return d.INSTNM.replace(/\s/g,'')
		.replace("'","").replace("&","");
	})
	.on("mouseover", function(d) {
	    updateHoverInfo(d)})
	.on("mouseout", function() {
	    clearHoverInfo()})
	.on("click", function(d) {
	    updateSimilarInfo(d)})
	.text(function(d) {return d.INSTNM})
    
    var mapsvg = d3.select("#map-layout");
    
    var projection = d3.geoAlbersUsa()
        .translate([600 / 2, 400 / 2])
        .scale([700]);

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
	    return d.INSTNM.replace(/\s/g,'')
		.replace("'","").replace("&","");
	})
	.classed("similar-school",true)
	.on("mouseover", function(d) {
	    updateHoverInfo(d)})
	.on("mouseout", function() {
	    clearHoverInfo()})
	.on("click", function(d){
	    updateSimilarInfo(d)});

    mapsvg
	.append("circle")
        .attr("cx", projection([selectedSchoolData.LONGITUDE, selectedSchoolData.LATITUDE])[0])
        .attr("cy", projection([selectedSchoolData.LONGITUDE, selectedSchoolData.LATITUDE])[1])
        .attr("r", Math.sqrt(selectedSchoolData.COST)/30)
	.classed("top-school",true);
}

function clearSimilarInfo() {

    //Pretty straightforward.
    d3.select('#choiceschool').select('#schoolname').text("");
    d3.select('#choiceschool').select('#tuition').text("");
    d3.select('#choiceschool').select('#SAT').text("");
    d3.select('#choiceschool').select('#admission').text("");
    d3.select('#choiceschool').select('#location').text("");
    d3.select('#choiceschool').select('#finaid').text("");

    d3.select('#school-list').selectAll("li")
	.classed("selected-school",false)
    
    clearHoverInfo();
}

function clearHoverInfo() {

    d3.select('#school-list').selectAll("li")
	.classed("school-hover",false)

    d3.select("#map-layout").selectAll("circle")
	.classed("school-hover",false)
}

function updateHoverInfo(selectedSchool) {

    d3.select('#school-list').selectAll("li")
	.classed("school-hover",false)

    d3.select('#school-list')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'')
			   .replace("'","").replace("&","")))
	.classed("school-hover",true)

    d3.select("#map-layout").selectAll("circle")
	.classed("school-hover",false)

    d3.select('#map-layout')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'')
			   .replace("'","").replace("&","")))
	.classed("school-hover",true)
}

function updateSimilarInfo(selectedSchool) {
    
    //Pretty straightforward.
    d3.select('#choiceschool').select('#schoolname').text(selectedSchool.INSTNM);
    d3.select('#choiceschool').select('#tuition')
	.text("$".concat(selectedSchool.COST.toString()
			 .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			 .split(".")[0]));
    d3.select('#choiceschool').select('#SAT').text(selectedSchool.SAT_AVG_ALL
						   .toString().split(".")[0]);
    d3.select('#choiceschool').select('#admission')
	.text((selectedSchool.ADM_RATE_ALL*100).toString()
	      .substring(0,5).concat("%"));
    d3.select('#choiceschool').select('#location')
	.text((selectedSchool.CITY).concat(", ".concat(selectedSchool.STABBR)));
    d3.select('#choiceschool').select('#finaid')
	.attr("href","http://"+String(selectedSchool.FINAID_URL))
	.text("Financial Aid")
    
    d3.select('#school-list').selectAll("li")
	.classed("selected-school",false)

    d3.select('#school-list')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'')
			   .replace("'","").replace("&","")))
	.classed("selected-school",true)
    
    d3.select("#map-layout").selectAll("circle")
	.classed("selected-school",false)
    
    d3.select('#map-layout')
	.select('#'.concat(selectedSchool.INSTNM.replace(/\s/g,'')
			   .replace("'","").replace("&","")))
	.classed("selected-school",true)
}

function drawMap(nation) {

    var mapsvg = d3.select("#map-layout");

    var projection = d3.geoAlbersUsa()
            .translate([600 / 2, 400 / 2])
            .scale([700]);

    var path = d3.geoPath()
            .projection(projection);
    
    mapsvg.selectAll("path")
        .data(nation.features)
        .enter()
        .append("path")
        .attr("d", path);
}    




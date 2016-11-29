// We specify the dimensions for the map container. We use the same
// width and height as specified in the CSS above.
var width = 600,
    height = 400;

var selTrans = false;
var scaleFactor = 1;

// We create a SVG element in the map container and give it some
// dimensions.
var svg = d3.select('#map').append('svg')
  .attr('width', width)
  .attr('height', height);

var mapFeatures = svg.append('g')
    .attr('class', 'features');

var mapSchools = svg.append('g')
    .attr('class','schools');

var mapVoronoi = svg.append('g')
    .attr('class','voronoi')
    .classed('hidden-lines',true);

var mapSimilar = svg.append('g')
    .attr('class','similar');

var template = d3.select('#template').html();
Mustache.parse(template);

var zoom = d3.zoom()
    .scaleExtent([1,1000])
    .translateExtent([[0,0],[width,height]])
    .on('zoom',zoomZoom);

svg.call(zoom).on('dblclick.zoom',null);

// We define a geographical projection
//     https://github.com/mbostock/d3/wiki/Geo-Projections
// and set the initial zoom to show the features.
var projection = d3.geoAlbersUsa()
    .translate([width/2,height/2])
    .scale(width*1.3);

// We prepare a path object and apply the projection to it.
var path = d3.geoPath()
  .projection(projection);

// Load the features from the GeoJSON.
d3.json('data/us-states.json', function(error, nation) {
    
    // We add a <g> element to the SVG element and give it a class to
    // style it later.
    mapFeatures
    // D3 wants us to select the (non-existing) path objects first ...
	.selectAll('path')
    // ... and then enter the data. For each feature, a <path> element
    // is added.
	.data(nation.features)
	.enter().append('path')
    // As "d" attribute, we set the path of the feature.
	.attr('d', path);

    d3.csv("data/School_Data.csv", function (data1) {
        schoolData = data1; //Probably should make this local
	schoolData = schoolData.filter(function(d){
	    return d.LONGITUDE != ""
		&& d.LATITUDE != ""
		&& d.STABBR != "GU"
		&& d.STABBR != "PR"
		&& d.STABBR != "VI"});

	
	
	d3.csv("data/similarity_rankings.csv", function (data2) {
	    schoolMatrix = data2; //Probably should make this local
	    schoolSimilarityMatrix = [];
	    for(var i = 0; i < schoolMatrix.length; i++){
		var similarSchools = [];
		for(var o in schoolMatrix[i]){
		    similarSchools.push(schoolMatrix[i][o]);
		}
		var similarSchoolsData = [];
		for(var j = 0; j < similarSchools.length; j++){
		    similarSchoolsData.push(
			schoolData.filter(function(d){
			    return d.UNITID == similarSchools[j]})[0]
		    );
		}
		schoolSimilarityMatrix.push(similarSchoolsData);
	    }
	    schoolSimilarityMatrix = schoolSimilarityMatrix.filter(function(d){
		return d[0] != undefined
		    && d[0].LONGITUDE != ""
		    && d[0].LATITUDE != ""
		    && d[0].STABBR != "GU"
		    && d[0].STABBR != "PR"
		    && d[0].STABBR != "VI"});

	    for(var i = 0; i < schoolSimilarityMatrix.length; i++){
		schoolSimilarityMatrix[i] = schoolSimilarityMatrix[i]
		    .filter(function(d){
			return d != undefined
			    && d.LONGITUDE != ""
			    && d.LATITUDE != ""
			    && d.STABBR != "GU"
			    && d.STABBR != "PR"
			    && d.STABBR != "VI"});
	    }

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
		    source: function(request, response){
			var results = $.ui.autocomplete
			    .filter(schoolNames, request.term);
			response(results.slice(0,100));
		    },
		    minLength:3,
		    select: function(event, ui){
			hoverSimilarOff();
			selectSchool(ui.item.value);
			return false;
		    },
		    focus: function(event,ui){
			$("#schoolchoice").val(ui.item.label);
			hoverSimilarOff();
			hoverSimilar(ui.item.value);
			return false;
		    }
		});
	    });
	    
	    mapSchools
		.selectAll('circle')
		.data(schoolSimilarityMatrix)
		.enter().append('circle')
		.attr("cx", function (d) {
		    return projection([d[0].LONGITUDE, d[0].LATITUDE])[0];
		})
		.attr("cy", function (d) {
		    return projection([d[0].LONGITUDE, d[0].LATITUDE])[1];
		})
		.attr("id",function(d) {
		    //CSID stands for Circle School ID
		    return "CSID".concat(d[0].UNITID);
		})
		.attr("r",function(){return closeScale(this)});
	    
	    var voronoi = d3.voronoi()
		.extent([[0,0],[width,height]])
	    
	    var schools = schoolSimilarityMatrix.map(function(d){
		return projection([d[0].LONGITUDE, d[0].LATITUDE])})
	    
	    var schoolDataVoronoi = zip([
		schoolSimilarityMatrix,
		voronoi.polygons(schools)])
	    
	    mapVoronoi
		.selectAll('path')
		.data(schoolDataVoronoi)
		.enter().append('path')
		.classed('vor',true)
		.call(redrawPolygon)
		.attr("id",function(d){
		    //VSID stands for Voronoi School ID
		    return "VSID".concat(d[0][0].UNITID)})
		.style('pointer-events','all')
		.on('mouseover',function(d){
		    hoverSimilar(d[0]);
		    showTooltip(d[0][0])})
		.on('mouseout',function(d){
		    hoverSimilarOff();
		    hideTooltip()})
		.on('click',function(d){
		    selectSchool(d[0]);
		})
	    
	})
    })
	    
});// This is where the map will be coded.

function zoomZoom() {
    var transform = d3.event.transform;
    scaleFactor = transform.k
    
    mapFeatures.attr('transform',transform)
	.style('stroke-width', 0.5/scaleFactor);
    
    mapSchools.attr('transform',transform);
    
    mapVoronoi.attr('transform',transform)
	.style('stroke-width',0.5/scaleFactor);
    
    mapSchools.selectAll('circle')
	.attr('r',function(){return closeScale(this,1)});

    mapSimilar.attr('transform',transform)
	.style('stroke-width',0.5/scaleFactor);
}

function closeScale(circ){

    var rank = 1;
    var testRank = d3.select(circ).attr("rank");
    
    if(testRank != null){rank = testRank}
    
    if(d3.select(circ).classed('selected')){
	rBase = 12;
    } else if(d3.select(circ).classed('similar')){
	rBase = 6+2/rank;
    } else if(d3.select(circ).classed('selected-hover')){
	rBase = 6;
    } else if(d3.select(circ).classed('similar-hover')){
	rBase = 3 + 2/rank;
    } else{
	rBase = 2;
    }
    
    var rScale = Math.sqrt(scaleFactor);
    
    if (scaleFactor <= 20){
	return rBase/rScale;
    }
    else if (scaleFactor <= 40){
	return rBase/(2*rScale);
    }
    else if (scaleFactor <= 100){
	return rBase/(4*rScale);
    }
    else if (scaleFactor <= 500){
	return rBase/(8*rScale)
    }
    else {
	return rBase/(16*rScale);
    }
}

d3.select("#show-voronoi")
    .on("change",function(){
	d3.selectAll(".voronoi").classed("hidden-lines",!this.checked);
    });

d3.select("#zoom-reset")
    .on('mouseover',function(){
	d3.select(this).classed("hover",true)})
    .on('mouseout',function(){
	d3.select(this).classed("hover",false)})
    .on('click',function(){
	svg.transition().duration(750)
	    .call(zoom.transform,d3.zoomIdentity);
    })

var tooltip = d3.select("#map")
    .append("div")
    .attr("class", "tooltip hidden-tooltip");

function showTooltip(d){
    
    // Get the current mouse position (as integer)
    var mouse = d3.mouse(d3.select('#map').node()).map(
	function(d) { return parseInt(d); }
    );
    
    // Calculate the absolute left and top offsets of the tooltip. If the
    // mouse is close to the right border of the map, show the tooltip on
    // the left.

    var location = projection([d.LONGITUDE, d.LATITUDE])
    var left = Math.min(width/1.2-6 * d.INSTNM.length,location[0] + 5);
    var top = location[1] + height/(2*1.3)-15;
    
    tooltip.classed('hidden-tooltip',false)
	.attr("style", "left:" + left + "px; top:" + top + "px")
	.html(d.INSTNM)
}

/**
 * Hide the tooltip.
 */
function hideTooltip() {
    
    tooltip.classed('hidden-tooltip', true);
}

function redrawPolygon(polygon) {
  polygon
	.attr("d", function(d) {return d[1] ? "M" + d[1].join("L") + "Z" : null; });
}

function zip(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}

function hoverSimilar(schoolData){

    if(!d3.select('#CSID'.concat(schoolData[0].UNITID))
       .classed('selected') &&
       !d3.select('#CSID'.concat(schoolData[0].UNITID))
       .classed('similar') &&
       !d3.select('#CSID'.concat(schoolData[0].UNITID))
       .classed('selected-hover'))
    {

	d3.select('#CSID'.concat(schoolData[0].UNITID))
	    .classed('selected-hover',true)
	
	d3.select('#CSID'.concat(schoolData[0].UNITID))
	    .attr("r",function(){return closeScale(this,1)});
    }
	
    for(var i = 1; i < schoolData.length; i++){
	
	mapSimilar.append('line')
	    .attr("x1",projection([schoolData[0].LONGITUDE
				   ,schoolData[0].LATITUDE])[0])
	    .attr("y1",projection([schoolData[0].LONGITUDE
				   ,schoolData[0].LATITUDE])[1])
	    .attr("x2",projection([schoolData[i].LONGITUDE
				   ,schoolData[i].LATITUDE])[0])
	    .attr("y2",projection([schoolData[i].LONGITUDE
				   ,schoolData[i].LATITUDE])[1])
	    .attr("class","map-line")
	
	if(!d3.select('#CSID'.concat(schoolData[0].UNITID))
	   .classed('selected') &&
	   !d3.select('#CSID'.concat(schoolData[0].UNITID))
	   .classed('similar')){
	    d3.select('#CSID'.concat(schoolData[i].UNITID))
		.classed('similar-hover',true)
		.attr("rank",i)
		.attr("r",function(){return closeScale(this)})
	}
    }
    
}

function hoverSimilarOff(){

    mapSimilar.selectAll('line').remove();

    mapSchools.selectAll('circle').classed('selected-hover',false)
	.classed('similar-hover',false);

    mapSchools.selectAll('circle').attr("r",function(){
	return closeScale(this)})
}

function selectSchool(selectedList) {
    
    if(!selTrans){
	
	if(!svg.select("#CSID".concat(selectedList[0].UNITID))
	   .classed('selected')){

	    selTrans = true;

	    svg.selectAll('circle').classed('selected',false);
	    svg.selectAll('circle').classed('similar',false);
	    svg.select('#CSID'.concat(selectedList[0].UNITID))
		.classed('selected',true);
	    for(var i=1; i < selectedList.length; i++){
		svg.select('#CSID'.concat(selectedList[i].UNITID))
		    .attr("rank",i)
		    .classed('similar',true);
	    }
	    
	    svg.selectAll('circle').transition().duration(200)
		.attr('r',function(){return closeScale(this)})
		.on('end',function(){selTrans = false})
	}
    }

    formatSelectedList = $.extend({},selectedList[0]);
    console.log(formatSelectedList);
    
    var detailsHtml = Mustache.render(template, selectedList[0]);
    d3.select('#details').html(detailsHtml);
    d3.select('#details').classed("hidden", false);
    
    d3.select('#selected-school-name')
	.on('mouseover', function(){
	    hoverSimilar(selectedList)})
	.on('mouseout', function(){
	    hoverSimilarOff()})
    
    
    d3.select('#farther-schools-header').classed('hidden-div',false);

    firstListNum = Math.ceil(selectedList.length/3);
    secondListNum = Math.ceil((selectedList.length-firstListNum)/2)+firstListNum;

    d3.select('#farther-schools-list').attr("start",firstListNum);
    d3.select('#farthest-schools-list').attr("start",secondListNum);
    
    var listSimSchools = d3.select('#closest-schools-list')
	.selectAll('li').data(selectedList.slice(1,firstListNum))

    var listSimSchools2 = d3.select('#farther-schools-list')
	.selectAll('li').data(selectedList.slice(firstListNum,secondListNum))

    var listSimSchools3 = d3.select('#farthest-schools-list')
	.selectAll('li').data(selectedList.slice(secondListNum))
    
    listSimSchools.exit().remove();
    listSimSchools2.exit().remove();
    listSimSchools3.exit().remove();
    
    listSimSchools
	.enter()
	.append('li')
	.merge(listSimSchools)
	.attr('id',function(d){
	    //LSID stands for "List School ID"
	    return 'LSID'.concat(d.UNITID)})
	.on('mouseover', function(d){
	    d3.select('#LSID'.concat(d.UNITID)).classed('hover',true);
	    hoverSimilar(schoolSimilarityMatrix.filter(
		function(k){
		    return k[0].UNITID == d.UNITID}
	    )[0])})
	.on('mouseout', function(d){
	    d3.select('#LSID'.concat(d.UNITID)).classed('hover',false);
	    hoverSimilarOff()})
	.on('click', function(d){
	    selectSchool(schoolSimilarityMatrix.filter(
		function(k){
		    return k[0].UNITID == d.UNITID}
	    )[0])})
	.text(function(d){return d.INSTNM})

    listSimSchools2
	.enter()
	.append('li')
	.merge(listSimSchools2)
	.attr('id',function(d){
	    //LSID stands for "List School ID"
	    return 'LSID'.concat(d.UNITID)})
	.on('mouseover', function(d){
	    d3.select('#LSID'.concat(d.UNITID)).classed('hover',true);
	    hoverSimilar(schoolSimilarityMatrix.filter(
		function(k){
		    return k[0].UNITID == d.UNITID}
	    )[0])})
	.on('mouseout', function(d){
	    d3.select('#LSID'.concat(d.UNITID)).classed('hover',false);
	    hoverSimilarOff()})
	.on('click', function(d){
	    selectSchool(schoolSimilarityMatrix.filter(
		function(k){
		    return k[0].UNITID == d.UNITID}
	    )[0])})
	.text(function(d){return d.INSTNM})

    listSimSchools3
	.enter()
	.append('li')
	.merge(listSimSchools3)
	.attr('id',function(d){
	    //LSID stands for "List School ID"
	    return 'LSID'.concat(d.UNITID)})
	.on('mouseover', function(d){
	    d3.select('#LSID'.concat(d.UNITID)).classed('hover',true);
	    hoverSimilar(schoolSimilarityMatrix.filter(
		function(k){
		    return k[0].UNITID == d.UNITID}
	    )[0])})
	.on('mouseout', function(d){
	    d3.select('#LSID'.concat(d.UNITID)).classed('hover',false);
	    hoverSimilarOff();})
	.on('click', function(d){
	    selectSchool(schoolSimilarityMatrix.filter(
		function(k){
		    return k[0].UNITID == d.UNITID}
	    )[0])})
	.text(function(d){return d.INSTNM})
    
}


    

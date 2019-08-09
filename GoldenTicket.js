// Add hover function with d3 on top logo (can be done through css as well)
d3.select('img')
          .on('mouseover', function() {
            d3.select("img").style("opacity","0.5")
          })
          .on('mouseout', function() {
            d3.select("img").style("opacity","1")
          })

// Create svg inside container and setting width and height for responsivness
var width = window.innerWidth,
    height = window.innerHeight,
    svg = d3.select("div#container").append("svg")
      .attr("width", width)
      .attr("height", 1400)
      // .attr("viewBox", "0 0 1000 500")
      // .attr("preserveAspectRatio","xMidYMid meet")
      ;

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Phase I of Game
// Delete start button and replace with first layout - all this needs to be delayed to smooth out the transition
function Phase1(){
// Remove button
d3.select("button.buttonStart").transition().duration(500).style("opacity","0").remove()
d3.select("div.button").transition().duration(500).remove()
// Delay new layout
sleep(500).then(() => {
    //Insert texte, question 1
    d3.select("div.question")
      .style("font-size","30px")
      .html("In 2017, over <span class='highlight'>300 billion $ </span> of gold was imported worldwide. <br>Can you find, on this globe, which country was the biggest importer that year ?")
    
    // setting up globe projection and data
    var projection = d3.geoOrthographic()
      .scale(150)
      .center([180,-60])
      .translate([width/3, 600])

    var data = d3.map();

    // setting up colorScale on threshold basis. Need to rethink the clusters
    var colorScale = d3.scaleThreshold()
      .domain([10000,100000,1000000,10000000, 500000000,35000000000, 50000000000,70000000000])
      .range(d3.schemeOrRd[9])

    // Set tooltip
    var tooltip = d3.select("div.tooltip");

    // Load data and launch function -> Possible to use a Promise wrapper.
    d3.queue()
      .defer(d3.json, "../data/world.geojson")
      .defer(d3.csv, "../data/World_Imp.csv", function(d) { data.set(d.country_origin_id, +d.import_val);})
      .await(createMap);

    var MapGroupe = svg.append("g").attr("id","MapGroupe")

    function createMap (error, countries) {
      // Draw the map
      MapGroupe.selectAll("path")
          .data(countries.features)
          .enter()
          .append("path")
            // draw each country
            .attr("class", "countries")
            .attr("d", d3.geoPath()
              .projection(projection))
            // set the color of each country referencing id from geojson and csv file
            .attr("fill", function (d) {
              d.total = data.get(d.id) || 0;            
              return colorScale(d.total);
            })
            // Set tooltip with hover function and country color change on hover
            .on("mouseover",function(d,i){
                d3.select(this).attr("fill","#f5c373").attr("stroke-width",2);
                      return tooltip.style("hidden", false).html(d.properties.name);
                  })
            .on("mousemove",function(d){
                tooltip.classed("hidden", false)
                      .style("top", (d3.event.pageY) + "px")
                      .style("left", (d3.event.pageX + 10) + "px")
                      .html("country:"+d.properties.name + "<br> Import:"+formatNum(d.total)+" $");
            })
            .on("mouseout",function(d,i){
                d3.select(this).attr("fill",function (d) {
                        d.total = data.get(d.id) || 0;
                        return colorScale(d.total);
                })
                .attr("stroke-width",1);
                          tooltip.classed("hidden", true)
            })
            // Answer for question 1 
            .on("click",function(d,i){
              if (d.id === "CHE"){
                d3.select("div.question")
                  .style("font-size","30px")
                  .html("You're Right")
                  // - Error in consol but works
                  .call(Phase2())                }
              else {
                d3.select("div.question")
                  .style("font-size","30px")
                  .html("Sorry, Try Again")
              }
            })
          // Add two layers of graticule to have the outline append (over the globe) and the fill insert (under the globe/countries) and a third graticule 
          var graticule = d3.geoGraticule();
          MapGroupe.append("path").datum(graticule.outline).attr("class", "graticule outline").attr("d", d3.geoPath().projection(projection))
          MapGroupe.insert("path","path.countries").datum(graticule).attr("class", "graticule fill").attr("d", d3.geoPath().projection(projection))
          MapGroupe.insert("path","path.countries").datum(graticule).attr("class", "graticule").attr("d", d3.geoPath().projection(projection))
  }

    // Implement Zoom (max,min) and rotation on projection
    var mapZoom = d3.zoom()
        .scaleExtent([350, 800])
      .on("zoom", zoomed)

    var zoomSettings = d3.zoomIdentity                                        
      .translate(250, 250)
      .scale(350)

    svg.call(mapZoom).call(mapZoom.transform, zoomSettings)      

    function zoomed() {
        var e = d3.event
        projection.translate([e.transform.x, e.transform.y]).scale(e.transform.k); 
        d3.selectAll("path.graticule").attr("d",d3.geoPath().projection(projection))
        d3.selectAll("path.countries").attr("d",d3.geoPath().projection(projection));
            }

    // Reset projection's position otherwise end up in the corner because x,y not defined in zoomed - Need to fix
    projection.translate([width/3, 700])

    
    // Implement rotation on projection
    d3.select("#sliderRotate").append("div").attr("class","sliderLabel").html("Use this slider to rotate the globe")
    d3.select("#sliderRotate").append("input")
        .attr("type", "range")
        .attr("min", "-220")
        .attr("max", "220")
        .attr("value", "0")
        .on("input",function(){
          var newRotate = this.value
        projection.rotate([newRotate,0])
        d3.selectAll("path.graticule").attr("d",d3.geoPath().projection(projection))
        d3.selectAll("path.countries").attr("d",d3.geoPath().projection(projection));
        });

    // Insert legend - 
    var legend = d3.legendColor()
            .title("GOLD IMPORTS IN 2017 [$]")
            .labelFormat(d3.format(".2s"))
            .labels(d3.legendHelpers.thresholdLabels)
            .scale(colorScale)
            .ascending(true)
            .shapePadding(5)
            .shapeWidth(50)
            .shapeHeight(20)
            .labelOffset(120);

    d3.select("svg")
      .append("g")
      .attr("id","Glegend")
      .style("font-family","Cooper")
      .style("transform","translate(60%,30%)")
      .call(legend)

      // probleme switch G for B, works on tooltip but not legend..
var formatSuffixDecimal2 = d3.format(".2s")
    function formatNum(num){
      return (formatSuffixDecimal2(num).replace("G","B"));
    }
})
}
// Phase 2 - End phase one by loading export and presenting the same exercice => Conclusion : Switzerland is the biggest importer AND exporter of gold worldwide. Leads to visualisation of past 10 years of source of gold for Switzerland and biggest export destination
function Phase2(){
                // d3.selectAll("g#MapGroupe").remove()
                svg.append("text")
                  .attr("x","200")
                  .attr("y","200")
                  .attr("class","wip")
                  .text("Well Done ! Phase Two Coming Soon")
              }

// Work in Progress -> implement responsivness
// d3.select(window)
//         .on("resize", sizeChange);
// // if window.innerWidth<575px rearange
// function sizeChange() {
//   var width = window.innerWidth,
//   newWidth= width/2;
//   svg.attr("width",width);
//   // d3.selectAll("g#MapGroupe").attr("transform","translate(0,0)")
//   d3.selectAll("path.countries").attr("transform", (d) => "translate( ${d.width/2},0)")
  

//   // d3.selectAll("g#MapGroupe").style("transform","translate("+newWdith+",50)")
//   //   console.log(width/2)
// }
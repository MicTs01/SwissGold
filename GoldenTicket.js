// Add hover function with d3 on top logo (can be done through css as well)
d3.select('img')
          .on('mouseover', function() {
            d3.select("img").style("opacity","0.5")
          })
          .on('mouseout', function() {
            d3.select("img").style("opacity","1")
          })

// Create svg inside container and setting width and height
var width = window.innerWidth, 
    height = window.innerHeight,
    svg = d3.select("div#container").append("svg")
      .attr("width", width)
      .attr("height", height)
      ;

  // define format and replace Giga for Billion
    var formatSuffixDecimal2 = d3.format(".2s")
    function formatNum(num){
    return (formatSuffixDecimal2(num).replace("G","B"));
  }

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Phase I of Game
// Delete start button and replace with first layout - all this needs to be delayed to smooth out the transition
function Phase1(){
// Remove button
d3.select("button.buttonStart").transition().duration(500).style("opacity","0").remove()
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
      .translate([width/3, 700])
      // .translate([width/3, height*3/4])
    var data = d3.map();
    // Set tooltip
    var tooltip = d3.select("div.tooltip");

    // Load data and launch function
    d3.queue()
      .defer(d3.json, "../data/world.geojson")
      .defer(d3.csv, "../data/World_Imp.csv", function(d) { data.set(d.country_origin_id, +d.import_val);})
      .await(createMapImport);

    var MapGroupe = svg.append("g").attr("id","MapGroupe")

    function createMapImport (error, countries) {
    // setting up colorScale on threshold basis - These thresholds were choosen based on basic maths... A good option would be to use a root scale, see line 1203 for illustration

    var importColorScale = d3.scaleThreshold()
    .domain([1000000,1000000000,2000000000,4000000000, 9000000000,20000000000, 35000000000,70000000000])
    .range(d3.schemeOrRd[9])

      // Draw the world importation map
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
              if (d.total==""){
                return ("Gainsboro ")
              }
              else{return importColorScale(d.total);}
              
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
                d3.select(this).attr("fill", function (d) {
                  d.total = data.get(d.id) || 0;
                  if (d.total==""){
                    return ("Gainsboro")
                  }
                  else{return importColorScale(d.total);}
                })
                .attr("stroke-width",1);
                          tooltip.classed("hidden", true)
            })
            // Answer for question 1 
            .on("click",function(d,i){
              if (d.id === "CHE"){

                    if (d3.select(this).classed("Question2")){
                        d3.select("div.question")
                          .style("font-size","30px")
                          .html("Yes! That's right ! Switzerland is the biggest importer AND exporter Worldwide.")
                        .call(WorldImpExpConclusion())                       
                    }
                    else{
                      d3.select(this).attr("class","countries Question2")
                      d3.select("div.question")
                        .style("font-size","30px")
                        .html("You're Right. Now try and find the biggest exporter that same year.")
                      .call(BiggestExport());
                    }
              }

              else {
                d3.select("div.question")
                  .style("font-size","30px")
                  .html("Sorry, Try Again")
              }
            })
          // Add two layers of graticule to have the outline append (over the globe) and the fill insert (under the globe/countries) and a third graticule 
          var graticule = d3.geoGraticule();
          MapGroupe.insert("path","path.countries").datum(graticule).attr("class", "globeFill").attr("d", d3.geoPath().projection(projection))
          MapGroupe.insert("path","path.countries").datum(graticule).attr("class", "graticule").attr("d", d3.geoPath().projection(projection))
          MapGroupe.append("path").datum(graticule.outline).attr("class", "graticule outline").attr("d", d3.geoPath().projection(projection))
  
    // Insert legend 
    var legend = d3.legendColor()
    .title("GOLD IMPORTS IN 2017[$]")
    .labelFormat(d3.format(".2s"))
    .labels(d3.legendHelpers.thresholdLabels)
    .scale(importColorScale)
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

    d3.select("svg").append("rect").attr("id","missing").attr("width",50).attr("height",20).attr("x",0).attr("y",260).attr("fill","Gainsboro").attr("stroke","black").attr("stroke-width","0.2").style("transform","translate(60%,30%)")
    d3.select("svg").append("text").attr("id","missing").attr("font-family","Cooper").attr("x",170).attr("y",275).style("transform","translate(60%,30%)").text("0 or missing data")
  

    d3.selectAll("g#Glegend").selectAll("text.label").text(function(d){
      if (d=="70G or more"){
        return "70 Billion or more"
      }
      if (d=="35G to 70G"){
        return "35 Billion to 70 Billion"
      }
      if (d=="20G to 35G"){
        return "20 Billion to 35 Billion"
      }
      if (d=="9.0G to 20G"){
        return "9 Billion to 20 Billion"
      }
      if (d=="4.0G to 9.0G"){
        return "4 Billion to 9 Billion"
      }
      if (d=="2.0G to 4.0G"){
        return "2 Billion to 4 Billion"
      }
      if (d=="1.0G to 2.0G"){
        return "1 Billion to 2 Billion"
      }
      if (d=="1.0M to 1.0G"){
        return "1 Million to 1 Billion"
      }
      if (d=="Less than 1.0M"){
        return "Less than 1 Million"
      }
      else{
        return d
      }
    })
        }

// Change from world import map to world export map
  function BiggestExport(){
  // Remove import legend
  d3.selectAll("g#Glegend").remove()

    d3.queue()
    .defer(d3.csv, "../data/World_Exp.csv", function(d) { data.set(d.country_origin_id, +d.export_val);})
    .await(createMapExport);
    function createMapExport (error, countries) {
    // defining new colorScale on threshold basis. Need to rethink the clusters
    var exportColorScale = d3.scaleThreshold()
    .domain([1000000,1000000000,2000000000,4000000000, 9000000000,20000000000, 35000000000,70000000000])
    // .domain([10000,100000,1000000,10000000, 500000000,35000000000, 50000000000,70000000000])
    .range(d3.schemeGnBu[9])
      // Draw the new map
      MapGroupe.selectAll("path.countries")
            // Change color of countries based on export
            .transition()
            .duration(1000)
            .attr("fill", function (d) {
              d.total = data.get(d.id) || 0;
              if (d.total==""){
                return ("Gainsboro")
              }
              else{return exportColorScale(d.total);}
            })
            // Set tooltip with hover function and country color change on hover
      MapGroupe.selectAll("path.countries").on("mouseover",function(d,i){
                d3.select(this).attr("fill","#f5c373").attr("stroke-width",2);
                      return tooltip.style("hidden", false).html(d.properties.name);
                  })
            .on("mousemove",function(d){
                tooltip.classed("hidden", false)
                      .style("top", (d3.event.pageY) + "px")
                      .style("left", (d3.event.pageX + 10) + "px")
                      .html("country:"+d.properties.name + "<br> Export:"+formatNum(d.total)+" $");
            })
            .on("mouseout",function(d,i){
                d3.select(this).attr("fill", function (d) {
                  d.total = data.get(d.id) || 0;
                  if (d.total==""){
                    return ("Gainsboro")
                  }
                  else{return exportColorScale(d.total);}
                })
                .attr("stroke-width",1);
                          tooltip.classed("hidden", true)
            })
            

      // Insert new legend - 
      var legend = d3.legendColor()
      .title("GOLD EXPORTS IN 2017 [$]")
      .labelFormat(d3.format(".2s"))
      .labels(d3.legendHelpers.thresholdLabels)
      .scale(exportColorScale)
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


  d3.selectAll("g#Glegend").selectAll("text.label").text(function(d){
    if (d=="70G or more"){
      return "70 Billion or more"
    }
    if (d=="35G to 70G"){
      return "35 Billion to 70 Billion"
    }
    if (d=="20G to 35G"){
      return "20 Billion to 35 Billion"
    }
    if (d=="9.0G to 20G"){
      return "9 Billion to 20 Billion"
    }
    if (d=="4.0G to 9.0G"){
      return "4 Billion to 9 Billion"
    }
    if (d=="2.0G to 4.0G"){
      return "2 Billion to 4 Billion"
    }
    if (d=="1.0G to 2.0G"){
      return "1 Billion to 2 Billion"
    }
    if (d=="1.0M to 1.0G"){
      return "1 Million to 1 Billion"
    }
    if (d=="Less than 1.0M"){
      return "Less than 1 Million"
    }
    else{
      return d
    }
  })
  
        }
  }

    // Implement Zoom (max,min) and rotation on projection
    var mapZoom = d3.zoom()
        .scaleExtent([350, 800])
      .on("zoom", zoomed)

    var zoomSettings = d3.zoomIdentity                                        
      .translate(250, 250)
      .scale(350)

    MapGroupe.call(mapZoom).call(mapZoom.transform, zoomSettings)      

    function zoomed() {
        var e = d3.event
        // projection.translate([e.transform.x, e.transform.y]).scale(e.transform.k); 
        projection.scale(e.transform.k); 
        d3.selectAll("path.graticule").attr("d",d3.geoPath().projection(projection))
        d3.selectAll("path.countries").attr("d",d3.geoPath().projection(projection))
        d3.selectAll("path.globeFill").attr("d",d3.geoPath().projection(projection));
            }

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

    function WorldImpExpConclusion(){
      // Remove old elements
    d3.selectAll("g#Glegend").remove()
    d3.select("div.sliderLabel").remove()
    d3.select("input").remove()
    d3.selectAll("#missing").remove()
    // Stop zoom
    MapGroupe.call((mapZoom.on("zoom", null)));

    d3.select("div.button")
      .append("button")
      .attr("class","buttonStart")
      .html("Continue")
      .on("click",fraction)
    
    // Add in background rectangle for future layout
    MapGroupe
      .append("rect")
      .attr("rx",700)
      .attr("ry",700)
      .attr("x",width/3-350)
      .attr("y",48)
      .attr("width",700)
      .attr("height",700)
      .attr("stroke","black")
      .attr("fill","white")
      .style("opacity","0.5")
      .on("click",function(){
        d3.select("rect")
        .transition()
        .duration(500)
        .attr("rx",5)
        .attr("ry",5);
      });

      function fraction(){
        d3.select("button.buttonStart")
          .on("click",checkFraction)
          .html("Submit")

        // Go from circle to square
        MapGroupe.select("rect")        
          .transition()
          .duration(1000)
          .attr("rx",5)
          .attr("ry",5);
          
        // Red overlaying rect to illustrate the fraction
        MapGroupe
          .append("rect")
          .attr("class","fraction")
          .attr("rx",5)
          .attr("ry",5)
          .attr("x",width/3-350)
          .attr("y",748)
          .attr("height",0)
          .attr("width",700)
          .attr("stroke","black")
          .attr("fill","red")
          .style("opacity","0.5")
          .transition().duration(1000)
          .attr("y",398)
          .attr("height",350)

        d3.select("div.question")
          .style("font-size","30px")
          .html("What was Switzerland's market share in global gold trade in 2017 ?")

        // Add slider value
        MapGroupe
          .append("text")
          .attr("class","frac")
          .attr("x",width*2/3)
          .attr("y","350")
          .text("50%")

        // Append slider
        d3.select("#sliderRotate").append("div").attr("class","sliderLabel").html("Give an estimation by using the slider")
        d3.select("#sliderRotate").append("input")
            .attr("type", "range")
            .attr("id","fractionSlider")
            .attr("min", "0")
            .attr("max", "100")
            .attr("value", "50")
            // Change overlapping red rectangle size when slider value changes
            .on("input",function(){
              d3.select("#fractionSlider").attr("value",this.value)
              var newFraction = this.value*7
              d3.select("rect.fraction")
                .transition()
                .duration(1000)
                // Because the rect draws top to bottom, we have to change the height and y attributes
                .attr("height",newFraction)
                .attr("y",748-newFraction)
              d3.select("text.frac").text(this.value+"%")
            });

        // Check fraction function, get value from slider and compare
            function checkFraction(){
              var newValue = parseInt(d3.select("#fractionSlider").attr("value"))
              if(newValue===21){
                d3.select("div.question").html("Correct ! Switzerland's market share in global gold trade is <span class=highlight>21%</span>.<br> Which makes Switzerland the biggest gold trading hub in the world.")
                fractionConclusion()
              }
              else{
                d3.select("div.question").html("Not quite. Switzerland's market share in global gold trade is <span class=highlight>21%</span>.<br> Which makes Switzerland the biggest gold trading hub in the world. ")
                fractionConclusion()
              }
            }

      function fractionConclusion(){
        // Remove precedent layout elements
        d3.select("div.sliderLabel").remove()
        d3.select("input#fractionSlider").remove()
        d3.select("text.frac").remove()
        d3.select("rect.fraction")
        .transition()
        .duration(1000)
          .attr("height",700)
          .attr("y",48)
          .style("opacity",0.7)
        TopFiveImp()
        d3.select("button.buttonStart")
        .on("click",Phase2)
        .html("Continue")
      }
      function TopFiveImp(){
        // Draw Swiss flag with correct proportion
        MapGroupe
          .append("rect")
          .attr("class","cross")
          .attr("x",width/3-(2/11*700/2))
          .attr("y",48+(2/11*700))
          .attr("width",0)
          .attr("height",0)
          .transition()
          .duration(1000)
          .attr("width",2/11*700)
          .attr("height",7/11*700)
          .attr("fill","white")

        MapGroupe
          .append("rect")
          .attr("id","cross")
          .attr("width",0)
          .attr("height",0)
          .transition()
          .duration(1000)
          .attr("x",width/3-(7/11*700/2))
          .attr("y",48+(4.5/11*700))
          .attr("width",7/11*700)
          .attr("height",2/11*700)
          .attr("fill","white")

    
      d3.csv("../data/World_Imp.csv", data => BarChartImp(data))
      d3.csv("../data/World_Exp.csv", data => BarChartExp(data))
      
          function BarChartImp(incomingData){

        // Add missing name to data
            d3.json("../data/world.geojson", function(error,countries){
                var json = countries.features
                json.forEach(function(d, i) {
                  incomingData.forEach(function(e, j) {
                      if (e.country_origin_id === d.id) {
                          e.name = d.properties.name
                      }
                      else if (e.country_origin_id === "HKG") {
                        e.name = "HongKong"
                    }
                  })
                })           
    // Filter for top 5 importer
        var sort = incomingData.sort(function(a,b){return +b.import_val- +a.import_val})
        var filter = sort.filter(function(d,i){return i<5})

    //Append in groups barchart (title, background, rect)
        d3.select("svg")
            .append("g")                                                         
            .attr("id", "impGs")
            .attr("transform", "translate("+width*0.55+",100)")
        
        d3.select("g#impGs")
            .append("rect")
            .attr("width", 500)
            .attr("height",300)
            .attr("x",0)
            .attr("y",0)
            .attr("class","backgroundGraph")

        d3.select("g#impGs")
            .append("text")
            .attr("class","legendTitle")
            .attr("x","5")
            .attr("y","25")
            .text("Top Five Gold Importer [$]")        

        d3.select("g#impGs")
            .selectAll("g")
            .data(filter)
            .enter()
            .append("g")
            .attr("class", "overallG")
            .attr("transform", (d, i) =>"translate(10," + (i * 40+80) + ")")

    //Create scales 
        var teamG = d3.selectAll("g.overallG");    
        var scaleMax = d3.max(filter, filter=>parseInt(filter.import_val))
        var scaleWidth = d3.scaleLinear().domain([0,scaleMax]).range([10,300])

    //Append barchart based on import value
        teamG
          .append("rect")
          .transition().duration(1000)
          .attr("id","barChart")
          .attr("width", filter=>scaleWidth(parseInt(filter.import_val)))
          .attr("height",10)
          .attr("x",120)
          .attr("y",0)
          .style("fill","rgb(180, 11, 11)")
          .style("opacity",1)
        
        teamG
          .append("text")
          .attr("class","graphLabel")
          .attr("x",10)
          .attr("y",11)
          // change for full name country label
          .text(d => d.name)

            
            var xScale = d3.scaleLinear().domain([0, scaleMax]).range([10, 300]);
            var xAxis = d3.axisTop()
            .scale(xScale)
            .tickSize(184)
            .ticks(3)

          d3.select("svg").append("g").attr("id", "xAxisImp").call(xAxis)
          d3.selectAll("#xAxisImp").attr("transform","translate("+(width*0.55+120)+",350)")
          d3.select("g#xAxisImp").select(".domain").remove();

            })


    
            }
            function BarChartExp(incomingData){
              // Filter for 10 first
              d3.json("../data/world.geojson", function(error,countries){
              // Add name to data + correct missing names
                var json = countries.features
                json.forEach(function(d, i) {
                  incomingData.forEach(function(e, j) {
                      if (e.country_origin_id === d.id) {
                          e.name = d.properties.name
                      }
                      else if (e.country_origin_id === "HKG") {
                        e.name = "HongKong"   
                    }
                      if (e.country_origin_id === "USA") {
                      e.name = "USA"   
                  }
                  if (e.country_origin_id === "ARE") {
                    e.name = "Emirates"   
                }
                  })
                }) 

              // filter data for top 5
                  var sort = incomingData.sort(function(a,b){return +b.export_val- +a.export_val})
                  var filter = sort.filter(function(d,i){return i<5})
              
              //Append in groups bar chart (background, title, rect)
                  d3.select("svg")
                      .append("g")                                                         
                      .attr("id", "expGs")
                      .attr("transform", "translate("+width*0.55+",400)")
                  
                  d3.select("g#expGs")
                      .append("rect")
                      .attr("width", 500)
                      .attr("height",300)
                      .attr("x",0)
                      .attr("y",0)
                      .attr("class","backgroundGraph")
              
                  d3.select("g#expGs")
                      .append("text")
                      .attr("class","legendTitle")
                      .attr("x","5")
                      .attr("y","25")
                      .text("Top Five Gold Exporter [$]")        
              
                  d3.select("g#expGs")
                      .selectAll("g")
                      .data(filter)
                      .enter()
                      .append("g")
                      .attr("class", "overallExpG")
                      .attr("transform", (d, i) =>"translate(10," + (i * 40+80) + ")")
              
              //Create scales 
                  var expG = d3.selectAll("g.overallExpG");    
                  var scaleMax = d3.max(filter, filter=>parseInt(filter.export_val))
                  var scaleWidth = d3.scaleLinear().domain([0,scaleMax]).range([10,300])
              
              //Append barchart based on export value while parsing  
                  expG
                  .append("rect")
                  .attr("id","barChart")
                  .transition().duration(1000)
                  .attr("width", filter=>scaleWidth(parseInt(filter.export_val)))
                  .attr("height",10)
                  .attr("x",120)
                  .attr("y",0)
                  .style("fill","rgb(48, 151, 199)")
                  .style("opacity",1)
              
 
              
                   expG
                    .append("text")
                    .attr("class","graphLabel")
                    .attr("x",10)
                    .attr("y",11)
                    // change for full name country label
                    .text(d => d.name)
                      var xScale = d3.scaleLinear().domain([0, scaleMax]).range([10, 300]);
                      var xAxis = d3.axisTop()
                      .scale(xScale)
                        .tickSize(184)
                        .ticks(3)

                    d3.select("svg").append("g").attr("id", "xAxisExp").call(xAxis)
                    d3.selectAll("#xAxisExp").attr("transform","translate("+(width*0.55+120)+",650)")
                    d3.select("g#xAxisExp").select(".domain").remove();
              })
                          }
            }
      }
    }
  })
}

// Phase 2 - Swiss Import and Export
function Phase2(){
                d3.select("div.question").html("In 2012, almost half of the gold exchanged worldwide went through Switzerland.")
                // Remove phase 1 elements
                d3.selectAll("rect#barChart").transition().duration(1000).attr("height",0).attr("width",0)
                d3.select("g#impGs").transition().delay(400).remove()
                d3.select("g#xAxisImp").transition().delay(400).remove()
                d3.select("g#expGs").transition().delay(400).remove()
                d3.select("g#xAxisExp").transition().delay(400).remove()

                sleep(650).then(() => {
                svg.append("g")
                  .attr("id", "Phase2")
                  .append("text")
                  .attr("id", "Phase2")
                  .attr("class","bigText")
                  .attr("x",width*0.55)
                  .attr("y","70")
                  .text("«Four of the biggest gold refineries")
                svg.append("g")
                  .append("text")
                  .attr("id", "Phase2")
                  .attr("class","bigText")
                  .attr("x",width*0.55)
                  .attr("y","105")
                  .text("in the world are based in Switzerland.")

                d3.select("g#Phase2")
                  .append("text")
                  .attr("id", "Phase2")
                  .attr("class","bigText")
                  .attr("x",width*0.55)
                  .attr("y","165")
                  .text("These facilities refine almost")

                d3.select("g#Phase2")
                  .append("text")
                  .attr("id", "Phase2")
                  .attr("class","bigText highlight")
                  .attr("x",width*0.55)
                  .attr("y","200")
                  .text("two-thirds of the world’s gold.»*")

                  // Source : Nguyen, Duc-Quang & Mariani, Daniele (Mai 2015), "Counting Gold in Switzerland", [Online] URL : https://www.swissinfo.ch/fre/commerce-international_c-est-l-or-le-v%C3%A9ritable-embl%C3%A8me-de-la-suisse/41401136

                d3.select("button").on("click",function(){
                  d3.selectAll("path.globeFill").remove()
                  d3.selectAll("path.countries").remove()
                  d3.selectAll("path.graticule").remove()
                  d3.selectAll("rect").transition().duration(500).attr("height",0).attr("width",0)
                  d3.select("g#MapGroupe").transition().delay(350).remove()
                  d3.selectAll("text#Phase2")
                  .transition().duration(1000)
                  .attr("y","1000")
                  .remove()
                  d3.select("div.question").html("But where does Switzerland's gold come from ?")
                  sleep(350).then(()=>{
                  d3.queue()
                  .defer(d3.json, "../data/world.geojson")
                  .defer(d3.csv, "../data/Switzerland_Imp.csv")
                  .await(createSwissImport);
                })
                })
              })

                var projectionImp = d3.geoNaturalEarth1()
                .scale(150)
                .center([180,-60])
                .translate([width/2, 470])
              
              // Set tooltip
              var tooltip = d3.select("div.tooltip");
              var MapGroupe = svg.append("g").attr("id","MapGroupe")

              // Set year selector to 2017
              var selectedYear = "2017"
          
        function createSwissImport(error, countries,data){
// Top ten countries exporting gold to Switzerland
        var top = data.filter(function(d){ return d.year == selectedYear})
        var sort = top.sort(function(a,b){return +b.import_val- +a.import_val})
        var filter = sort.filter(function(d,i){return i<10})

        countries.features.forEach(function(d,i){
          filter.forEach(function(e,j){
            if (e.country_origin_id === d.id) {
              e.name = d.properties.name
          }
          else if (e.country_origin_id === "HKG") {
            e.name = "HongKong"
        }
          })
        })
        
          
      var formatSuffixDecimal2 = d3.format(".2s")
      function formatNum(num){
        return (formatSuffixDecimal2(num).replace("G","B"));
      }
                
      // Draw Swiss importation map 

                      var newMap=MapGroupe.selectAll("path")
                          .data(countries.features)
                          .enter()
                          .append("path")
                            // draw each country
                            .attr("class", "countries")
                            .attr("d", d3.geoPath()
                              .projection(projectionImp))
                            .attr("fill","rgb(255,233,204)")

                      var scaleMax = d3.max(filter, filter=>parseInt(filter.import_val))
                      var scaleMin = d3.min(filter, filter=>parseInt(filter.import_val))
                      var scaleRadius = d3.scaleLinear().domain([scaleMin,scaleMax]).range([10,35])


                      MapGroupe.selectAll("circle")
                            .data(filter)
                            .enter()
                            .append("circle")
                            .attr("class","dotMap")
                            .attr("r", filter=>scaleRadius(parseInt(filter.import_val)))
                            .attr("transform", function(d) {
                              for (var i = 0; i < newMap.data().length; i++){
                                var p = newMap.data()[i];
                                if (p.id === d["country_origin_id"]){
                                  var t = d3.geoPath()
                                  .projection(projectionImp).centroid(p);
                                  return "translate(" + t + ")";
                                }
                                if ("HKG" === d["country_origin_id"]){;
                                  // math to find x coordinate for Hong Kong
                                  var HKGwidth=880-((942.5+17.5)-width/2)
                                  return "translate("+HKGwidth+",257)";
                                }
                              }
                            })

                            MapGroupe.selectAll("circle.dotMap").attr("fill","blue"  )
                            .on("mouseover",function(d,i){
                              d3.select(this).attr("fill","#f5c373");
                                    return tooltip.style("hidden", false).html(d.name);
                                })
                            .on("mousemove",function(d){
                                tooltip.classed("hidden", false)
                                      .style("top", (d3.event.pageY) + "px")
                                      .style("left", (d3.event.pageX + 10) + "px")
                                      .html("Country: "+d.name+ "<br> Percentage: "+formatNum(d.import_val_pct)+"%<br> Value: "+formatNum(d.import_val));
                            })
                            .on("mouseout",function(d,i){
                                d3.select(this).attr("fill", "blue") 
                                          tooltip.classed("hidden", true)
                            })

                            var graticule = d3.geoGraticule();
                            MapGroupe.append("path").datum(graticule.outline).attr("class", "graticule outline mapFill").attr("d", d3.geoPath().projection(projectionImp)).lower()
                            MapGroupe.insert("path","path.countries").datum(graticule).attr("class", "graticule").attr("d", d3.geoPath().projection(projectionImp))
                    
                    
                    MapGroupe.append("text").attr("id","Phase2")
                    .attr("class","dotMapTitle")
                    .attr("x",width*0.55)
                    .attr("y","-100")
                    .text("Top ten countries Switzerland's importing gold from")
                    d3.select("text#Phase2").transition().duration(500).attr("y","70")
                    d3.select("text#Phase2").transition().duration(600).delay(500).attr("x",width*0.33)
                        
                   MapGroupe.append("g")
                            .attr("id","legendDots")
                            .attr("transform","translate("+width*0.55+",100)");

                    var legendDots=d3.select("g#legendDots")

                    legendDots.append("circle")
                    .attr("class","dotMapLegend")
                    .attr("r","35")
                    .attr("cx","0")
                    .attr("cy","35")
                    .attr("fill","blue")

                    legendDots.append("circle")
                    .attr("class","dotMapLegend")
                    .attr("r","25")
                    .attr("cx","0")
                    .attr("cy","45")
                    .attr("fill","blue")

                    legendDots.append("circle")
                    .attr("class","dotMapLegend")
                    .attr("r","15")
                    .attr("cx","0")
                    .attr("cy","55")
                    .attr("fill","blue")

                    legendDots.append("line")
                    .attr("class","lineMapLegend")
                    .attr("x1","0")
                    .attr("y1","0")
                    .attr("x2","70")
                    .attr("y2","0")
                 
                    legendDots.append("line")
                    .attr("class","lineMapLegend")
                    .attr("x1","0")
                    .attr("y1","20")
                    .attr("x2","70")
                    .attr("y2","20")

                    legendDots.append("line")
                    .attr("class","lineMapLegend")
                    .attr("x1","0")
                    .attr("y1","40")
                    .attr("x2","70")
                    .attr("y2","40")  

                    legendDots.append("text")
                    .attr("class","dotMapLabel")
                    .attr("x","70")
                    .attr("y","0")
                    .text("15 Billion $")

                    legendDots.append("text")
                    .attr("class","dotMapLabel")
                    .attr("x","70")
                    .attr("y","20")
                    .text("10 Billion $")

                    legendDots.append("text")
                    .attr("class","dotMapLabel")
                    .attr("x","70")
                    .attr("y","40")
                    .text("5 Billion $")

                      MapGroupe.append("text")
                      .attr("class","bigText")
                      .attr("x",width*0.55)
                      .attr("y","310")
                      .text("«However, the statistics do not fully shed light")
                      MapGroupe.append("text")
                      .attr("class","bigText")
                      .attr("x",width*0.55)
                      .attr("y","345")
                      .text("on the actual countries of origin. Swiss customs")
                      MapGroupe.append("text")
                      .attr("class","bigText")
                      .attr("x",width*0.55)
                      .attr("y","380")
                      .text("only report the last transit country.")
                      MapGroupe.append("text")
                      .attr("class","bigText")
                      .attr("x",width*0.55)
                      .attr("y","435")
                      .text(" This explains Britain's importance, given that the")
                      MapGroupe.append("text")
                      .attr("class","bigText")
                      .attr("x",width*0.55)
                      .attr("y","470")
                      .text("London Bullion Market Association is the world's")
                      MapGroupe.append("text")
                      .attr("class","bigText")
                      .attr("x",width*0.55)
                      .attr("y","505")
                      .text("leading centre for gold and silver trading.»*")
                      // Source : Nguyen, Duc-Quang & Mariani, Daniele (Mai 2015), "Counting Gold in Switzerland", [Online] URL : https://www.swissinfo.ch/fre/commerce-international_c-est-l-or-le-v%C3%A9ritable-embl%C3%A8me-de-la-suisse/41401136


                      d3.select("button").on("click",function(){
                        d3.selectAll("circle.dotMap").transition().duration(300).attr("r",0).remove()
                        d3.csv("../data/Switzerland_Exp.csv", data => createSwissExport(data))

                  // Create dataviz for Swiss Export 
                  function createSwissExport(incomingData){

                  d3.select("div.question").html("And where does it go ?")

                          var Etop = incomingData.filter(function(d){ return d.year == selectedYear})
                          var Esort = Etop.sort(function(a,b){return +b.export_val- +a.export_val})
                          var Efilter = Esort.filter(function(d,i){return i<10})

                          MapGroupe.selectAll("circle.dotMapLegend").transition().duration(1000).attr("fill","red")

                          // Add missing names in json file
                          countries.features.forEach(function(d,i){
                            Efilter.forEach(function(e,j){
                              if (e.country_destination_id === d.id) {
                                e.name = d.properties.name
                            }
                            else if (e.country_destination_id === "HKG") {
                              e.name = "HongKong"
                          }
                            else if(e.country_destination_id ==="SGP"){
                              e.name = "Singapor"
                            }
                            })
                          })

                          sleep(300).then(() => {

                          // Update circle 
                          var circledotMap = MapGroupe.selectAll("circle.dotMap").data(Efilter)

                          circledotMap.enter()
                          .append("circle")
                          .attr("class","dotMap")
                          .attr("r",0)
                          .attr("transform", function(d) {
                            for (var i = 0; i < newMap.data().length; i++){
                              var p = newMap.data()[i];
                              if (p.id === d["country_destination_id"]){
                                var t = d3.geoPath()
                                .projection(projectionImp).centroid(p);
                                return "translate(" + t + ")";
                              }
                              if ("HKG" === d["country_destination_id"]){;
                                // math to find x coordinate for Hong Kong
                                var HKGwidth=880-((942.5+17.5)-width/2)
                                return "translate("+HKGwidth+",257)";
                              }
                              if ("SGP" === d["country_destination_id"]){;
                                // math to find x coordinate for Singapor
                                var SGPwidth=865-((942.5+17.5)-width/2)
                                return "translate("+SGPwidth+",310)";
                              }
                            }
                          })
                          .transition()
                          .duration(1000)
                          .attr("r", Efilter=>scaleRadius(parseInt(Efilter.export_val)))
                          .attr("fill","red")

                          circledotMap.transition().duration(250)
                          .attr("r", Efilter=>scaleRadius(parseInt(Efilter.export_val)))
                          .attr("transform", function(d) {
                            for (var i = 0; i < newMap.data().length; i++){
                              var p = newMap.data()[i];
                              if (p.id === d["country_destination_id"]){
                                var t = d3.geoPath()
                                .projection(projectionImp).centroid(p);
                                return "translate(" + t + ")";
                              }
                              if ("HKG" === d["country_destination_id"]){;
                                // math to find x coordinate for Hong Kong
                                var HKGwidth=880-((942.5+17.5)-width/2)
                                return "translate("+HKGwidth+",257)";
                              }
                              if ("SGP" === d["country_destination_id"]){;
                                // math to find x coordinate for Singapor
                                var SGPwidth=865-((942.5+17.5)-width/2)
                                return "translate("+SGPwidth+",310)";
                              }
                            }
                          })
                          
                          MapGroupe.selectAll("circle.dotMap").on("mouseover",function(d,i){
                              d3.select(this).attr("fill","#f5c373");
                                    return tooltip.style("hidden", false).html(d.name);
                                })
                            .on("mousemove",function(d){
                                tooltip.classed("hidden", false)
                                      .style("top", (d3.event.pageY) + "px")
                                      .style("left", (d3.event.pageX + 10) + "px")
                                      .html("Country: "+d.name+ "<br> Percentage: "+formatNum(d.export_val_pct)+"%<br> Value: "+formatNum(d.export_val));
                            })
                            .on("mouseout",function(d,i){
                                d3.select(this).attr("fill", "red") 
                                          tooltip.classed("hidden", true)
                            })

                          MapGroupe.append("text").attr("id","Phase2")
                          .attr("class","dotMapTitle")
                          d3.select("text.dotMapTitle").text("Top ten countries Switzerland's exporting gold to ")
                          })
                        }
                        d3.select("button").on("click",Phase3)
                      })
                    }
                }

function Phase3(){
// Remove Phase 2 
        d3.select("div.question").html("</br>Now you know Switzerland plays a central role in the global gold trade. </br> </br> </br> <a href='https://www.publiceye.ch/en/topics/commodities-trading/togolese-gold'>Click here to know more on Human rights implication of swiss gold trad</a></br></br> OR </br></br> Have a look at the gold trade for the past ten years.")
        d3.selectAll("circle.dotMap").remove()
        d3.selectAll("g#MapGroupe").selectAll("path").remove()
        d3.selectAll("g#Phase2").remove()
        d3.selectAll("g#MapGroupe").selectAll("text.bigText").remove()
        d3.select("g#legendDots").remove()
        d3.select("button").on("click",LayoutPhase3)
        d3.select("text#Phase2").remove()

        var MapGroupe = svg.append("g").attr("id","MapGroupe")
        var data = d3.map();

// Place empty layer for later data population (map, barchart,plotgraph) and add buttons
function LayoutPhase3(){
  d3.select("button").transition().duration(200).style("opacity","0").remove()
  d3.select("text#Phase2").remove()
  d3.select("div.question").html("Pick a year and click on a button")
  d3.select("div#more").append("a").attr("text-align","right").attr("href","https://www.publiceye.ch/en/topics/commodities-trading/togolese-gold").html("Human right's implication of Swiss Gold Trade")

        d3.queue()
        .defer(d3.json, "../data/world.geojson")
        .await(createBaseMap);

        function createBaseMap(error,countries){
        // Add button
        d3.select("div.button")
        .append("button")
        .attr("class","buttonStart")
        .html("World Importation")
        .on("click", Step1a)

        d3.select("div.button")
        .append("button")
        .attr("class","buttonStart")
        .html("World Exportation")
        .on("click", Step1b)

        var tooltip = d3.select("div.tooltip");

        var yearList = ["2017","2016","2015","2014","2013","2012","2011","2010","2009","2008"]

        var yearSet="2017"

        var yearSelector = d3.select("#sliderRotate").append("select")
        .attr("name", "name-list")
        .attr("id","yearSelector")
          .on("change", function(){yearSet = this.options[this.selectedIndex].text})
        
        var option = yearSelector.selectAll("option")
                                  .data(yearList)
                                  .enter()
                                  .append("option");

        option.text(function(d){return d})
              .attr("value",(function(d){return d}))

        // Map START
        var projectionImp = d3.geoNaturalEarth1()
        .scale(150)
        .center([180,-60])
        .translate([width/2, 470])
        
        var newMap=MapGroupe.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
          // draw each country
          .attr("class", "countries")
          .attr("d", d3.geoPath()
            .projection(projectionImp))
          .attr("fill","rgb(255,233,204)")

        var graticule = d3.geoGraticule();
          MapGroupe.append("path").datum(graticule.outline).attr("class", "graticule outline mapFill").attr("d", d3.geoPath().projection(projectionImp)).lower()
          MapGroupe.insert("path","path.countries").datum(graticule).attr("class", "graticule").attr("d", d3.geoPath().projection(projectionImp))
        
        // Map END
        // BarChart START
        d3.select("svg")
        .append("g")                                                         
        .attr("id", "impGs")
        .attr("transform", "translate("+width*0.55+",100)")
    
        d3.select("g#impGs")
            .append("rect")
            .attr("width", 500)
            .attr("height",300)
            .attr("x",0)
            .attr("y",0)
            .style("opacity",0.3)
            .attr("class","backgroundGraph")

        d3.select("g#impGs")
            .append("text")
            .attr("class","legendTitle")
            .attr("x","5")
            .attr("y","25")
            .text("")   

        var rows =[1,2,3,4,5]

        d3.select("g#impGs")
            .selectAll("g")
            .data(rows)
            .enter()
            .append("g")
            .attr("class", "overallG")
            .attr("transform", (d, i) =>"translate(10," + (i * 40+80) + ")")

        var teamG = d3.selectAll("g.overallG");  

        teamG
            .append("rect")
            .attr("id","barChart")
            .attr("width", 0)
            .attr("height",10)
            .attr("x",120)
            .attr("y",0)

        teamG
              .append("text")
              .attr("class","graphLabel")
              .attr("x",10)
              .attr("y",11)
              .text("")

// BarChart END
// Scatterplot START

var spmargin = {top: 10, right: 30, bottom: 30, left: 60}
    spwidth = 500 - spmargin.left - spmargin.right
    spheight = 300 - spmargin.top - spmargin.bottom;

var SPsvg = d3.select("svg")
    .append("g")
    .attr("id","scatterplot")
      .attr("transform",
            "translate("+width*0.6+",450)");

            var xScale = d3.scaleTime().domain([2007,2017]).range([0,spwidth])
            var yScale = d3.scaleLinear().domain([0,100000000000]).range([spheight,0])

            var valSet =""

            SPsvg
            .append("text")
            .attr("id","scatterplotTitle")
            .attr("class","legendTitle")
            .attr("x","-100")
            .attr("y","-10")
            .text("")   
          

            SPsvg.append("g")
            .attr("transform", "translate(0," + spheight + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
             
            SPsvg.append("g")
            .attr("id","yaxis")
            .call(d3.axisLeft(yScale));

            var yearCircle = SPsvg.append("circle")
            .attr("id","highlight")
            .attr("cx", function(d) {return xScale(2017) } )
            .attr("cy", function(d) {return yScale(260) } )
            .attr("r", 5)
            .attr("fill", "steelblue")
            .style("opacity",0)

            
            SPsvg.append("g")
            .selectAll("dot")
            .data(yearList)
            .enter()
            .append("circle")
              .attr("id","scatterplot")
              .attr("cx", function(d) { return xScale(d) } )
              .attr("cy",260)
              .attr("r", 5)
              .style("opacity",0)

          SPsvg.append("path")
          .attr("id","scatterplot")
          .attr("fill","none")
          .attr("stroke", "rgb(180, 11, 11)")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(function(d) { return xScale(yearList) })
            .y(function(d) { return yScale(0) })
            )
          // Scatterplot END
          // Step 1a - World Map import + top 5 bar chart + Scatterplot
          function Step1a(){         
            d3.queue()
          .defer(d3.csv, "../data/World_Imp_Full.csv")
          .await(WorldImp);

              function WorldImp (error,incomingData) {
                d3.selectAll("#xAxisImp").transition().duration(100).style("opacity",0).remove()
                d3.selectAll("g#Glegend").remove()
    


              var newincomingData = incomingData.filter(function(d,i){console.log(yearSet); return d.year===yearSet})
              var json = countries.features
                  newincomingData.forEach(function(d, i) {
                    json.forEach(function(e, j) {
                        if (e.id === d.country_origin_id) {
                            e.properties.import_val = d.import_val
                        }
                    })
                  })


// defining new colorScale on threshold basis. Need to rethink the clusters
var importColorScale = d3.scaleThreshold()
.domain([10000,1093750000,2187500000,4375000000, 8750000000,17500000000, 35000000000,70000000000])
.range(d3.schemeOrRd[9])

                // Draw the new map
                MapGroupe.selectAll("path.countries")
                      // Change color of countries based on export
                      .transition()
                      .duration(1000)
                      .attr("fill", function(d){
                        if (typeof d.properties.import_val!=="undefined"){
                          return importColorScale(d.properties.import_val)
                        }
                        else{
                          d.properties.import_val=0
                          return importColorScale(0)}
                      })

                      MapGroupe.selectAll("path.countries")
                      .on("mouseover",function(d,i){
                        d3.select(this).attr("fill","#f5c373").attr("stroke-width",2);
                              return tooltip.style("hidden", false).html(d.properties.name);
                          })
                      .on("mousemove",function(d){
                        tooltip.classed("hidden", false)
                              .style("top", (d3.event.pageY) + "px")
                              .style("left", (d3.event.pageX + 10) + "px")
                              .html("country:"+d.properties.name + "<br> Import:"+formatNum(d.properties.import_val)+" $");
                    })
                    .on("mouseout",function(d,i){
                        d3.select(this).attr("fill", function(d){
                          if (typeof d.properties.import_val!=="undefined"){
                            return importColorScale(d.properties.import_val)
                          }
                          else{
                            return importColorScale(0)}
                        })
                        .attr("stroke-width",1);
                                  tooltip.classed("hidden", true)
                    })

                // Filter for 5 first
                    var sort = json.sort(function(a,b){return +b.properties.import_val- +a.properties.import_val})
                    var filter = sort.filter(function(d,i){return i<5})

                //Append in groups 
                    d3.select("text.legendTitle")
                        .text("Top Five Gold Importer [$]")        
            
                //Create scales 
                    var scaleMax = parseInt(filter[0].properties.import_val)
                    var scaleWidth = d3.scaleLinear().domain([0,scaleMax]).range([10,300])
            
               // Shorten name
                filter.forEach(function(e, j) {

                    if (e.id === "USA") {
                    e.properties.name = "USA"   
                }
                if (e.id === "ARE") {
                  e.properties.name = "Emirates"   
              }
            })

                    teamG
                      .data(filter)
                      .select("text.graphLabel")
                      .transition().duration(400)
                      .text(d=>d.properties.name)

                    teamG
                    .data(filter)
                      .select("rect#barChart")
                      .transition().duration(1000)
                      .attr("width", function(d){return scaleWidth(parseInt(d.properties.import_val))})
                      .attr("height",10)
                      .style("fill","rgb(180, 11, 11)")
                      
                //Scales + gradation de graduation 
                var xScale = d3.scaleLinear().domain([0, scaleMax]).range([10, 300]);
                var xAxis = d3.axisTop()
                .scale(xScale)
                .tickSize(184)
                .ticks(3)
            
                d3.select("svg").append("g").attr("id", "xAxisImp").call(xAxis)
                d3.selectAll("#xAxisImp").attr("transform","translate("+(width*0.55+120)+",350)")
                d3.select("g#xAxisImp").select(".domain").remove();

                                      // Insert legend 
              var legend = d3.legendColor()
              .title("GOLD IMPORTS IN "+yearSet+"[$]")
              .labelFormat(d3.format(".2s"))
              .labels(d3.legendHelpers.thresholdLabels)
              .scale(importColorScale)
              .ascending(true)
              .shapePadding(0)
              .shapeWidth(50)
              .shapeHeight(10)
              .labelOffset(10);

              d3.select("svg")
              .append("g")
              .attr("id","Glegend")
              .style("font-family","Cooper")
              .attr("transform","translate("+width*0.2+",550)")
              .call(legend)


           // Filter data
            var plotfilter = incomingData.filter(function(d,i){return d.country_origin_id==="CHE"})

            var xScale = d3.scaleTime().domain([2007,2017]).range([0,spwidth])
            var plotscaleMax = d3.max(plotfilter, plotfilter=>parseInt(plotfilter.import_val))
            var yScale = d3.scaleLinear().domain([0,plotscaleMax]).range([spheight,0])


            
            d3.selectAll("g#yaxis")
            .transition().duration(400)
            .call(d3.axisLeft(yScale));

            SPsvg.selectAll("text#scatterplotTitle")
                    .text("Switzerland's gold import since 2008 [$]")
            
            // Add the line
            SPsvg.selectAll("path#scatterplot")
                  .datum(plotfilter)
                  .transition().duration(400)
                  .attr("stroke", "rgb(180, 11, 11)")
                  .attr("d", d3.line()
                    .x(function(d) { return xScale(d.year) })
                    .y(function(d) { return yScale(d.import_val) })
                    )
                // Add pulsing circle to current year on scatter plot

                

                plotfilter.forEach(function(d,i){
                  if(yearSet===d.year){
                valSet=d.import_val
                  }
                })

                yearCircle
                .data(plotfilter)
                .attr("id","highlight")
                .attr("cx", function(d) { return xScale(yearSet) } )
                .attr("cy", function(d) { return yScale(valSet) } )
                .attr("r", 8)
                .attr("fill", "DarkRed")
                .style("opacity",0.7)
              
                repeat()
              
                function repeat(){
                  yearCircle
                  .attr("r",5)
                  .style("opacity",0.7)
                  .transition()        
                  .duration(1500)      
                  .attr("r",20)
                  .style("opacity",0)
                 .on("end", repeat);  
                }

                // update data on circle for the scatter plot
                SPsvg.selectAll("circle#scatterplot")
                .data(plotfilter)
                .transition().duration(400)
                  .attr("cy", function(d) { return yScale(d.import_val) } )
                  .attr("r",5)
                  .attr("fill", function(d){return importColorScale(d.import_val)})
                  .style("opacity",1)

                 
                d3.selectAll("circle#scatterplot") 
                  .on("mouseover",function(d,i){
                    d3.select(this).transition().duration(200).attr("fill","#f5c373").attr("r", 20).style("opacity","0.8");
                          return tooltip.style("hidden", false);
                      })
                  .on("mousemove",function(d){
                      tooltip.classed("hidden", false)
                            .style("top", (d3.event.pageY) + "px")
                            .style("left", (d3.event.pageX + 10) + "px")
                            .html("Year: "+d.year+"</br>Value: $"+formatNum(d.import_val)+"</br>Percent of world trade: "+d.import_val_pct);
                  })
                  .on("mouseout",function(d,i){
                      d3.select(this).attr("fill", function(d){return importColorScale(d.import_val)}).transition().duration(200).attr("r",5).style("opacity","1")
                                tooltip.classed("hidden", true)
                  })
                  
                  // Change legend label
                  d3.selectAll("g#Glegend").selectAll("text.label").text(function(d){
                    if (d=="70G or more"){
                      return "70 Billion or more"
                    }
                    if (d=="35G to 70G"){
                      return "35 Billion to 70 Billion"
                    }
                    if (d=="20G to 35G"){
                      return "20 Billion to 35 Billion"
                    }
                    if (d=="9.0G to 20G"){
                      return "9 Billion to 20 Billion"
                    }
                    if (d=="4.0G to 9.0G"){
                      return "4 Billion to 9 Billion"
                    }
                    if (d=="2.0G to 4.0G"){
                      return "2 Billion to 4 Billion"
                    }
                    if (d=="1.0G to 2.0G"){
                      return "1 Billion to 2 Billion"
                    }
                    if (d=="1.0M to 1.0G"){
                      return "1 Million to 1 Billion"
                    }
                    if (d=="Less than 1.0M"){
                      return "Less than 1 Million"
                    }
                    else{
                      return d
                    }
                  })
                  
                    



                
                }
          }

          // Step 1b - World Map export + top 5 bar chart
          function Step1b(){

            d3.queue()
            .defer(d3.csv, "../data/World_Exp_Full.csv")
            .await(WorldExp);
            function WorldExp (error, incomingData) {
              d3.selectAll("#xAxisImp").transition().duration(100).style("opacity",0).remove()
              d3.selectAll("g#Glegend").remove()
            // defining new colorScale on threshold basis. Need to rethink the clusters
            var exportColorScale = d3.scaleThreshold()
            .domain([1000000,1000000000,2000000000,4000000000, 9000000000,20000000000, 35000000000,70000000000])
            .range(d3.schemeGnBu[9])
            
            var newincomingData = incomingData.filter(function(d,i){return d.year===yearSet})
            var json = countries.features
            newincomingData.forEach(function(d, i) {
              json.forEach(function(e, j) {
                  if (e.id === d.country_origin_id) {
                      e.properties.export_val = d.export_val
                  }
              });
           })

            // Change color of countries based on export
              MapGroupe.selectAll("path.countries")
                    .transition()
                    .duration(1000)
                    .attr("fill", function(d){
                      if (typeof d.properties.export_val!=="undefined"){
                        return exportColorScale(d.properties.export_val)
                      }
                      else{
                        d.properties.export_val=0
                        return exportColorScale(0)}
                    })

              // Set tooltip
              MapGroupe.selectAll("path.countries")
                    .on("mouseover",function(d,i){
                      d3.select(this).attr("fill","#f5c373").attr("stroke-width",2);
                            return tooltip.style("hidden", false).html(d.properties.name);
                        })
                    .on("mousemove",function(d){
                      tooltip.classed("hidden", false)
                            .style("top", (d3.event.pageY) + "px")
                            .style("left", (d3.event.pageX + 10) + "px")
                            .html("country:"+d.properties.name + "<br> Export:"+formatNum(d.properties.export_val)+" $");
                  })
                  .on("mouseout",function(d,i){
                      d3.select(this).attr("fill", function(d){
                        if (typeof d.properties.export_val!=="undefined"){
                          return exportColorScale(d.properties.export_val)
                        }
                        else{
                          return exportColorScale(0)}
                      })
                      .attr("stroke-width",1);
                                tooltip.classed("hidden", true)
                  })
                  
                  var sort = json.sort(function(a,b){return +b.properties.export_val- +a.properties.export_val})
                  var filter = sort.filter(function(d,i){return i<5})

                  d3.select("text.legendTitle")
                  .text("Top Five Gold Exporter [$]")    

                  var scaleMax = parseInt(filter[0].properties.export_val)
                  var scaleWidth = d3.scaleLinear().domain([0,scaleMax]).range([10,300])

                  filter.forEach(function(e, j) {

                    if (e.id === "USA") {
                    e.properties.name = "USA"   
                }
                if (e.id === "ARE") {
                  e.properties.name = "Emirates"   
              }
            })


              // barChart
              d3.selectAll("rect#barChart")
              .data(filter)
              .transition().duration(1000)
              .style("fill","rgb(48, 151, 199)")
              .attr("width", filter=>scaleWidth(parseInt(filter.properties.export_val)))

              teamG
              .data(filter)
              .select("text.graphLabel")
                // change for full name country label
                .text(d=>d.properties.name)

              //Create scales 
              var scaleMax = parseInt(filter[0].properties.export_val)
              var scaleWidth = d3.scaleLinear().domain([0,scaleMax]).range([10,300])

              //Scales + gradation de graduation 
              var xScale = d3.scaleLinear().domain([0, scaleMax]).range([10, 300]);
              var xAxis = d3.axisTop()
              .scale(xScale)
              .tickSize(184)
              .ticks(3)
          
              d3.select("svg").append("g").attr("id", "xAxisImp").call(xAxis)
              d3.selectAll("#xAxisImp").attr("transform","translate("+(width*0.55+120)+",350)")
              d3.select("g#xAxisImp").select(".domain").remove();

              var legend = d3.legendColor()
              .title("GOLD EXPORTS IN "+yearSet+"[$]")
              .labelFormat(d3.format(".2s"))
              .labels(d3.legendHelpers.thresholdLabels)
              .scale(exportColorScale)
              .ascending(true)
              .shapePadding(0)
              .shapeWidth(50)
              .shapeHeight(10)
              .labelOffset(10);

              d3.select("svg")
              .append("g")
              .attr("id","Glegend")
              .style("font-family","Cooper")
              .attr("transform","translate("+width*0.2+",550)")
              .call(legend)

            // Filter for Swiss only data
            var plotfilter = incomingData.filter(function(d,i){return d.country_origin_id==="CHE"})
            console.log(plotfilter)
            var xScale = d3.scaleTime().domain([2007,2017]).range([0,spwidth])
            var plotscaleMax = d3.max(plotfilter, plotfilter=>parseInt(plotfilter.export_val))
            var yScale = d3.scaleLinear().domain([0,plotscaleMax]).range([spheight,0])

            // Update axis
            SPsvg.selectAll("g#yaxis")
            .transition().duration(400)
            .call(d3.axisLeft(yScale));
            
            SPsvg.selectAll("text#scatterplotTitle")
                    .text("Switzerland's gold exports since 2008")

            SPsvg.selectAll("path#scatterplot")
                  .datum(plotfilter)
                  .transition().duration(400)
                  .attr("stroke", "rgb(48, 151, 199)")
                  .attr("d", d3.line()
                  .x(function(d) { return xScale(d.year) })
                  .y(function(d) { return yScale(d.export_val) })
                    ) 

            // Add pulsing circle to current year on scatter plot

          
            plotfilter.forEach(function(d,i){
              if(yearSet===d.year){
            valSet=d.export_val
              }
            })

            yearCircle
            .data(plotfilter)
            .attr("id","highlight")
            .attr("cx", function(d) { return xScale(yearSet) } )
            .attr("cy", function(d) { return yScale(valSet) } )
            .attr("r", 8)
            .attr("fill", "SteelBlue")
            .style("opacity",0.7)
          
            repeat()
          
            function repeat(){
              yearCircle
              .attr("r",5)
              .style("opacity",0.7)
              .transition()        
              .duration(1500)      
              .attr("r",20)
              .style("opacity",0)
             .on("end", repeat);  
            }


            // update data on circle for the scatter plot
            SPsvg.selectAll("circle#scatterplot")
                    .data(plotfilter)
                    .transition().duration(400)
                    .attr("cy", function(d) { return yScale(d.export_val) } )
                    .attr("r", 5)
                    .attr("fill", function(d){return exportColorScale(d.export_val)})
                    .style("opacity",1)

            d3.selectAll("circle#scatterplot")
                    .on("mouseover",function(d,i){
                      d3.select(this).transition().duration(200).attr("fill","#f5c373").attr("r", 20).style("opacity","0.8");
                            return tooltip.style("hidden", false);
                        })
                    .on("mousemove",function(d){
                        tooltip.classed("hidden", false)
                              .style("top", (d3.event.pageY) + "px")
                              .style("left", (d3.event.pageX + 10) + "px")
                              .html("Year: "+d.year+"</br>Value: $ "+formatNum(d.export_val)+"</br>Percent of world trade: "+d.export_val_pct);
                    })
                    .on("mouseout",function(d,i){
                        d3.select(this).attr("fill", function(d){return exportColorScale(d.export_val)}).transition().duration(200).attr("r",5).style("opacity","1")
                                  tooltip.classed("hidden", true)
                    })

        // Change legend label
                    d3.selectAll("g#Glegend").selectAll("text.label").text(function(d){
                      if (d=="70G or more"){
                        return "70 Billion or more"
                      }
                      if (d=="35G to 70G"){
                        return "35 Billion to 70 Billion"
                      }
                      if (d=="20G to 35G"){
                        return "20 Billion to 35 Billion"
                      }
                      if (d=="9.0G to 20G"){
                        return "9 Billion to 20 Billion"
                      }
                      if (d=="4.0G to 9.0G"){
                        return "4 Billion to 9 Billion"
                      }
                      if (d=="2.0G to 4.0G"){
                        return "2 Billion to 4 Billion"
                      }
                      if (d=="1.0G to 2.0G"){
                        return "1 Billion to 2 Billion"
                      }
                      if (d=="1.0M to 1.0G"){
                        return "1 Million to 1 Billion"
                      }
                      if (d=="Less than 1.0M"){
                        return "Less than 1 Million"
                      }
                      else{
                        return d
                      }
                    })
                }
              }
            }


        }
      

  
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

// Possible ColorScale method to adjust for the skewed distribution // instead of using threcholds !
// var importColorScale = d3.scalePow().exponent(1 / 3)
// .domain([0,Max])
// // .range(["#ffffcc","#800026"])
// .range(["#fee6ce","#e6550d"])

                  // Problem comes from the fact that this if acts as a "door", once the condition is fufiled it is opened and the result is applied to every iteration!!!
                  // else if(d.country_origin_id==="HKG"){
                  //   // console.log(json);
                  //     json.push(e.properties.name="Hong-Kong")  
                  // }
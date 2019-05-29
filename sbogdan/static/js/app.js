// Set up Chart Area

var svgWidth = 3800;
var svgHeight = 600;

var chartMargin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 40
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

var svg = d3.select("#stackedChart")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);


// Read Data
d3.csv("/static/data/data.csv", data => {

  // Transform data to one row per year
  var flatData = transposeData(data);

  // Get all keys for causes of death
  var causeKeys = Object.keys(flatData[0]).filter(d => d != "Year");

  // Calculate total deaths for each year for stacked bar chart
  flatData.forEach(d =>
    d.total = d3.sum(causeKeys, k => +d[k]));

  // Configure scales for grouped and stacked charts
  var xExtent = d3.extent(data, d => +d.Year);

  var xScaleOrdinal = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([0, chartWidth])
    .paddingInner(.05)
    .paddingOuter(.1);

  var xScaleGrouped = d3.scaleBand()
    .domain(causeKeys)
    .range([0, xScaleOrdinal.bandwidth()])
    .paddingInner(.05)
    .paddingOuter(.05);

  var yScaleGrouped = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.DeathRate)])
    .range([chartHeight, 0]);

  var yScaleStacked = d3.scaleLinear()
    .domain(d3.extent([0, d3.max(flatData, d => d.total)]))
    .range([chartHeight, 0]);

  // Add axes to chart
  var bottomAxis = d3.axisBottom().scale(xScaleOrdinal);
  var leftAxis = d3.axisLeft().scale(yScaleStacked);

  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    // .selectAll("text")
    // .style("text-anchor", "end")
    // .attr("dx", "-.8em")
    // .attr("dy", ".15em")
    // .attr("transform", "rotate(0)")
    .call(bottomAxis);

  var y_axis = chartGroup.append("g")
    .attr("class", "yAxis")
    .call(leftAxis);

  var color = d3.scaleOrdinal(d3.schemeSpectral[causeKeys.length]);


  //Build stacked chart
  var stack = d3.stack().keys(causeKeys);

  // chartGroup.selectAll(".bar")
  //   .data(stack(flatData))
  //   .enter().append("g")
  //   .attr("class", "bar")
  //   .attr("fill", d => color(d.key))
  //   .selectAll("rect")
  //   .data(d => d)
  //   .enter().append("rect")
  //   .attr("x", d => xScaleOrdinal(d.data.Year))
  //   .attr("y", d => yScaleStacked(d[1]))
  //   .attr("height", d => yScaleStacked(d[0]) - yScaleStacked(d[1]))
  //   .attr("width", xScaleOrdinal.bandwidth())
  //   .on("mouseover", d => { tooltip.style("display", "block"); console.log("mouse over");})
  //   .on("mouseout", function() { tooltip.style("display", "none"); })
  //   .on("mousemove", function(d) {
  //     var xPosition = d3.mouse(this)[0] - 15;
  //     var yPosition = d3.mouse(this)[1] - 25;
  //     tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
  //     tooltip.select("text").text("something");
  //   });


  // console.log(d3.max(flatData, d => d3.max(causeKeys, key =>  {d[key]; console.log(key)})));
  // console.log(flatData.map(d => causeKeys.map(key => `{key: ${key}, value: ${d[key]}}`)))

  // Build grouped chart


  chartGroup.append("g")
    .selectAll("g")
    .data(flatData)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", d => "translate(" + (xScaleOrdinal(d.Year) + ",0)"))
    .selectAll("rect")
    .data(d => causeKeys.map(key => ({ key: key, value: d[key] })))
    .enter().append("rect")
    .attr("x", d => xScaleGrouped(d.key))
    .attr("y", d => yScaleGrouped(d.value))
    .attr("width", xScaleGrouped.bandwidth())
    .attr("height", d => chartHeight - yScaleGrouped(d.value))
    .attr("fill", d => color(d.key));


  var legend = chartGroup.selectAll(".legend")
    .data(causeKeys.reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")")
    .style("font", "14px sans-serif");

  legend.append("rect")
    .attr("x", 40)
    .attr("width", 14)
    .attr("height", 14)
    .attr("fill", color)
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .on("click", d => updateGroupedChart(d));

  legend.append("text")
    .attr("x", 60)
    .attr("y", 9)
    .attr("dy", ".20em")
    .attr("text-anchor", "begin")
    .text(d => d);

  var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

  tooltip.append("rect")
    .attr("width", 30)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

  tooltip.append("text")
    .attr("x", 15)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");

  var filteredKeys = [];

  function updateGroupedChart(key) {

    if (filteredKeys.indexOf(key) == -1) {
      filteredKeys.push(key);
      // if all bars are un-checked, reset:
      if (filteredKeys.length == causeKeys.length) filteredKeys = [];
    }
    // otherwise remove it:
    else {
      filteredKeys.splice(filteredKeys.indexOf(key), 1);
    };

    // Create new list of active keys by reversing filteredKeys
    var viewableKeys = [];

    causeKeys.forEach(d => {
      if (filteredKeys.indexOf(d) == -1) {
        viewableKeys.push(d);
      }
    });

    // Update x and y scales
    xScaleGrouped
      .domain(viewableKeys)
      .range([0, xScaleOrdinal.bandwidth()]);

    yScaleGrouped
      .domain([0, d3.max(flatData, d => d3.max(viewableKeys, k => +d[k]))])

    var newYaxis = d3.axisLeft().scale(yScaleGrouped)

    y_axis
      .transition()
      .call(newYaxis)
      .duration(2000);

    var bars = chartGroup.selectAll(".bar").selectAll("rect")
      
    bars.filter(d => filteredKeys.indexOf(d.key) > -1)
      .transition()
      .attr("height",0)
      .attr("width",0)     
      .attr("y", chartHeight)
      .duration(1000);

    bars.filter(d => filteredKeys.indexOf(d.key) == -1)
      .transition()
      .attr("x", d => xScaleGrouped(d.key))
      .attr("y", d => yScaleGrouped(d.value))
      .attr("height", d => chartHeight - yScaleGrouped(d.value))
      .attr("width", xScaleGrouped.bandwidth())
      .attr("fill", d => color(d.key))
      .duration(2000);
  

    legend.selectAll("rect")
      .transition()
      .attr("fill", d => {
        if (filteredKeys.length) {
          if (filteredKeys.indexOf(d) == -1) {
            return color(d);
          }
          else {
            return "white";
          }
        }
        else {
          return color(d);
        }
      })
      .duration(100);
  }


});


function transposeData(data) {
  var yearLimits = d3.extent(data, d => d.Year);
  var flatData = [];

  for (i = yearLimits[0]; i <= yearLimits[1]; i++) {

    var yearData = data.filter(d => d.Year == i);

    var strokeRate = yearData.filter(d => d.Cause == "Stroke")[0].DeathRate;
    var fluRate = yearData.filter(d => d.Cause == "Influenza and Pneumonia")[0].DeathRate;
    var accidentRate = yearData.filter(d => d.Cause == "Accidents")[0].DeathRate;
    var heartRate = yearData.filter(d => d.Cause == "Heart Disease")[0].DeathRate;
    var cancerRate = yearData.filter(d => d.Cause == "Cancer")[0].DeathRate;

    flatData.push({
      "Year": i,
      "Stroke": strokeRate,
      "Influenza and Pneumonia": fluRate,
      "Accidents": accidentRate,
      "Heart Disease": heartRate,
      "Cancer": cancerRate
    });
  }
  return flatData;
}


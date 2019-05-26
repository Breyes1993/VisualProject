// Set up Chart Area

var svgWidth = 2800;
var svgHeight = 700;

var chartMargin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 40
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

var svg = d3
  .select("#stackedChart")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);


var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Read Data
d3.csv("/static/data/data.csv", data => {

  // Transform data to one row per year
  var flatData = flattenData(data);

  // Get all keys for causes of death
  var causeKeys = Object.keys(flatData[0]).filter(d => d != "Year");

  // Calculate total deaths for each year for stacked bar chart
  flatData.forEach(d =>
    d.total = d3.sum(causeKeys, k => +d[k]))

  // Configure scales for grouped and stacked charts
  var xExtent = d3.extent(data, d => +d.Year);

  var xScaleOrdinal = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([0, chartWidth])
    .paddingInner(.05)
    .paddingOuter(.05);

  var xScaleDate = d3.scaleTime().
    domain([new Date(`${xExtent[0]}`), new Date(`${xExtent[1]}`)]).
    range(0, chartWidth);

  var yScaleGrouped = d3.scaleLinear().
    domain(d3.extent(data, d => +d.DeathRate)).
    range([chartHeight, 0]);

  var yScaleStacked = d3.scaleLinear().
    domain(d3.extent([0, 1454.9])).clamp(false).
    // domain(d3.extent(flatData, d => +d.total)).

    range([660 - 0, 0]);

    console.log("Y extent: " + d3.extent(flatData, d => +d.total))


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
    .call(leftAxis);

  // var color = d3.scaleOrdinal()
  //   .domain(causeKeys)
  //   .range(d3.schemeGnBu[causeKeys.length]);

  var color =  d3.scaleOrdinal(d3.schemePRGn[5]);



  //Build Chart
  var stack = d3.stack()
    .keys(causeKeys);

    console.log("Chart height: " + chartHeight)
    for (i = -20; i < 1600; i += 10) {
      console.log("y(" + i + ") = " + yScaleStacked(i))
    }

  chartGroup.selectAll(".bar")
    .data(stack(flatData))
    .enter().append("g")
    .attr("class", "bar")
    .attr("fill", d => color(d.key))
    // .attr("z1", d => console.log(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", d => xScaleOrdinal(d.data.Year))
    // .attr("z", (d,i) => console.log(i + ": " + 
    //   d[0] + " " + yScaleStacked(d[0]) + " " + d[1] + " " + yScaleStacked(d[1])))
    .attr("y", d => yScaleStacked(d[1]))
    .attr("height", d => yScaleStacked(d[0]) - yScaleStacked(d[1]))
    .attr("width", xScaleOrdinal.bandwidth());

    
    
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
  .attr("fill", color);

  legend.append("text")
  .attr("x", 60)
  .attr("y", 9)
  .attr("dy", ".20em")
  .attr("text-anchor", "begin")
  .text(d => d);


  var temp = stack(flatData);
  console.log(temp);
  // console.log(temp[1]);

});



function flattenData(data) {
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
    })

  }
  return flatData;
}


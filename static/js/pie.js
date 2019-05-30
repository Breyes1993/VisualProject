    function buildCharts(year) {
   
      d3.csv("static/data/CDC_Deathstats.csv").then(function(data){
        
       console.log(data)
       console.log(year)
       data.forEach(row => {
           if (row.Year == year){
               if (row.Cause == "Stroke") {
                   stroke_value = row.DeathRate
               }               
                if (row.Cause == "Cancer") {
                    cancer_value = row.DeathRate
                }                
                if (row.Cause == "Heart Disease") {
                    heart_value = row.DeathRate
                }                
                if (row.Cause == "Accidents") {
                    accidents_value = row.DeathRate
                }                
                if (row.Cause == "Influenza and Pneumonia") {
                    influenza_value = row.DeathRate
                }
            }
            });

        var values = [stroke_value, cancer_value, heart_value, accidents_value, influenza_value] 
        var labels = ['Stroke', 'Cancer', 'Heart Disease', 'Accidents', 'Influenza and Pneumonia']

        

  
        var pie_chart = [{
          values: values,
          labels: labels,
          marker: {
            'colors': [
              'rgb(215, 11, 11)', //Stroke - Red
              'rgb(240, 88, 0)', // Cancer - Orange
              'rgb(118, 17, 195)', // Heart Disease - Purple
              'rgb(0, 204, 0)', // Accidents - Green
              'rgb(0, 48, 240)', // Influenza - Blue
            ]
          },
          sort: false,
          type: "pie"
        }];
        Plotly.newPlot('pie',pie_chart);
      
    });
  };
  
      // HINT: You will need to use slice() to grab the top 10 sample_values,
      // otu_ids, and labels (10 each).
  
  function init() {
    console.log('hello');
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
    
    // Use the list of sample names to populate the select options
    d3.csv("static/data/CDC_Deathstats.csv").then((deathData) => {
        var flatData = transposeData(deathData)

        flatData.forEach((item) => {
            // if item.cause == stroke, execute code below
        selector
          .append("option")
          .text(item.Year)
          .property("value", item.Year);
      });
  
      // Use the first sample from the list to build the initial plots
      const firstYear = deathData[0].Year;
      console.log(deathData[0].Year)
      buildCharts(firstYear);
    //   buildMetadata(firstYear);
    });
  }
  

 // Combine drop down menu (combines years for each cause of death)
  
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


  function optionChanged() {
    // Fetch new data each time a new sample is selected
    var selector = d3.select("#selDataset").node();
    
    d3.csv("static/data/CDC_Deathstats.csv").then((deathData) => {
        
        deathData.forEach((item) => {
           
            if (item.Year == selector.value) {               
                var temp = selector.value                
                buildCharts(temp);
            }
        })
    })
}
  init();

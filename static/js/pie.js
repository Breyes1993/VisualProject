    // #for loop to group of values 

    function buildCharts(year) {
   
      d3.csv("static/data/CDC_Deathstats.csv").then(function(data){
        
      
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

      //Plotly: used to define the pie chart------------------------------------------------- 

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
  //--------------------------------------------------------------------------------------
  
  // creating the list of years to populate the select element options for the drop down menu. 

  function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");   //links the html select tag  
    
    // Use the list of years to populate the select options
    d3.csv("static/data/CDC_Deathstats.csv").then((deathData) => {
        var flatData = transposeData(deathData)

        flatData.forEach((item) => {
            // if item.cause == stroke, execute code below
        selector
          .append("option")
          .text(item.Year)
          .property("value", item.Year);   // appends a selection for every year in the data set
      });
  
      // Use the first sample from the list to build the initial plots
      // Outputs the visual for the first year 
      const firstYear = deathData[0].Year;
      console.log(deathData[0].Year)
      buildCharts(firstYear);
    //   buildMetadata(firstYear);
    });
  }

  //_________________________________________________________________________________________________________//

 // Puts each Cause of Death into its own column (To combine years for each cause of death on drop down)
 // Transforms the data
  
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
   //________________________________________________________________________________________________________

   //  This code will react and provide an output depending on what is selected in the drop down menu:

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

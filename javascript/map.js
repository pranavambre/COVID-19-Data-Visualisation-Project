function usaMap(width, height) {
  d3.select('#map')
    .attr('width', width)
    .attr('height', height)
    .append('text')
    .attr('x', width / 2)
    .attr('y', '1em')
    .attr('font-size', '1.5em')
    .style('text-anchor', 'middle')
    .classed('map-title', true);
    
   
    


}

function drawMap(geoData, data, date, dataType) {
  //SETUP
  const map = d3.select('#map');
    


  const projection = d3
    .geoMercator()
    .scale(500)
    .translate([+map.attr('width') / 0.63, +map.attr('height') / 0.8]);

  const path = d3.geoPath().projection(projection);

  //UPDATE TITLE TEXT
  d3.select('#date-val').text(date);

  //BIND CASES DATA TO GEODATA
  geoData.forEach((d) => {
    let states = data.filter((row) => row.state === d.properties.state);
    let state = '';
    if (states.length > 0) state = states[0].state;
    d.properties = states.find((s) => s.date === date) || { state };
  });

  //COLOR SCALE
  const color_Array = {
    cases: ['#f1c40f', '#e67b06', '#e85e32', '#ef4c3c', '#c0392b', '#91170a'],
    deaths: ['#f1c40f', '#e85e32', '#c0392b', '#91170a'],
  };
    


  const domain = {
    cases: [0, 10000, 20000, 30000, 45000, 60000],
    deaths: [0, 6000, 13000, 26000],
  };

  const mapColorScale = d3
    .scaleLinear()
    .domain(domain[dataType])
    .range(color_Array[dataType]);
    
  

  //UPDATE DATA AND TITLE
  let update = map.selectAll('.state').data(geoData);

  update
    .enter()
    .append('path')
    .classed('state', true)
    .attr('d', path)
    //DISPLAY LINE CHART
    .on('click', function () {
      let currentDataType = d3.select('input:checked').property('value');
      let state = d3.select(this);
      let isActive = state.classed('active');
      let stateName = isActive ? '' : state.data()[0].properties.state;

      drawLine(data, currentDataType, stateName);

      d3.selectAll('.state').classed('active', false);
      state.classed('active', !isActive);
    })
    //
    .merge(update)
    .transition()
    .duration(300)
    .attr('stroke', '#777')
    .attr('fill', (d) => {
      let val = d.properties[dataType];
      return val ? mapColorScale(val) : '#ccc';
    });

  d3.select('.map-title').text(`COVID 19 ${dataType} at ${date}`);
      
    var linear = d3.scaleLinear()
  .domain([0,10])
  .range(['#f1c40f', '#e67b06', '#e85e32', '#ef4c3c', '#c0392b', '#91170a']);

var svg = d3.select("#maplegend");

svg.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(20,20)");

var legendLinear = d3.legendColor()
  .shapeWidth(30)
  .cells(10)
  .orient('horizontal')
  .scale(linear);

svg.select(".legendLinear")
  .call(legendLinear);
    
    
}

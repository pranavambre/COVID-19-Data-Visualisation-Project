d3.queue()
  .defer(d3.json, './data/states-10m.json')
  .defer(
    d3.csv,
    'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv',
    (row) => {
      return {
        date: row.date,
        state: row.state,
        cases: +row.cases,
        deaths: +row.deaths,
      };
    }
  )
  .await((err, mapData, data) => {
    if (err) throw err;

    //SETUP
    dateArr = [...new Set(data.map((d) => d.date))];
    let min = 0;
    let max = dateArr.length - 1;
    let currentDate = dateArr[max];
    let currentDataType = d3
      .select('input[name="data-type"]:checked')
      .attr('value');

    const geo = topojson.feature(mapData, mapData.objects.states).features;

    const us_map_width = +d3.select('.map').node().offsetWidth;
    const us_map_height = +d3.select('.map').node().offsetHeight;

    const bottomWidth = +d3.select('.pie').node().offsetWidth;
    const bottomHeight = +d3.select('.pie').node().offsetHeight;

    //INIT DISPLAY
  

    pieChart(bottomWidth, bottomHeight);
    drawPie(data, currentDate, currentDataType);
    
      usaMap(us_map_width, us_map_height);
    drawMap(geo, data, currentDate, currentDataType);

    LineChart(bottomWidth, bottomHeight);
    drawLine(data, currentDataType, '');
    
       
    

    //UPDATE CHART WHEN INPUT CHANGE
    //RANGE INPUT FOR YEAR
    d3.select('#date')
      .attr('min', min)
      .attr('max', max)
      .attr('value', max)
      .on('input', () => {
        currentDate = dateArr[+d3.event.target.value];

        drawMap(geo, data, currentDate, currentDataType);
        drawPie(data, currentDate, currentDataType);
      });

    //RADIO INPUT FOR DATA TYPE
    d3.selectAll('input[name="data-type"]').on('change', () => {
      currentDataType = d3.event.target.value;

      let active = d3.select('.active').data()[0].properties.state;
      let state = active || '';

      drawMap(geo, data, currentDate, currentDataType);
      drawPie(data, currentDate, currentDataType);
      drawLine(data, currentDataType, state);
    });

    //TOOLTIP
    d3.selectAll('#map, #pie').on('mousemove touchmove', updateHover);

    function updateHover() {
      const tooltip = d3.select('.tooltip');
      const dataType = d3.select('input:checked').property('value');

      //CHECK WHICH CHART
      let target = d3.select(d3.event.target);

      let is_State = target.classed('state');
      let is_Arc = target.classed('arc');
      let is_Line = target.classed('line');

      //GET DATA BASED ON CHART
      let data;
      //Map
      if (is_State) data = target.data()[0].properties;
      //Pie
      let region = '';
      let percentage = '';
      if (is_Arc) {
        data = target.data()[0].data;

        region = `<p>Region: ${getRegion(data.state)}</p>`;
        percentage = `<p>Percentage of total ${dataType}: ${findPercentage(
          target.data()[0]
        )}</p>`;
      }

      //POSITION
      tooltip
        .style('opacity', +(is_State || is_Arc))
        .style('left', `${d3.event.pageX - tooltip.node().offsetWidth / 2}px`)
        .style('top', `${d3.event.pageY - tooltip.node().offsetHeight - 10}px`);

      //DISPLAY DATA
      if (data) {
        tooltip.html(`
          ${region}
          <p>State: ${data.state}</p>
          <p>Cases: ${data.cases || 0}</p>
          <p>Deaths: ${data.deaths || 0}</p>
          ${percentage}
        `);
      }
    }
  });

function findPercentage(d) {
  let angle = d.endAngle - d.startAngle;
  let fraction = (angle / (Math.PI * 2)) * 100;
  return `${fraction.toFixed(2)}%`;
}

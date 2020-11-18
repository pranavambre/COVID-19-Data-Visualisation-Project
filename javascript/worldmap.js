const colors = [
  '#fee3e0',
  '#fdd7d2',
  '#fbc8c2',
  '#f8b8b0',
  '#f0978d',
  '#e36f66',
  '#d74e49',
  '#d13c3c'
]

document.addEventListener('DOMContentLoaded', function (event) {
  // load datas before init
  Promise.all([
    d3.json('./data/world_countries.json'),
    d3.json('./data/map-data.json'),
    d3.json('./data/iso3.json')
  ]).then((res) => {
    document.getElementById('worldmap').innerHTML = '<h4>Total confirmed COVID-19 cases, <span id="date"></span></h4><div id="chart"></div>'

    // sizes
    const margin_worldmap = { top: 0, right: 0, bottom: 0, left: 0 }
    const worldmap_width = 960 - margin_worldmap.left - margin_worldmap.right
    const worldmap_height = 500 - margin_worldmap.top - margin_worldmap.bottom

    // svg setup
    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('width', worldmap_width)
      .attr('height', worldmap_height)

    // projection setup
    const projection_map = d3.geoRobinson()
      .scale(148)
      .rotate([352, 0, 0])
      .translate([worldmap_width / 2, worldmap_height / 2])
    const path = d3.geoPath().projection(projection_map)

    // tooltips setup
    const tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(d => `<strong>Country: </strong><span class='details'>${d.properties.name}<br></span><strong>Confirmed cases: </strong><span class='details'>${d.case}</span>`)
    svg.call(tip)

    // world data for map drawing
    const world = res[0]
    world.features = world.features.filter(v => v.id !== 'ATA')
    // covid19 data
    const data = res[1].data
      .map(v => {
        v.id = res[2][v.countrycode]
        v.cases = parseInt(v.cases)
        return v
      })

    const color = d3.scaleThreshold()
      .domain([5, 10, 50, 100, 500, 1000, 2000])
      .range(colors)

    // map
    const dates = data
      .map(v => v.date)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => new Date(a) - new Date(b))
    let selectedDate = dates[dates.length - 1]

    function redraw () {
      svg.selectAll('g.countries').remove()

      const dataByName = {}
      const dataByDate = data.filter(v => v.date === selectedDate)
      dataByDate.forEach(v => { dataByName[v.id] = v.cases })
      world.features.forEach(d => {d.case = typeof dataByName[d.id] === 'number' ? dataByName[d.id] : 0})

      svg
        .append('g')
        .attr('class', 'countries')
        .selectAll('path')
        .data(world.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', d => dataByName[d.id] ? color(dataByName[d.id]) : colors[0])
        .style('stroke', 'white')
        .style('opacity', 0.8)
        .style('stroke-width', 0.3)
        .on('mouseover', function (d) {
          tip.show(d, this)
          d3.select(this)
            .style('opacity', 1)
        })
        .on('mouseout', function (d) {
          tip.hide(d)
          d3.select(this, this)
            .style('opacity', 0.8)
        })
    }

    redraw()

    document.getElementById('date').textContent = dates[dates.length - 1]
    let tickIndex = 0
    const slider = d3
      .sliderRight()
      .max(dates.length - 1)
      .tickValues(Array.from(dates.keys()))
      .step(1)
      .height(400)
      .tickFormat(d => ++tickIndex % 10 === 0 ? dates[d] : null)
      .displayFormat(d => dates[d])
      .default(dates.length - 1)
      .on('onchange', d => {
        selectedDate = dates[d]
        document.getElementById('date').textContent = dates[d]
        redraw()
      })

    svg
      .append('g')
      .attr('transform', 'translate(30,30)')
      .call(slider)

    const legend = svg.append('g')
      .attr('class', 'legendQuant')
      .attr('transform', 'translate(180,450)')

    legend.call(d3.legendColor()
      .orient('horizontal')
      .shapeWidth(80)
      .labelFormat(d3.format('i'))
      .labels(d3.legendHelpers.thresholdLabels)
      .scale(color))
  })
})

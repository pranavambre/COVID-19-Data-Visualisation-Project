  var margin = {top: 80, right: 180, bottom: 80, left: 180},
                    width = 960 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                var svg = d3.select("#bar").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                d3.tsv("./data/top10.tsv", function(error, data){

                    // filter year
                    var data = data.filter(function(d){return d.Year == '2012';});
                    // Get every column value
                    var elements = Object.keys(data[0])
                        .filter(function(d){
                            return ((d != "Year") & (d != "Country"));
                        });
                    var selection = elements[0];

                    var y = d3.scaleLinear()
                            .domain([0, d3.max(data, function(d){
                                return +d[selection];
                            })])
                            .rangeRound([height, 0]);

                    var x = d3.scaleBand()
                            .domain(data.map(function(d){ return d.Country;}))
                            .rangeRound([0, width])
                    .padding(0.1);
                    
                    
                   var yAxis = d3.axisLeft(y);
                     var xAxis = d3.axisBottom(x);

                  


                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                        .selectAll("text")
                        .style("font-size", "13px")
                        .style("text-anchor", "end")
                        .attr("dx", "-.15em")
                        .attr("dy", "-.71em")
                        .attr("transform", "rotate(-90)" );


                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);

                    svg.selectAll("rectangle")
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("class","rectangle")
                        .attr("width", width/data.length)
                        .attr("height", function(d){
                            return height - y(+d[selection]);
                        })
                        .attr("x", function(d, i){
                            return (width / data.length) * i ;
                        })
                        .attr("y", function(d){
                            return y(+d[selection]);
                        })
                        .append("title")
                        .text(function(d){
                            return d.Country + " : " + d[selection];
                        });

                    var selector = d3.select("#drop")
                        .append("select")
                        .attr("id","dropdown")
                        .on("change", function(d){
                            selection = document.getElementById("dropdown");

                            y.domain([0, d3.max(data, function(d){
                                return +d[selection.value];})]);

                            yAxis.scale(y);

                            d3.selectAll(".rectangle")
                                .transition()
                                .attr("height", function(d){
                                    return height - y(+d[selection.value]);
                                })
                                .attr("x", function(d, i){
                                    return (width / data.length) * i ;
                                })
                                .attr("y", function(d){
                                    return y(+d[selection.value]);
                                })
                                .ease("linear")
                                .select("title")
                                .text(function(d){
                                    return d.Country + " : " + d[selection.value];
                                });

                            d3.selectAll("g.y.axis")
                                .transition()
                                .call(yAxis);

                         });

                    selector.selectAll("option")
                      .data(elements)
                      .enter().append("option")
                      .attr("value", function(d){
                        return d;
                      })
                      .text(function(d){
                        return d;
                      })


                });

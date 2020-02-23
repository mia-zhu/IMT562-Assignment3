////////////////////////////
////////// BUTTON //////////
////////////////////////////

var USER_SEX = "1",
    USER_RACESIMP = "1",
    USER_AGEGRP = "1";

function getValKey() {
    return "grp" + USER_SEX + USER_RACESIMP + USER_AGEGRP;
}

var VAL_KEY = getValKey();
var grp_vals = {};

var delay_per_unit = 30,
    bg_color = "#e0e0e0";

// Dimensions of single chart.
var margin = { top: 0, right: 0, bottom: 10, left: 0 },
    width = 134 - margin.left - margin.right,
    height = 134 - margin.top - margin.bottom; 
    
d3.csv("https://gist.githubusercontent.com/mia-zhu/014898247c455defe4d84e1bbc18fa11/raw/c0b2b69c6114d5e3a17baff6e49bffffb22a8f77/test_square.csv", type, function(error, data) {
    if (error) throw error;
    

    var valfields = d3.keys(field_details);
    
    // Make data accessible by grp key
    data.forEach(function(o) {
        grp_vals["grp" + o.sex + o.racesimp + o.agegrp] = o;
    });
    
    //
    // Setup grid.
    //
    var cells = [];
    d3.select("#grid").text().split("\n").forEach(function(line, i) {
      var re = /\w+/g, m;
      while (m = re.exec(line)) cells.push({
        name: m[0],
        selected: 1,
        x: m.index / 3,
        y: i
      });
    });

    //
    // Make a square pie for each field.
    //
    valfields.forEach(function(v,i) {
        var grid_width = d3.max(cells, function(d) { return d.x; }) + 1,
            grid_height = d3.max(cells, function(d) { return d.y; }) + 1,
            cell_size = width / grid_width,
            holder_width = width + margin.left + margin.right;

            
        var div = d3.select("#charts").append("div")
            .attr("id", "holder"+v)
            .attr("class", "chartholder")
            .style("width", holder_width+"px");
        div.append("h5").html(field_details[v].desc);
    
        var svg = div.append("svg")
            .attr("class", "squarepie")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var cell = svg.append("g")
            .attr("id", "vf"+v)
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
          .selectAll(".cell")
            .data(cells)
          .enter().append("g")
            .attr("class", "cell")
            .attr("transform", function(d) { 
                return "translate(" + (d.x-grid_width/2) * cell_size + "," + (d.y-grid_height/2) * cell_size + ")"; 
            });

        cell.append("rect")
            .attr("x", -cell_size / 2)
            .attr("y", -cell_size / 2)
            .attr("width", cell_size - .5)
            .attr("height", cell_size - .5)
            .style("fill", function(d,i) {
                // var valkey = CURR_GRP;
                if (i < (100-grp_vals[VAL_KEY][v])) {
                    return bg_color;
                } else {
                    return field_details[v].color;
                }
            });
    
    }); // @end forEach()
     
    d3.select("#charts").append("div").attr("class", "clr");

    
    //
    // Group selection with buttons
    //
    d3.selectAll("#sex .button").on("click", function() {
    	USER_SEX = d3.select(this).attr("data-val");
        d3.select("#sex .current").classed("current", false);
        d3.select(this).classed("current", true);
        update();
    });

    d3.selectAll("#agegrp .button").on("click", function() {
    	USER_AGEGRP = d3.select(this).attr("data-val");
        d3.select("#agegrp .current").classed("current", false);
        d3.select(this).classed("current", true);
        update();
    });

    ////////////////////////////
////////// SLIDER //////////
////////////////////////////
var margin2 = {left: 30, right: 60},
        width2 = 680,
        height2 = 120,
        range = [1, 90],
        step = 1; // change the step and if null, it'll switch back to a normal slider

    // append svg
    var svg = d3.select('#slider').append('svg')
        .attr('width', width2)
        .attr('height', height2);

    var slider = svg.append('g')
        .classed('slider', true)
        .attr('transform', 'translate(' + margin2.left +', '+ (height2/2) + ')');

    // using clamp here to avoid slider exceeding the range limits
    var xScale = d3.scaleLinear()
        .domain(range)
        .range([0, width2 - margin2.left - margin2.right])
        .clamp(true);

    // array useful for step sliders
    var rangeValues = d3.range(range[0], range[1], step || 1).concat(range[1]);
    var xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(function (d) {
        return d;
    });

    xScale.clamp(true);
    
    // drag behavior initialization
    var drag = d3.drag()
        .on('start.interrupt', function () {
            slider.interrupt();
        }).on('start drag', function () {
            dragged(d3.event.x);
        });
    var ticks = slider.append('g').attr('class', 'ticks').attr('transform', 'translate(0, 4)')
        .call(xAxis);
        
    // this is the main bar with a stroke (applied through CSS)
    var track = slider.append('line').attr('class', 'track')
        .attr('x1', xScale.range()[0])
        .attr('x2', xScale.range()[1]);

    // this is a bar (steelblue) that's inside the main "track" to make it look like a rect with a border
/*      var trackInset = d3.select(slider.node().appendChild(track.node().cloneNode())).attr('class', 'track-inset');    */    

    // drag handle
    var handle = slider.append('circle').classed('handle', true)
        .attr('transform', 'translate(0, 0)')
        .attr('r', 9);

    // this is the bar on top of above tracks with stroke = transparent and on which the drag behaviour is actually called
    // try removing above 2 tracks and play around with the CSS for this track overlay, you'll see the difference
    var trackOverlay = d3.select(slider.node().appendChild(track.node().cloneNode())).attr('class', 'track-overlay')
        .call(drag);

    // text to display
    var text = svg.append('text').attr('transform', 'translate(30, 30)');
    /*document.write(text.fontsize(15));*/

    
    // initial transition
    slider.transition().duration(1000)
        .tween("drag", function () {
            var i = d3.interpolate(0, 14);
            return function (t) {
                dragged(xScale(i(t)));
            }
        });
    

    //////// Slider Dragged ///////////
    function dragged(value) {
        var x = xScale.invert(value), index = null, midPoint, cx, xVal;
        if(step) {
            // if step has a value, compute the midpoint based on range values and reposition the slider based on the mouse position
            for (var i = 0; i < rangeValues.length - 1; i++) {
                if (x >= rangeValues[i] && x <= rangeValues[i + 1]) {
                    index = i;
                    break;
                }
            }
            midPoint = (rangeValues[index] + rangeValues[index + 1]) / 2;
            if (x < midPoint) {
                cx = xScale(rangeValues[index]);
                xVal = rangeValues[index];
            } else {
                cx = xScale(rangeValues[index + 1]);
                xVal = rangeValues[index + 1];
            }
        } else {
            // if step is null or 0, return the drag value as is
            cx = xScale(x);
            xVal = x.toFixed(3);
        }       
        // use xVal as drag value
        handle.attr('cx', cx);
        text.text('Selected Test Day: ' + xVal);
        USER_RACESIMP = xVal;
        update();
    }

    // d3.selectAll("#racesimp .button").on("click", function() {
    // 	USER_RACESIMP = d3.select(this).attr("data-val");
    //     d3.select("#racesimp .current").classed("current", false);
    //     d3.select(this).classed("current", true);
    //     update();
    // });

    
    
    // 
    // Update based on current group
    //
    function update() {
    
        var prev_val_key = VAL_KEY;
        VAL_KEY = getValKey();
    
                
        // Update charts.
        valfields.forEach(function(v,k) {
            
            var start_i = 100 - grp_vals[prev_val_key][v];
            var end_i = 100 - grp_vals[VAL_KEY][v];
            
            d3.select("#vf"+v).selectAll(".cell rect")
                .transition()
                .duration(10)
                .delay(function(d,i) {
                    
                    // Decreasing
                    if (start_i < end_i) {
                        var curr_delay = (i - start_i) * delay_per_unit;
                        curr_delay = Math.max(curr_delay, 0);
                        return curr_delay;
                    } 
            
                    // Increasing
                    else if (start_i > end_i) {
                        var curr_delay = (start_i - i) * delay_per_unit;
                        curr_delay = Math.max(curr_delay, 0);
                        return curr_delay;
                    }
            
                    // No change.
                    else {
                        return 0;
                    }
                })
                .style("fill", function(d,i) {
                    if (i < (100-grp_vals[VAL_KEY][v])) {
                        return bg_color;
                    } else {
                        return field_details[v].color;
                    }
                });
            
        }); // @end forEach()
        
    } // @end update()
    
    
    
    
}); // @end d3.csv()


function type(d) {
	d3.keys(d).map(function(key) {
        d[key] = +d[key];
    });
    
	return d;
}

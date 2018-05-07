// create svg canvas
const canvHeight = 600, canvWidth = 800;
const svg = d3.select("body").append("svg")
    .attr("width", canvWidth)
    .attr("height", canvHeight)
    .style("border", "1px solid");

// calc the width and height depending on margins.
const margin = {top: 50, right: 80, bottom: 50, left: 60};
const width = canvWidth - margin.left - margin.right;
const height = canvHeight - margin.top - margin.bottom;

// create parent group and add left and top margin
const g = svg.append("g")
    .attr("id", "chart-area")
    .attr("transform", "translate(" +margin.left + "," + margin.top + ")");

// chart title
svg.append("text")
    .attr("y", 0)
    .attr("x", margin.left)
    .attr("dy", "1.5em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "24px")
    .style("text-anchor", "left")
    .text("Football - Which team is really efficient?");


// load the data from the cleaned csv file.
// note: the call is done asynchronous.
// That is why you have to load the data inside of a
// callback function.
d3.csv("./data/bundesligaDaten.csv", function(error, data) {

    const valueDomain = [d3.max(data, d => Number(d.Gesamtmarktwert)),0];
    const successDomain = [d3.max(data, d => Number(d.Platzierung)) + 1,d3.min(data, d => Number(d.Platzierung))];


    // create scales for x and y direction
    const xScale = d3.scaleLinear()
        .range([0,width])
        .domain(valueDomain);




    //.nice(5);

    const yScale = d3.scaleLinear()
        .range([height,0])
        .domain(successDomain);
    //.ticks(18);
    //.nice(1);



    var currentYear = 2015;

    //console.log(successDomain);

    //const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // create xAxis
    const xAxis = d3.axisBottom(xScale);
    g.append("g")  // create a group and add axis
        .attr("transform", "translate(0," + height + ")").call(xAxis);


    // create yAxis
    const yAxis = d3.axisLeft(yScale);
    g.append("g")  // create a group and add axis
        .call(yAxis)


    // Create tooltip
    var tooltip = d3.select("body").append("tooltip")
        .attr("class", "tooltip");

    var team_images = g.selectAll("image")
        .data(data)
        .enter()
        .append("g:image")
        .filter(function(d) {return d.Jahr == currentYear;
        })
        .attr("class", "bar")
        .attr("xlink:href",function(d){return "./images/" +d.Verein +".gif"})
        .attr("x", d => xScale(d.Gesamtmarktwert))
.attr("y", d => yScale(d.Platzierung))
.style("width","25")
        .style("height","25")
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
                .style("visibility","visible");
            tooltip	.html(`${d["Verein"]} <br/>`
                + `Total market value: ${d.Gesamtmarktwert}<br/>`
                + `League Position: ${d.Platzierung}<br/>`
            )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    var slider = d3.sliderHorizontal()
        .min(Number(2015))
        .max(Number(2017))
        .step(1)
        .ticks(2)
        .width(width)
        .tickFormat(d => d + "")
        .default(2015)
        .on('onchange', val => {
            d3.select("p#yearValue").text(val);

        });

    var g2 = d3.select("div#slider").append("svg")
        .attr("width", 1000)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)");

    g2.call(slider);

    d3.select("p#yearValue").text(slider.value());
    d3.select("a#yearValue2").on("click", () => slider.value(2015));



});

// https://stackoverflow.com/questions/45504235/filter-csv-data-from-a-slider-in-a-scatterplot-d3js


// text label for the x axis
g.append("text")
    .attr("y", height + margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Total market value in Mio €");

// text label for the y axis
g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("League Position");

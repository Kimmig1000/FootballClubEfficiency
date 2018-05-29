var dataset;
var xScale;
var yScale;
var xAxis;
var yAxis;
var initialDraw = 1;
var tooltip = 1;
var filterYear = 2015;
var valueDomain;
var successDomain;
var placementValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

//The data for our line
var lineData = {};

// canvas dimensions
const canvHeight = 1000, canvWidth = 1062;
const margin = {top: 150, right: 180, bottom: 150, left: 180};
const width = canvWidth - margin.left - margin.right;
const height = canvHeight - margin.top - margin.bottom;
var yData = ["Gesamtmarktwert", "Durchschnittsalter", "Fouls", "Umsatz","Running"];

const chart1 = d3.select("body").append("svg")
    .attr("class", "chart1")
    .attr("width", canvWidth)
    .attr("height", canvHeight);
// .style("border", "1px solid");

var lineFunction = d3.line()
    .x(function (d) {
        return d.x;
    })
    .y(function (d) {
        return d.y;
    })
    .curve(d3.curveLinear);

// create parent group and add left and top margin
const g = chart1.append("g")
    .attr("id", "chart-area")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var background = g
    .append("image")
    .attr("width", width)
    .attr("height", height)
    .attr("visibility", "visible")
    .attr("xlink:href", function (d) {
        return "./images/footballBackground.png"
    })

var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 100 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .attr("id", "yAxisText")
    .style("text-anchor", "middle")
    .text("League Position");

chart1.append("text")
    .attr("y", 0)
    .attr("x", margin.left)
    .attr("dy", "1.5em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "24px")
    .style("text-anchor", "left")
    .text("Football - Which team is really efficient?");


var select = d3.select('body')
    .append('select')
    .attr('class', 'select')
    .on('change', onchange)

var options = select
    .selectAll('option')
    .data(yData).enter()
    .append('option')
    .text(function (d) {
        return d;
    });

function onchange() {
    lineData = {};
    selectValue = d3.select('select').property('value')
    changeIt(selectValue);
};

function getValue(d) {
    var parseNum = d3.format(".0g");
    d3.select("#slideValue").text("Slider value " + parseNum(d.value()))
};

// Initialize View and Data
d3.csv("./data/bundesligaDataWithFouls.csv", function (error, data) {

    valueDomain = [0, d3.max(data, d => Number(d.Gesamtmarktwert)) + 20];
    successDomain = [d3.max(data, d => Number(d.Platzierung)) + 1, 0];

    // create scales for x and y direction
    xScale = d3.scaleLinear()
        .range([0, width])
        .domain(valueDomain);

    yScale = d3.scaleLinear()
        .range([height, 0])
        .domain(successDomain);

    // create xAxis
    xAxis = d3.axisBottom(xScale);
    g.append("g")  // create a group and add axis
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "xAxis")
        .call(xAxis);

    // create yAxis
    yAxis = d3.axisLeft(yScale).tickValues(placementValues);
    g.append("g")
        .attr("id", "yAxis")// create a group and add axis
        .call(yAxis)

    const slider = sliderFactory();
    let slideHolder = d3.select('body').append("sliderBox")
        .call(slider.ticks(1).scale(true).value(2015).range([2013, 2018]).dragHandler(function (d) {
            getValue(d);
            update(slider.value(), "Gesamtmarktwert")
        }));

    dataset = data;
    update(filterYear, "Gesamtmarktwert")
});


// draws the images and is called by update(h, AxisValue)
function drawImages(data, xAxisValue) {

    var currentXValue = xAxisValue;
    var team_images = g.selectAll("image").filter(".bar");

    if ((xAxisValue == "Fouls" && data[0].Fouls == "") || (xAxisValue == "Running" && data[0].Running == "")) {
        team_images.attr("visibility", "hidden");
    } else {
        team_images.attr("visibility", "visible");
        if (initialDraw) {
            initialDraw = 0;
            team_images = team_images
                .data(data)
                .enter()
                .append("g:image")
                .attr("class", "bar")
                .attr("xlink:href", function (d) {
                    return "./images/" + d.Verein + ".gif"
                })
                .attr("x", d => xScale(d[currentXValue]) - 15)
                .attr("y", d => yScale(d.Platzierung) - 15)
                .style("width", "30")
                .style("height", "30")
            addTooltip(team_images, currentXValue);
        } else {
            // remove teams out
            team_images
                .data(data, function (d) {
                    return d.Verein
                })
                .exit()
                .remove();

            // update existing teams
            team_images
                .data(data, function (d) {
                    var xy = {"x": xScale(d[currentXValue]), "y": yScale(d.Platzierung)};
                    updateLineData(xy, d.Verein);
                    return d.Verein
                })
                .attr("xlink:href", function (d) {
                    return "./images/" + d.Verein + ".gif"
                })
                .transition().duration(2000).ease(d3.easeCubic)
                .attr("x", d => xScale(d[currentXValue]) - 15)
                .attr("y", d => yScale(d.Platzierung) - 15)

            // add new teams
            team_images
                .data(data, function (d) {
                    return d.Verein
                })
                .enter()
                .append("g:image")
                .attr("class", "bar")
                .attr("xlink:href", function (d) {
                    return "./images/" + d.Verein + ".gif"
                })
                .transition().duration(2000).ease(d3.easeCubic)
                .attr("x", d => xScale(d[currentXValue]) - 15)
                .attr("y", d => yScale(d.Platzierung) - 15)
                .style("width", "30")
                .style("height", "30");

            addTooltip(team_images, currentXValue);
        }
    }
};

function addTooltip(images, currentXValue) {
    tooltip = g.append("circle")
        .attr("class", "tooltip")
    var clubInfo = g.append("text")
        .attr("class", "tooltipTxt");
    var allNodes;

    images.on("mouseover", function (d) {
        if (!_.isEmpty(lineData) && lineData.length != 0) {
            var lineGraph = g.append("path")
                .attr("class", "path")
                .attr("d", lineFunction(lineData[d.Verein]))
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("fill", "none");
        }

        tooltip
            .attr("cx", xScale(d[currentXValue]))
            .attr("cy", yScale(d.Platzierung))
            .transition()
            .style("opacity", 0.8)
            .style("visibility", "visible");

        clubInfo
            .attr("transform", "translate(" + xScale(d[currentXValue]) + "," + yScale(d.Platzierung) + ")")
            .attr("font-size", "1em")
            .attr("fill", "white")
            .attr("visibility", "visible")
            .attr("text-anchor", "middle")
            .attr("x", "0").attr("y", "-20").text(d["Verein"])
            .append("tspan").attr("x", "0").attr("y", "20").html(currentXValue + ": " + d[currentXValue])
            .append("tspan").attr("x", "0").attr("y", "40").html(`Number of Players: ${d.Kader}`)

        d3.select(this)
            .transition()
            .duration(200)
            .attr("x", xScale(d[currentXValue]) - 15)
            .attr("y", yScale(d.Platzierung) - 80);

        d3.selectAll("circle.tooltip").nodes().map(img => img.parentNode.appendChild(img))
        d3.select("text.tooltipTxt").nodes().map(img => img.parentNode.appendChild(img))
        allNodes = d3.selectAll("image.bar").nodes();
        this.parentNode.appendChild(this);
    })
    tooltip.on("mouseout", function (d) {

        d3.select(".path").remove();

        tooltip
            .transition()
            .style("opacity", 0)
        images
            .transition()
            .duration(800).ease(d3.easeBounce)
            .style("opacity", 1)
            .attr("x", d => xScale(d[currentXValue]) - 15)
            .attr("y", d => yScale(d.Platzierung) - 15)
            .style("width", "30")
            .style("height", "30");

        allNodes
            .map(img => img.closest("g").appendChild(img))

        clubInfo
            .attr("visibility", "hidden")
    });
}


// filters the data by the age and is needed for the slider functionality
function update(h, xAxisValue) {
    d3.selectAll(".tooltip").remove();
    d3.selectAll(".tooltipTxt").remove();
    // filter data set and redraw plot
    var newData = dataset.filter(function (d) {
        return d.Jahr == h;
    })

    filterYear = h;
    drawImages(newData, xAxisValue);
}

// It is needed for radiobutton selection
function changeIt(xAxisValue) {
    d3.selectAll("sliderbox").remove();
    d3.selectAll("#xAxis").remove();
    d3.selectAll("#xAxisText").remove();
    d3.selectAll(".tooltip").remove();
    d3.selectAll(".tooltipTxt").remove();
    d3.selectAll("#yAxis").remove();
    drawGraph(xAxisValue)
}

// redraws the xAxis and the most of the graph. It is called by changeIt(xAxisValue) function (radiobutton)
function drawGraph(xAxisValue) {

    successDomain = [d3.max(dataset, d => Number(d.Platzierung)) + 1, 0];
    if (xAxisValue == "Gesamtmarktwert") {
        background.attr("visibility", "visible");
        valueDomain = [0, d3.max(dataset, d => Number(d[xAxisValue])) + 20];
    }
    if (xAxisValue == "Durchschnittsalter") {
        background.attr("visibility", "hidden");
        var median = d3.median(dataset, d => Number(d[xAxisValue]));
        var max = d3.max(dataset, d => Number(d[xAxisValue]));
        var min = Math.round(median - (max - median));
        valueDomain = [min, max];
    }
    if (xAxisValue == "Fouls") {
        background.attr("visibility", "visible");
        valueDomain = [d3.max(dataset, d => Number(d[xAxisValue])) + 20, 300];
    }
    if (xAxisValue == "Umsatz") {
        background.attr("visibility", "visible");
        valueDomain = [-30, d3.max(dataset, d => Number(d[xAxisValue]))];
    }
    if (xAxisValue == "Running") {
        background.attr("visibility", "visible");
        valueDomain = [3750, d3.max(dataset, d => Number(d[xAxisValue]) + 30)];
    }


    d3.selectAll("#sliderSVG").remove()

    const slider = sliderFactory();
    let slideHolder = d3.select('body').append("sliderBox")
        .call(slider.ticks(1).scale(true).value(filterYear).range([2013, 2018]).dragHandler(function (d) {
            getValue(d);
            update(slider.value(), xAxisValue)
        }))

    // create scales for x and y direction
    xScale = d3.scaleLinear()
        .range([0, width])
        .domain(valueDomain);

    yScale = d3.scaleLinear()
        .range([height, 0])
        .domain(successDomain);

    // create xAxis
    xAxis = d3.axisBottom(xScale);
    g.append("g")  // create a group and add axis
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "xAxis")
        .call(xAxis);

    // create yAxis
    yAxis = d3.axisLeft(yScale).tickValues(placementValues);
    g.append("g")
        .attr("id", "yAxis")// create a group and add axis
        .call(yAxis)

    update(filterYear, xAxisValue)
}

function updateLineData(xy, verein) {
    if (lineData[verein] != undefined) {
        lineData[verein].push(xy);
    }
    else {
        lineData[verein] = [xy];
    }
}
var dataset;
var xScale;
var yScale;
var xAxis;
var yAxis;
var currentYear;
var counter = 0;


// create svg canvas
const canvHeight = 600, canvWidth = 800;


const svg = d3.select("body").append("svg")
    .attr("width", canvWidth)
    .attr("height", canvHeight);
    // .style("border", "1px solid");

// calc the width and height depending on margins.
const margin = {top: 50, right: 80, bottom: 50, left: 80};
const width = canvWidth - margin.left - margin.right;
const height = canvHeight - margin.top - margin.bottom;

// create parent group and add left and top margin
const g = svg.append("g")
    .attr("id", "chart-area")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var select = d3.select("#yProperty")
    .attr("y", height + margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1em")
    .attr('class','select')
    .on('change',onchange)
console.log(select);

var data = ["Budget", "anzl. Mitglieder", "anzl. gelbe Karten"];
var options = select
    .selectAll('option')
    .data(data).enter()
    .append('option')
    .text(function (d) { return d; });

function onchange() {
    selectValue = d3.select('select').property('value')
    d3.select('body')
        .append('p')
        .text(selectValue + ' is the last selected option.')
};


// text label for the y axis
g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .attr("id", "yAxisText")
    .style("text-anchor", "middle")
    .text("League Position");


// chart title
svg.append("text")
    .attr("y", 0)
    .attr("x", margin.left)
    .attr("dy", "1.5em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "24px")
    .style("text-anchor", "left")
    .text("Football - Which team is really efficient?");

// external Slider Library - see slider.js for code and source URL


function getValue(d) {
    var parseNum = d3.format(".0g");
    d3.select("#slideValue").text("Slider value " + parseNum(d.value()))
};


// Create tooltip
const tooltip = d3.select("body").append("tooltip")
    .attr("class", "tooltip");


// Initialize View and Data
d3.csv("./data/Bundesliga All Games 1993-2018 (football-data.co.uk).csv", function(error, allGamesData) {
    d3.csv("./data/Bundesliga All Players 2007-2018 (statbunker.com).csv", function(error, allPlayersData) {
        d3.csv("./data/bundesligaDataWithFouls.csv", function (error, data) {

            console.log(allGamesData[0]);

            var valueDomain = [0, d3.max(data, d => Number(d.Gesamtmarktwert))];
            var successDomain = [d3.max(data, d => Number(d.Platzierung))+1, 1];

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
            yAxis = d3.axisLeft(yScale);
            g.append("g")
                .attr("id", "yAxis")// create a group and add axis
                .call(yAxis)

            const slider = sliderFactory();
            let slideHolder = d3.select('body')
                .call(slider.ticks(1).scale(true).value(2015).range([2013, 2017]).dragHandler(function (d) {
                    getValue(d);
                    update(slider.value(), "Gesamtmarktwert")
                }))

            dataset = data;
            update(2015, "Gesamtmarktwert")

            d3.selectAll(".radioB").on("click", function () {
                if (this.value == "Gesamtmarktwert") {
                    console.log("Gesamtmarktwert selected")

                    changeIt("Gesamtmarktwert")
                    // Determine how to size the slices.
                } else if (this.value == "Durchschnittsalter") {
                    console.log("Durchschnittsalter selected")

                    changeIt("Durchschnittsalter")
                }
                else if (this.value == "Fouls") {
                    console.log("Fouls selected")

                    changeIt("Fouls")
                }
                else if (this.value == "Umsatz") {
                    console.log("Umsatz selected")

                    changeIt("Umsatz")
                }
            });
        });
    });
});



// draws the images and is called by update(h, AxisValue)
function drawImages(data, xAxisValue) {


    // d3.selectAll("image").remove()

    var currentXValue = xAxisValue;
    console.log("currentXValue: " + currentXValue)
    var team_images = g.selectAll("image")
        .data(data)


    if(counter != 0) {
        team_images
            .transition().duration(2000).ease(d3.easeBounce)
            .attr("x", d => xScale(d[currentXValue]) - 15)
            .attr("y", d => yScale(d.Platzierung) - 15);
    } else {
        counter = 1;
        var images = team_images.enter()
            .append("g:image")
            .attr("class", "bar")
            .attr("xlink:href", function (d) {
                return "./images/" + d.Verein + ".gif"
            })
            .attr("x", d => xScale(d[currentXValue])-15)
            .attr("y", d => yScale(d.Platzierung)-15)
            .style("width", "30")
            .style("height","30");

        images.on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
                .style("visibility", "visible");
            tooltip.html(`${d["Verein"]} <br/>`
                + currentXValue + `: ${d[currentXValue]}<br/>`
                + `League Position: ${d.Platzierung}<br/>`
            )
                .attr("x", ((d3.select(this).attr("x"))) + "px")
                .attr("y", ((d3.select(this).attr("y"))) + "px");
            d3.select(this)
                .style("opacity", 0.3)
                .transition()
                .duration(200)
                .attr("x", d => xScale(d[currentXValue])-100)
                .attr("y", d => yScale(d.Platzierung)-100)
                .style("width", "200")
                .style("height","200");
        })
        tooltip.on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            images
                .transition()
                .duration(100)
                .style("opacity", 1)
                .attr("x", d => xScale(d[currentXValue])-15)
                .attr("y", d => yScale(d.Platzierung)-15)
                .style("width", "30")
                .style("height","30");
        });
    }
};

// var imgScaleFactor = {"Gesamtmarktwert":0.5,"Durchschnittsalter":2,"Fouls":0.1,"Umsatz":0.5};
//
// function imgScale(value, currentXValue){
//     console.log( imgScaleFactor[currentXValue] )
//     return imgScaleFactor[currentXValue] * value;
// }

// filters the data by the age and is needed for the slider functionality
function update(h, xAxisValue) {
    // update position and text of label according to slider scale
    console.log("xAxisValue at update Function: " + xAxisValue)

    //
    // filter data set and redraw plot
    var newData = dataset.filter(function (d) {
        return d.Jahr == h;
    })
    currentYear = h;
    drawImages(newData, xAxisValue);
}

// It is needed for radiobutton selection
function changeIt(xAxisValue) {


    d3.selectAll("#xAxis").remove()
    d3.selectAll("#xAxisText").remove()

    console.log(" changeIt executed")

    drawGraph(xAxisValue)


}

// redraws the xAxis and the most of the graph. It is called by changeIt(xAxisValue) function (radiobutton)
function drawGraph(xAxisValue) {

    d3.csv("./data/bundesligaDataWithFouls.csv", function (error, data) {
        var successDomain = [d3.max(data, d => Number(d.Platzierung)) + 1, d3.min(data, d => Number(d.Platzierung))];
        if (xAxisValue == "Gesamtmarktwert") {

            var valueDomain = [d3.max(data, d => Number(d[xAxisValue])), 22];

        }
        if (xAxisValue == "Durchschnittsalter") {
            var valueDomain = [d3.max(data, d => Number(d[xAxisValue])), 22];
        }
        if (xAxisValue == "Fouls") {
            var valueDomain = [d3.max(data, d => Number(d[xAxisValue])), 350];
        }
        if (xAxisValue == "Umsatz") {
            var valueDomain = [d3.max(data, d => Number(d[xAxisValue])), 30];
        }


        d3.selectAll("#sliderSVG").remove()

        const slider = sliderFactory();
        let slideHolder = d3.select('body')
            .call(slider.ticks(1).scale(true).value(currentYear).range([2013, 2017]).dragHandler(function (d) {
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
        yAxis = d3.axisLeft(yScale);
        g.append("g")
            .attr("id", "yAxis")// create a group and add axis
            .call(yAxis)

        dataset = data;
        console.log("currentYear is: "+currentYear)
        update(currentYear, xAxisValue)

    })
}
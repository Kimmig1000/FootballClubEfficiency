var dataset;
var xScale;
var yScale;


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

const slider = sliderFactory();
let slideHolder = d3.select('body')
    .call(slider.ticks(1).scale(true).value(2015).range([2013,2017]).dragHandler(function(d) {getValue(d); update(slider.value())}))


function getValue(d) {
    var parseNum = d3.format(".0g");
    d3.select("#slideValue").text("Slider value "+parseNum(d.value())) };


const body1 = d3.select("body")
    .attr("x",20)
    .attr("y",canvHeight + 20);

body1.append("slideHolder")



d3.csv("./data/bundesligaDaten.csv", function(error, data) {
    const valueDomain = [d3.max(data, d => Number(d.Gesamtmarktwert)),0];
    const successDomain = [d3.max(data, d => Number(d.Platzierung)) + 1,d3.min(data, d => Number(d.Platzierung))];

// create scales for x and y direction
    xScale = d3.scaleLinear()
        .range([0,width])
        .domain(valueDomain);

    yScale = d3.scaleLinear()
        .range([height,0])
        .domain(successDomain);

// create xAxis
    const xAxis = d3.axisBottom(xScale);
    g.append("g")  // create a group and add axis
        .attr("transform", "translate(0," + height + ")")
        .attr("id","xAxis")
        .call(xAxis);


// create yAxis
    const yAxis = d3.axisLeft(yScale);
    g.append("g")
        .attr("id","yAxis")// create a group and add axis
        .call(yAxis)

    dataset = data;
    update(2015)

    // text label for the x axis
    g.append("text")
        .attr("y", height + margin.bottom / 2)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .attr("font-family", "sans-serif")
        .attr("id","xAxisText")
        .style("text-anchor", "middle")
        .text("Total market value in Mio €");

// text label for the y axis
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .attr("font-family", "sans-serif")
        .attr("id","yAxisText")
        .style("text-anchor", "middle")
        .text("League Position");

})




// Create tooltip
const tooltip = d3.select("body").append("tooltip")
    .attr("class", "tooltip");

//.ticks(18);
//.nice(1);
// load the data from the cleaned csv file.
// note: the call is done asynchronous.
// That is why you have to load the data inside of a
// callback function.
function drawGesamtWertVersusPlatzierung(data) {
    //const valueDomain = d3.extent(data, d => Number(d.Gesamtmarktwert));
    //const successDomain = d3.extent(data, d => Number(d.Platzierung));

    d3.selectAll("image").remove()


    var team_images = g.selectAll("image")
        .data(data)

        team_images.enter()
        .append("g:image")
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






};

function update(h) {
    // update position and text of label according to slider scale


    // filter data set and redraw plot
    var newData = dataset.filter(function(d) {
        return d.Jahr == h;
    })

    drawGesamtWertVersusPlatzierung(newData);
}


function createAxisPlatzierungVersusKarten(){



    d3.csv("./data/bundesligaDaten.csv", function(error, data) {
        const valueDomain = [d3.max(data, d => Number(d.Gesamtmarktwert)),0];
        const successDomain = [d3.max(data, d => Number(d.Platzierung)) + 1,d3.min(data, d => Number(d.Platzierung))];

// create scales for x and y direction
        xScale = d3.scaleLinear()
            .range([0,width])
            .domain(valueDomain);

        yScale = d3.scaleLinear()
            .range([height,0])
            .domain(successDomain);

// create xAxis
        const xAxis = d3.axisBottom(xScale);
        g.append("g")  // create a group and add axis
            .attr("transform", "translate(0," + height + ")").call(xAxis);


// create yAxis
        const yAxis = d3.axisLeft(yScale);
        g.append("g")  // create a group and add axis
            .call(yAxis)
        dataset = data;
        update(2015)

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

    })

}

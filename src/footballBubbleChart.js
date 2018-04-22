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
    .text("Football-Which team is really efficient?");

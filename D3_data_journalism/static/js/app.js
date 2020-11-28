// Application to render data into interactive D3 plots.

// Creating a pattern area to render future charts

var svgWidth = 800;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// SVG wrapper, append an SVG group that will hold our chart

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function to update xAxis then clicked on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newScale);

    xAxis.transition()
        .duration(1500)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1500)
        .call(leftAxis);

    return yAxis;
}

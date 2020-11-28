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

// Function to update Axes then clicked on axis label
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

// Function to update Axes scales then clicked on axis label
function xScale(journalData, chosenXAxis) {
    var xLinScale = d3.scaleLinear()
        .domain([d3.min(journalData, d => d[chosenXAxis]) * 0.9,
        d3.max(journalData, d => d[chosenXAxis]) * 1.1
        ]).range([0, width]);

    return xLinScale;
}

function yScale(journalData, chosenYAxis) {
    var yLinScale = d3.scaleLinear()
        .domain([d3.min(journalData, d => d[chosenYAxis]) * 0.7,
        d3.max(journalData, d => d[chosenYAxis]) * 1.1
        ]).range([height, 0]);

    return yLinScale;
}

// Function to update circle groups with transition to a new circle
function renderCircles(circleGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circleGroup.transition()
        .duration(1500)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circleGroup;
}

// Creating circle text labels
function renderText(textLabel, newXScale, chosenXAxis, chosenYAxis) {
    textLabel.transition()
        .duration(1500)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]) + 6);

    return textLabel;
}

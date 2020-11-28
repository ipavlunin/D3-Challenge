// Application to render data into interactive D3 plot.

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
    var bottomAxis = d3.axisBottom(newXScale);

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
function xScale(censusData, chosenXAxis) {
    var xLinScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
        d3.max(journalData, d => d[chosenXAxis]) * 1.1
        ]).range([0, width]);

    return xLinScale;
}

function yScale(censusData, chosenYAxis) {
    var yLinScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.7,
        d3.max(censusData, d => d[chosenYAxis]) * 1.1
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

// Function to update circle groups with new tooltips
function updateTooltip(chosenXAxis, chosenYAxis, textLabel) {

    var xLabel;
    var yLabel;

    if (chosenXAxis === "poverty") {
        xLabel = "Poverty(%):";
    }
    else if (chosenXAxis === "income") {
        xLabel = "Income($$$):";
    }
    else {
        xLabel = "Age:";
    }

    if (chosenYAxis === "healthcare") {
        yLabel = "Healthcare(%):";
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes:";
    }
    else {
        yLabel = "Obese:";
    }


    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .style("text-align", center)
        .style("background-color", lightgrey)
        .style("opacity", 0.5)
        .style("color", black)
        .offset([80, 40])
        .html(function (d) {
            return (`${d, state}<br>${yLabel} ${d[chosenYAxis]}<br>${xLabel} ${d[chosenXAxis]}`);
        });

    textLabel.call(toolTip);

    textLabel.on("mouseover", function (data) {
        toolTip.show(data);
    })

        .on("mouseout", function (data) {
            toolTip.hide(data);
        });

    return textLabel;
}

// Reading data from CSV file
d3.csv("static/data/data.csv").then(function (censusData) {
    console.log(censusData);

    // data parsing
    censusData.forEach(function (data) {
        data.age = +data.age;
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    })

    // Assigning data to axis, labels, tooltip functions
    var xLinScale = xScale(censusData, chosenXAxis);

    var yLinScale = yScale(censusData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinScale);

    var leftAxis = d3.axisLeft(yLinScale);

    var xAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circleGroup = chartGroup.selectAll("circle")
        .data(journalData)
        .enter()
        .append("circle")
        .classed("circle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "steelblue")
        .attr("opacity", 0.8);

    var textLabel = chartGroup.selectAll("null")
        .data(journalData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("class", "stateText")
        .attr("font-size", 10px)
        .attr("dominant-baseline", "middle")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]) - 0.6);

    var xlabGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In poverty (%)");

    var ageLabel = xlabGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    var ylabGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
        .attr("class", "axisText")
        .attr("x", 0 - (height / 2))
        .style("text-anchor", "middle");

    var healthLabel = ylabGroup.append("text")
        .attr("y", 60 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare")
        .attr("dy", "1em")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var obesLabel = ylabGroup.append("text")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity")
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Obese (%)");

    var smokesLabel = ylabGroup.append("text")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Smokes (%)");

    var textLabel = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

    // Event listener for x-axis
    xlabGroup.selectAll("text").on("click", function () {

        var xvalue = d3.select(this).attr("value");
        if (xvalue !== chosenXAxis) {

            chosenXAxis = xvalue;
            console.log(chosenXAxis);

            xLinScale = xScale(censusData, chosenXAxis);

            xAxis = renderAxes(xLinScale, xAxis);

            circleGroup = renderCircles(circleGroup, xLinScale, yLinScale, chosenXAxis, chosenYAxis);
            textLabel = renderText(textLabel, xLinScale, yLinScale, chosenXAxis, chosenYAxis);

            textLabel = updateToolTip(chosenXAxis, chosenYAxis, textLabel);

            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "poverty") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });

    // Event listener for y-axis



})
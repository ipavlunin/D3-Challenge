/// Application to render data into interactive D3 plot ///
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

// Function to update Axes scales then clicked on axis label
function xScale(censusData, chosenXAxis) {
    var xLinScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
        d3.max(censusData, d => d[chosenXAxis]) * 1.1
        ]).range([0, width]);

    return xLinScale;
}

function yScale(data, chosenYAxis) {
    var yLinScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.7,
        d3.max(data, d => d[chosenYAxis]) * 1.1
        ]).range([height, 0]);

    return yLinScale;
}

// Function to update Axes then clicked on axis label
function renderXAxis(newXScale, xAxis) {
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

// Function to update circle groups with transition to a new circle
function renderCircles(circleGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circleGroup.transition()
        .duration(1500)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circleGroup;
}

// Creating circle text labels
function renderText(textLabel, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    textLabel.transition()
        .duration(1500)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]) + 6);

    return textLabel;
}

// Function to update circle groups with new tooltips
function updateToolTip(chosenXAxis, chosenYAxis, textLabel) {

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
        .style("text-align", "center")
        .style("background-color", "lightgrey")
        .style("opacity", "0.5")
        .style("color", "black")
        .offset([80, 60])
        .html(function (d) {
            return (`${d.state} <br>${yLabel} ${d[chosenYAxis]}<br>${xLabel} ${d[chosenXAxis]}`);
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
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circleGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .classed("circle", true)
        .attr("cx", d => xLinScale(d[chosenXAxis]))
        .attr("cy", d => yLinScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "steelblue")
        .attr("opacity", 0.8);

    var textLabel = chartGroup.selectAll("null")
        .data(censusData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("class", "stateText")
        .attr("font-size", "10px")
        .attr("dominant-baseline", "middle")
        .attr("x", d => xLinScale(d[chosenXAxis]))
        .attr("y", d => yLinScale(d[chosenYAxis]) - 0.6);

    var xlabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In poverty (%)");

    var ageLabel = xlabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    var ylabelGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
        .attr("class", "axisText")
        .attr("x", 0 - (height / 2))
        .style("text-anchor", "middle");

    var healthLabel = ylabelGroup.append("text")
        .attr("y", 60 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare")
        .attr("dy", "1em")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var obesLabel = ylabelGroup.append("text")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity")
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Obese (%)");

    var smokesLabel = ylabelGroup.append("text")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Smokes (%)");

    var textLabel = updateToolTip(chosenXAxis, chosenYAxis, textLabel);

    // Event listener for x-axis
    xlabelGroup.selectAll("text")
        .on("click", function () {

            var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {

                chosenXAxis = xValue;
                // console.log(chosenXAxis);

                xLinScale = xScale(censusData, chosenXAxis);

                xAxis = renderXAxis(xLinScale, xAxis);

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
    ylabelGroup.selectAll("text")
        .on("click", function () {

            var yValue = d3.select(this).attr("value");
            if (yValue !== chosenYAxis) {

                chosenYAxis = yValue;
                // console.log(chosenYAxis);

                yLinScale = yScale(censusData, chosenYAxis);

                yAxis = renderYAxis(yLinScale, yAxis);

                circleGroup = renderCircles(circleGroup, xLinScale, yLinScale, chosenXAxis, chosenYAxis);
                textLabel = renderText(textLabel, xLinScale, yLinScale, chosenXAxis, chosenYAxis);

                textLabel = updateToolTip(chosenXAxis, chosenYAxis, textLabel);

                if (chosenYAxis === "smokes") {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else if (chosenYAxis === "obesity") {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
})
// svg dimensions
let svgHeight = 960;
let svgWidth = 500;

// make responsive function
function makeResponsive() {

  var svgArea = d3.select("#foot").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }}

// set chart margins
let chartMargins = {
    top: 50,
    right: 50,
    bottom: 65,
    left: 65
};

// set chart dimensions
let chartWidth = svgWidth - chartMargins.left - chartMargins.right;
let chartHeight = svgHeight - chartMargins.top - chartMargins.bottom;

// create svg and svg group html elements
let svg = d3.select('#foot')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth);

let chartGroup = svg.append('g')
    .attr('transform', `translate(${chartMargins.left}, ${chartMargins.top})`);

// read csv and draw
let csvPath = 'assets/data/data.csv';
d3.csv(csvPath).then(csvData => {
    // test to print data
    console.log(csvData);

    let factorsArray = ['healthcare', 'age', 'income', 'poverty', 'smokes', 'obesity'];
    // nested forEach to convert column values to int
    csvData.forEach(function(state) {
        factorsArray.forEach(factor => {
            state[`${factor}`] = +state[`${factor}`]
        });
    });
    
    // set x scales for axes

    let XScales = {};

    factorsArray.slice(0, 3).forEach(factor => {
        XScales[`${factor}`] = d3.scaleLinear()
        .domain([0, d3.max(csvData, d => d[`${factor}`])])
        .range([0, chartWidth]);

    });

    // set y scales for axes
    let YScales = {};

    factorsArray.slice(3, 7).forEach(factor => {
        YScales[`${factor}`] = d3.scaleLinear()
        .domain([0, d3.max(csvData, d => d[`${factor}`])])
        .range([chartHeight, 0]);

    });
    
    // create Axes
    
    let bottomAxisHealthcare = d3.axisBottom(XScales['healthcare']);
    let bottomAxisAge = d3.axisBottom(XScales['age']);
    let bottomAxisIncome = d3.axisBottom(XScales['income']);

    let leftAxisPoverty = d3.axisLeft(YScales['poverty']);
    let leftAxisSmokes = d3.axisLeft(YScales['smokes']);
    let leftAxisObesity = d3.axisLeft(YScales['obesity']);

    //append axes to svg group
    
    //create bottom axis as one continuous group that can slide to different positions
    let bottomAxisGroup = chartGroup.append('g');

    let bottomAxisPositions = {
        healthcare : 0,
        age : chartWidth +200,
        income: -chartWidth -200
    };
    bottomAxisGroup.append('g')
        .attr('transform', `translate(${bottomAxisPositions['healthcare']}, ${chartHeight})`)
        .call(bottomAxisHealthcare);

    bottomAxisGroup.append('g')
        .attr('transform', `translate(${bottomAxisPositions['age']}, ${chartHeight})`)
        .call(bottomAxisAge);

    bottomAxisGroup.append('g')
        .attr('transform', `translate(${bottomAxisPositions['income']}, ${chartHeight})`)
        .call(bottomAxisIncome);

    //left

    let leftAxisGroup = chartGroup.append('g');
    let leftAxisPositions = {
        poverty : 0,
        smokes : chartHeight + 200,
        obesity : -chartHeight - 200
    };

    leftAxisGroup.append('g')
        .call(leftAxisPoverty);

    leftAxisGroup.append('g')
        .attr('transform', `translate(0, ${leftAxisPositions['smokes']})`)
        .call(leftAxisSmokes);

    leftAxisGroup.append('g')
        .attr('transform', `translate(0, ${leftAxisPositions['obesity']})`)
        .call(leftAxisObesity);

    // BIG MONEY TIME MAKE THE CIRCLES
    let stateCircles = chartGroup.selectAll('.stateCircle')
        .data(csvData)
        .enter()
        .append('circle')
        .classed('stateCircle', true)
        .attr('cx', d => XScales['healthcare'](d['healthcare']))
        .attr('cy', d => YScales['poverty'](d['poverty']))
        .attr('r', '10');

    // add circle text for each state
    let stateLabels = chartGroup.selectAll('.stateText')
        .data(csvData)
        .enter()
        .append('text')
        .text(d => d.abbr)
        .classed('stateText', true)
        .attr('x', d => XScales['healthcare'](d['healthcare']))
        .attr('y', d => YScales['poverty'](d['poverty']))
        .attr('font-size', '8px');

    //draw axis labels
    // x axis labels
    let xLabelObject = {};

    xLabelObject['healthcare'] = chartGroup.append('text')
        .attr('transform', `translate(${chartWidth/2}, ${chartHeight + chartMargins.top - 20})`)
        .attr("fontsize", 8)
        .classed('active', true)
        .text('% of Households with Healthcare');
    
    xLabelObject['age'] = chartGroup.append('text')
        .attr('transform', `translate(${chartWidth/2}, ${chartHeight + chartMargins.top - 7})`)
        .attr("fontsize", 8)
        .classed('inactive', true)
        .text('Average Household Age');

    xLabelObject['income'] = chartGroup.append('text')
        .attr('transform', `translate(${chartWidth/2}, ${chartHeight + chartMargins.top + 5})`)
        .attr("fontsize", 8)
        .classed('inactive', true)
        .text('Average Household Income');

    // y axis labels

    let yLabelObject = {};
    yLabelObject['obesity'] = chartGroup.append('text')
        .attr('transform', `translate(${chartMargins.left - 93}, ${chartHeight/2}) rotate(-90)`)
        .attr("fontsize", 8)
        .classed('active', true)
        .text('% of Households with an Obese Adult');

    yLabelObject['poverty'] = chartGroup.append('text')
        .attr('transform', `translate(${chartMargins.left - 105}, ${chartHeight/2}) rotate(-90)`)
        .attr("fontsize", 8)
        .classed('inactive', true)
        .text('% of Households in Poverty');

    yLabelObject['smokes'] = chartGroup.append('text')
        .attr('transform', `translate(${chartMargins.left - 115}, ${chartHeight/2}) rotate(-90)`)
        .attr("fontsize", 8)
        .classed('inactive', true)
        .text('% of Households with Smokers');

    // Let's add tooltips - fun for the whole family
    // create tooltip and call to svg chart area
    let toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([120,80])
        .html(function(d) {
            return (`<p><strong>${d.state}</strong></p>
            <p>${d.healthcare}% have healthcare</p>
            <p>${d.poverty}% in poverty</p>`);
        });

    stateCircles.call(toolTip);

    // create listener for mouseover to show tooltips
    stateLabels.on('mouseover', function(d){
        toolTip.show(d, this);
    })
    .on('mouseout', function(d){
        toolTip.hide(d);

    });

    // create .on() listener for clicks on axes
    Object.keys(xLabelObject).forEach(key => {
        xLabelObject[`${key}`].on('click', function(){

            //move all circle markers
            stateCircles.transition()
            .duration(500)
            .attr('cx', d => XScales[`${key}`](d[`${key}`]));

            //move all text labels
    
            stateLabels.transition()
            .duration(500)
            .attr('x', d => XScales[`${key}`](d[`${key}`]));

            // move axes on click
            bottomAxisGroup.transition()
            .duration(500)
            .attr('transform', `translate(${bottomAxisPositions[key]}, 0)`);
        
    });

    });
    
    // create .on() listener for clicks on Y axes
    Object.keys(yLabelObject).forEach(key => {
        yLabelObject[`${key}`].on('click', function(){

            //move all circle markers
            stateCircles.transition()
            .duration(500)
            .attr('cy', d => YScales[`${key}`](d[`${key}`]));

            //move all text labels
    
            stateLabels.transition()
            .duration(500)
            .attr('y', d => YScales[`${key}`](d[`${key}`]))

            // move axes on click
            leftAxisGroup.transition()
            .duration(500)
            .attr('transform', `translate(0, ${leftAxisPositions[key]})`)
        
    });

    });
}
    ).catch(function(error) {
        console.log(error);
    });
    
// makeResponsive();
// d3.select(window).on("resize", makeResponsive);



function plotColorMap(dimensions) {
    // extract parameters
    width = dimensions.width;
    height = dimensions.height;
    
    width_svg = width + margin.left + margin.right;
    height_svg = 50;

    $('#viz_color_map').empty();
    var svg = d3.select('#viz_color_map')
        .append('svg')
        .attr('width', width_svg)
        .attr('height', height_svg);

    var colors = ['red', 'yellow', 'green'];
    var l = colors.length - 1;

    var linear_gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'grad')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

    linear_gradient.selectAll('stop')
        .data(colors)
        .enter()
        .append('stop')
        .style('stop-color', function(d) { return d; })
        .attr('offset', function(d, i) {
            return 100 * (i / l) + '%';
        });

    svg.append('rect')
        .attr('x', 0)
        .attr('y', 20)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height_svg)
        .style('fill', 'url(#grad)');

    svg.append("text")
        .attr("x", 0)
        .attr("y", 12)
        .text('0.0')
        .style("font-size", "10px")
        .style("font-weight", "bold");
    
    svg.append("text")
        .attr("x", (width + margin.left + margin.right - 20) / 2)
        .attr("y", 12)
        .text('5.0')
        .style("font-size", "10px")
        .style("font-weight", "bold");

    svg.append("text")
        .attr("x", width + margin.left + margin.right - 20)
        .attr("y", 12)
        .text('10.0')
        .style("font-size", "10px")
        .style("font-weight", "bold");
}

// inspired by: https://observablehq.com/d/3b363d37f93bd20b
function plotNetwork(network, dimensions) {
    // extract parameters
    width = dimensions.width;
    height = dimensions.height;

    width_svg = width + margin.left + margin.right;
    height_svg = height + margin.top + margin.bottom;

    $('#viz_network').empty()
    var svg = d3.select("#viz_network")
                .append("svg")
                .attr("width", width_svg)
                .attr("height", height_svg);

    const nodes = Array.from(new Set(network.flatMap(l => [l.source, l.target])), id => ({id}));
    const links = network.map(d => Object.create(d));
    
    // simulate actor network
    const simulation = d3.forceSimulation(nodes)
                            .force("link", d3.forceLink(links).id(d => d.id))
                            .force("charge", d3.forceManyBody().strength(-400))
                            .force("x", d3.forceX())
                            .force("y", d3.forceY());
    

    drag = simulation => {
        return d3.drag()
                .on("start", function (event, d) {
                    if (!event.active) {
                        simulation.alphaTarget(0.3).restart();
                    }
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", function (event, d) {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", function (event, d) {
                    if (!event.active) {
                        simulation.alphaTarget(0);
                    }
                    d.fx = null;
                    d.fy = null;
                });
    };

    // draw links between actors
    const g = svg.append('g');
    const link = g.attr("fill", "none")
                    .attr("stroke-width", 2)
                    .selectAll("path")
                    .data(links)
                    .join("path")
                    .attr("stroke", function(d) {
                        return d.type;
                    });
    
    // draw actors as nodes
    const node = g.append("g")
                    .attr("fill", "currentColor")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-linejoin", "round")
                    .selectAll("g")
                    .data(nodes)
                    .join("g")
                    .call(drag(simulation));
    
    node.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", 4);
    
    node.append("text")
        .attr("x", 8)
        .attr("y", "0.31em")
        .text(function (d) {
            return d.id;
        })
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);
    
    simulation.on("tick", () => {
        link.attr("d", function (d) {
            return `M${d.source.x}, ${d.source.y}
                    L${d.target.x}, ${d.target.y}`;
        });
        node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    // zooming
    svg.call(d3.zoom()
                .extent([[0, 0], [width_svg, height_svg]])
                .scaleExtent([0.25, 8])
                .on("zoom", function ({transform}) {
                    g.attr("transform", transform);
                }));          

    plotColorMap(dimensions);
}


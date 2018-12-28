'use strict';
var Map = function() {
    return {
        debug: false,
        width: Math.max(960, window.innerWidth),
        height: Math.max(500, window.innerHeight),
        svg: null,
        graph: null,
        radius: 10,
        createSubRedditNode: function(id) {
            this.graph.subreddits.push({ id: id, name: "r/"+id });
            // console.log(this.graph.subreddits);
        },
        createUserNode: function(authorId, subredditId) {
            this.graph.users.push({ id: authorId });
        },
        init: function() {
            this.svg = d3.select("body")
            .append("svg")
                .attr("class", "map")
                .style("width", this.width + "px")
                .style("height", this.height + "px");
                
            this.graph =
                {
                    subreddits: [],
                    users: [],
                    links: []
                };

            var map = d3.select(".map");

            // var linkForce = d3.forceLink()
            //     .id(link => link.id)
            //     .distance(50)
            //     .strength(link => .01);
            
            this.simulation = d3
                .forceSimulation()
                // .force("link", linkForce)
                .force("charge", d3.forceManyBody()
                    .strength(.2)
                    )
                .force("collision", d3.forceCollide(this.radius*4))
                .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                ;
            
            // this.linkGroup = map.append("g")
            //     .attr("class", "links");
            this.nodeGroup = map.append("g")
                .attr("class", "nodes");
            
            this.updateSimulation();
        },
        dragDrop: null,
        linkElements: null,
        nodeElements: null,
        linkGroup: null,
        nodeGroup: null,
        updateGraph: function() {
            this.nodeElements = this.nodeGroup.selectAll("g")
                .data(this.graph.subreddits);
            
            this.nodeElements.exit().remove();

            var nodeEnter = this.nodeElements.enter()
                .append("g")
                    .attr("x", this.width / 2)
                    .attr("y", this.height / 2)
                    ;
            nodeEnter
                .append("circle")
                    .attr("id", function(d) { return d.id; })
                    .attr("data-id", d => d.id)
                    .attr("stroke", "black")
                    .attr("stroke-width", "1px")
                    .attr("r", this.radius);
            nodeEnter
                .append("text")
                    .attr("y", -15)
                    .attr("x", d => -((d.id.length * 12) / 4))
                    .text(d => d.name)
                ;

            this.nodeElements = nodeEnter.merge(this.nodeElements);
        },
        updateSimulation: function() {    
            this.updateGraph();
            this.simulation.nodes(this.graph.subreddits).on("tick", () => {
            
                this.nodeElements
                    .attr('transform', node => "translate(" + node.x + "," + node.y + ")")
                    ;
            
                // this.linkElements
                //     .attr("x1", link => link.source.x)
                //     .attr("y1", link => link.source.y)
                //     .attr("x2", link => link.target.x)
                //     .attr("y2", link => link.target.y);
            
            });
        
            // this.simulation.force("link").links(this.graph.links);
            this.simulation.alphaTarget(20).restart();
        }
    }
}();
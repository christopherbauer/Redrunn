'use strict';
var Map = function() {
    return {
        debug: false,
        width: Math.max(960, window.innerWidth),
        height: Math.max(500, window.innerHeight),
        svg: null,
        graph: null,
        radius: 10,
        linkGroup: null,
        createSubRedditNode: function(id) {
            this.graph.subreddits.push({ id: id, name: "r/"+id });
        },
        createUserNode: function(authorId, subredditId) {
            this.graph.users.push({ id: authorId });
            this.graph.links.push({ source: subredditId, target: authorId });
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

            var linkForce = d3.forceLink()
                .id(link => link.id)
                .distance(5)
                .strength(link => .01);
            
            this.simulation = d3
                .forceSimulation()
                .force("link", linkForce)
                .force("charge", d3.forceManyBody()
                    .strength(.2)
                    )
                .force("collision", d3.forceCollide(this.radius*4))
                .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                ;
            
            this.linkGroup = map.append("g")
                .attr("class", "links");
            this.nodeGroup = map.append("g")
                .attr("class", "nodes");
            this.nodeElements = this.nodeGroup.selectAll("g");
            this.updateSimulation();
        },
        dragDrop: null,
        linkElements: null,
        nodeElements: null,
        linkGroup: null,
        nodeGroup: null,
        updateSubreddits: function() {
            var elements = this.nodeGroup.selectAll("g.subreddit")
                .data(this.graph.subreddits);
            
            var nodeEnter = elements.enter()
                .append("g")
                    .attr("class", "subreddit")
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
                    .attr("x", d => -((d.name.length * 12) / 4))
                    .text(d => d.name)
                ;

            elements.exit().remove();

            this.nodeElements = nodeEnter.merge(this.nodeElements);
        },
        updateUsers: function() {
            var elements = this.nodeGroup.selectAll("g.user")
                .data(this.graph.users);
            
            var nodeEnter = elements.enter()
                .append("g")
                    .attr("class", "user")
                    .attr("x", this.width / 2)
                    .attr("y", this.height / 2)
                    ;

            nodeEnter
                .append("circle")
                    .attr("id", function(d) { return d.id; })
                    .attr("data-id", d => d.id)
                    .attr("stroke", "black")
                    .attr("stroke-width", "1px")
                    .attr("r", this.radius / 2);
            
            nodeEnter
                .append("text")
                    .attr("y", -15)
                    .attr("x", d => -((d.id.length * 12) / 4))
                    .text(d => d.id)
                ;

            elements.exit().remove();

            this.nodeElements = nodeEnter.merge(this.nodeElements);
        },
        updateLinkElements: function() {
            this.linkElements = this.linkGroup.selectAll("line")
                .data(this.graph.links);
        
            this.linkElements.exit().remove();
        
            var linkEnter = this.linkElements
                .enter().append("line")
                    .attr("stroke-width", 1)
                    .attr("stroke", "#e5e5e5");
        
            this.linkElements = linkEnter.merge(this.linkElements);
        },
        updateGraph: function() {
            this.updateLinkElements();
            this.updateSubreddits();
            this.updateUsers();
        },
        updateSimulation: function() {
            this.updateGraph();
            var nodeSource = this.graph.subreddits.concat(this.graph.users);
            
            var simulation = this.simulation.nodes(nodeSource);
            console.log({ subCount: this.graph.subreddits.length, userCount: this.graph.users.length, nodeSourceCount: nodeSource.length});
            console.log(this.nodeElements._groups);

            simulation.on("tick", () => {
                this.nodeElements
                    .attr('transform', node => "translate(" + node.x + "," + node.y + ")")
                    ;
            
                this.linkElements
                    .attr("x1", link => link.source.x)
                    .attr("y1", link => link.source.y)
                    .attr("x2", link => link.target.x)
                    .attr("y2", link => link.target.y);
            
            });
        
            simulation.force("link").links(this.graph.links);
            simulation.alphaTarget(20).restart();
        }
    }
}();
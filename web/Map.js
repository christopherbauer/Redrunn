'use strict';
var Map = function() {
    return {
        debug: false,
        width: Math.max(2000, window.innerWidth),
        height: Math.max(2000, window.innerHeight),
        svg: null,
        graph: null,
        radius: 10,
        linkGroup: null,
        createRedditNode: function() {
            this.graph.reddit.push({ id: "reddit", name: "Reddit", type: NodeType.REDDIT });
            return "reddit";
        },
        createSubRedditNode: function(subRedditId, redditId) {
            this.graph.subreddits.push({ id: subRedditId, name: "r/"+subRedditId, type: NodeType.SUBREDDIT });
            this.graph.links.push({ source: redditId, target: subRedditId });
        },
        createUserNode: function(authorId, subredditId, comment) {
            this.graph.users.push({ id: authorId, type: NodeType.USER, comment: comment });
            this.graph.links.push({ source: subredditId, target: authorId });
        },
        init: function() {
            this.svg = d3.select("body")
                .append("svg")
                    .attr("class", "map")
                    .style("width", this.width + "px")
                    .style("height", this.height + "px");
            
            this.svg.append("text")
                .attr("id", "redditComment")
                .attr("x", 0)
                .attr("y", 15)
                .attr("cx", "5%")
                .attr("cy", "1%")
                .attr("width", this.width + "px")
                .attr("height", 100 + "px")
                ;

            this.graph =
                {
                    reddit: [],
                    subreddits: [],
                    users: [],
                    links: []
                };

            var map = d3.select(".map");

            var linkForce = d3.forceLink()
                .id(link => link.id)
                .distance(node => {
                    if(node.source.type === NodeType.REDDIT && node.target.type === NodeType.SUBREDDIT) return 100;
                    if(node.source.type === NodeType.SUBREDDIT && node.target.type === NodeType.USER) return 20;
                })
                .strength(link => .05);
            
            this.simulation = d3
                .forceSimulation()
                .force("link", linkForce)
                .force("charge", d3.forceManyBody()
                    .strength(node => {
                        switch(node.type) {
                            case NodeType.REDDIT:
                                return 0;
                                break;
                            case NodeType.SUBREDDIT:
                                return -100;
                                break;
                            case NodeType.USER:
                                return 20;
                                break;
                        }
                    })
                )
                .force("collision", d3.forceCollide(node => {
                    switch(node.type) {
                        case NodeType.REDDIT:
                            return this.redditRadius()*2;
                            break;
                        case NodeType.SUBREDDIT:
                            return this.subRedditRadius()*2;
                            break;
                        case NodeType.USER:
                            return this.userRadius()*2;
                            break;
                    }
                }))
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
        redditRadius: function() {
            return this.radius*2;
        },
        updateReddit: function() {
            var elements = this.nodeGroup.selectAll("g.reddit")
                .data(this.graph.reddit);
            
            var nodeEnter = elements.enter()
                .append("g")
                    .attr("class", "reddit")
                    .attr("x", this.width / 2)
                    .attr("y", this.height / 2)
                    ;
            nodeEnter
                .append("circle")
                    .attr("id", function(d) { return d.id; })
                    .attr("data-id", d => d.id)
                    .attr("stroke", "black")
                    .attr("stroke-width", "1px")
                    .attr("r", this.redditRadius());
            nodeEnter
                .append("text")
                    .attr("y", -this.redditRadius())
                    .attr("x", d => -((d.name.length * 12) / 4))
                    .text(d => d.name)
                ;

            elements.exit().remove();
        },
        subRedditRadius: function() {
            return this.radius;
        },
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
                    .attr("r", this.subRedditRadius());
            nodeEnter
                .append("text")
                    .attr("y", -this.subRedditRadius())
                    .attr("x", d => -((d.name.length * 12) / 4))
                    .text(d => d.name)
                ;

            elements.exit().remove();
        },
        userRadius: function() {
            return this.radius / 2;
        },
        updateUsers: function() {
            function handleMouseOver(node, i) {
                d3.select(this).select("circle").attr("stroke", "orange");
                d3.select(this).select("circle").attr("stroke-width", "2px");
            }
            function handleMouseOut(node, i) {
                d3.select(this).select("circle").attr("stroke", "black");
                d3.select(this).select("circle").attr("stroke-width", "1px");
            }
            function handleMouseClick(node, i) {
                d3.select("text#redditComment")
                 .text(node.comment);
            }
            var elements = this.nodeGroup.selectAll("g.user")
                .data(this.graph.users);
            
            var nodeEnter = elements.enter()
                .append("g")
                    .attr("class", "user")
                    .attr("x", this.width / 2)
                    .attr("y", this.height / 2)
                    .attr("comment", node => node.comment)
                    .on("mouseover", handleMouseOver)
                    .on("mousedown", handleMouseClick)
                    .on("mouseout", handleMouseOut)
                    ;

            nodeEnter
                .append("circle")
                    .attr("id", function(d) { return d.id; })
                    .attr("data-id", d => d.id)
                    .attr("stroke", "black")
                    .attr("stroke-width", "1px")
                    .attr("r", this.userRadius());
            
            nodeEnter
                .append("text")
                    .attr("y", -this.userRadius())
                    .attr("x", d => -((d.id.length * 12) / 4))
                    .text(d => d.id)
                ;

            elements.exit().remove();
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
            this.updateReddit();
            this.updateSubreddits();
            this.updateUsers();
            this.updateLinkElements();
            this.nodeElements = this.nodeGroup.selectAll("g");
        },
        updateSimulation: function() {
            this.updateGraph();
            var nodeSource = this.graph.reddit.concat(this.graph.subreddits).concat(this.graph.users);
            
            var simulation = this.simulation.nodes(nodeSource);
            // console.log({ subCount: this.graph.subreddits.length, userCount: this.graph.users.length, nodeSourceCount: nodeSource.length});

            simulation.on("tick", () => {
                this.nodeElements
                    .attr('transform', node => "translate(" + node.x + "," + node.y + ")")
                    // .attr("x", node => node.x)
                    // .attr("y", node => node.y)
                    ;
            
                this.linkElements
                    .attr("x1", link => link.source.x)
                    .attr("y1", link => link.source.y)
                    .attr("x2", link => link.target.x)
                    .attr("y2", link => link.target.y);
            
            });
        
            simulation.force("link").links(this.graph.links);
            // simulation.alphaTarget(20).restart();
        }
    }
}();
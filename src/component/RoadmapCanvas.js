import * as d3 from "d3";
import ContextMenu from "d3-v4-contextmenu";

export class RoadmapCanvas {
  type;
  targetElement;

  style = {
    barHeight: 20,
    topPadding: 20
  };

  constructor(options) {
    this.type = options.type;
    this.targetElement = d3.select("#" + options.target);
    this._setStyle(options.style !== undefined ? options.style : {});
  }

  _setStyle(style) {
    if (style.barHeight !== undefined) {
      this.style.barHeight = parseInt(style.barHeight);
    }
    if (style.topPadding !== undefined) {
      this.style.topPadding = parseInt(style.topPadding);
    }
    this.style.gap = this.style.barHeight + 4;
  }

  render(roadmap) {
    if (this.type === "tasks") {
      this._render(roadmap.getTasks(), roadmap.getTaskGroups(), roadmap);
    } else if (this.type === "people") {
      this._render(roadmap.getPeople(), roadmap.getPersonGroups(), roadmap);
    } else {
      this._render(roadmap.getTasks(), roadmap.getTaskGroups(), roadmap);
      this._render(roadmap.getPeople(), roadmap.getPersonGroups(), roadmap);
    }
  }

  _render(items, groups, roadmap) {
    const w = this.targetElement.node().clientWidth;
    const h = items.length * this.style.gap + 40;

    let svg = this._generateSVG(w, h);

    this._drawVerticalGroupBox(svg, groups, this.style.gap, this.style.topPadding, w);

    let labels = this._drawVerticalLabels(svg, groups, this.style.gap, this.style.topPadding);

    let sidePadding = labels.node().parentNode.getBBox().width + 15;

    let xScale = this._generateXScale(items, w, sidePadding);
    this._drwanXAxis(svg, xScale, sidePadding, this.style.topPadding);

    this._drawItemLines(items, svg, xScale, this.style.gap, sidePadding, this.style.topPadding, this.style.barHeight);

    this._addMouseHelper(svg, xScale, this.style.barHeight, sidePadding, roadmap);
  }

  _generateSVG(w, h) {
    let svg = this.targetElement.append("svg").attr("width", w).attr("style", "overflow: visible");
    svg.attr("height", function() {
      return parseInt(svg.attr("height") || 0, 10) + h;
    });
    return svg;
  }

  _drawVerticalGroupBox(svg, groups, gap, topPadding, w) {
    svg.append("g")
      .selectAll("rect")
      .data(groups)
      .enter()
      .append("rect")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("x", 0)
      .attr("y", function(d, index){
        // この group までの count すべて分、y 方向にずらす
        let total = 0;
        for (let i = 0; i < index; i++) {
          total += groups[i].count;
        }
        return total * gap + topPadding;
      })
      .attr("width", function(){
        return w;
      })
      .attr("height", function(d) {
        return d.count * gap - 4;
      })
      .attr("stroke", "none")
      .attr("fill", "#999")
      .attr("fill-opacity", 0.1);
  }

  _drawVerticalLabels(svg, groups, gap, topPadding) {
    return svg.append("g")
      .selectAll("text")
      .data(groups)
      .enter()
      .append("text")
      .text(function(d){
        return d.name;
      })
      .attr("x", 10)
      .attr("y", function(d, index){
        // この group までの count すべて分、y 方向にずらす
        let total = 0;
        for (let i = 0; i < index; i++) {
          total += groups[i].count;
        }
        return d.count * gap / 2 + total * gap + topPadding + 2;
      })
      .attr("font-size", 11)
      .attr("font-weight", function(d) {
        return d.style;
      })
      .attr("text-anchor", "start")
      .attr("text-height", 14)
      .attr("fill", "#000");
  }

  _generateXScale(items, w, sidePadding) {
    return d3.scaleTime()
      .domain([
        d3.min(items, function(d) {
          return d.from;
        }),
        d3.max(items, function(d) {
          return d.to;
        })
      ])
      .rangeRound([0, w - sidePadding - 15]);
  }

  _drwanXAxis(svg, xScale, sidePadding, topPadding) {
    let xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeMonday)
      .tickSize(- svg.attr("height") + topPadding + 20, 0, 0)
      .tickFormat(d3.timeFormat("%b %d"));
    let xAxisGroup = svg.append("g")
      .attr("transform", "translate(" + sidePadding + "," + (svg.attr("height") -20) + ")")
      .call(xAxis);

    xAxisGroup.selectAll("text")
      .style("text-anchor", "middle")
      .attr("fill", "#000")
      .attr("stroke", "none")
      .attr("font-size", 10)
      .attr("dy", "1em");

    xAxisGroup.selectAll(".tick line")
      .attr("stroke", "#dddddd")
      .attr("shape-rendering", "crispEdges");

    // Now
    let now = new Date();
    if (now > xScale.domain()[0] && now < xScale.domain()[1]) {
      xAxisGroup
        .append("line")
        .attr("x1", xScale(now))
        .attr("y1", 0)
        .attr("x2", xScale(now))
        .attr("y2", -svg.attr("height") + topPadding + 20)
        .attr("class", "now");
      xAxisGroup.selectAll(".now")
        .attr("stroke", "red")
        .attr("opacity", 0.5)
        .attr("stroke-dasharray", "2,2")
        .attr("shape-rendering", "crispEdges");
    }
  }

  _drawItemLines(items, svg, xScale, gap, sidePadding, topPadding, barHeight) {
    // Items group
    let rectangles = svg.append("g")
      .attr("transform", "translate(" + sidePadding + ", 0)")
      .selectAll("rect")
      .data(items)
      .enter();

    // Draw items boxes
    rectangles.append("rect")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("x", function(d){
        return xScale(d.from);
      })
      .attr("y", function(d, i){
        return i * gap + topPadding;
      })
      .attr("width", function(d){
        return xScale(d.to) - xScale(d.from);
      })
      .attr("height", barHeight)
      .attr("stroke", "none")
      .attr("fill", function(d) {
        return d.pattern || d.color;
      })
      .attr("fill-opacity", 0.5)
      .on("mouseover", function() {
        d3.select(this).style({cursor:"pointer"});
      });

    // Draw items texts
    rectangles.append("text")
      .text(function(d){
        return d.name;
      })
      .attr("x", function(d){
        return xScale(d.from) + (xScale(d.to) - xScale(d.from)) / 2;
      })
      .attr("y", function(d, i){
        return i * gap + 14 + topPadding;
      })
      .attr("font-size", 11)
      .attr("font-weight", function(d) {
        return d.style;
      })
      .attr("text-anchor", "middle")
      .attr("text-height", barHeight)
      .attr("fill", "#000")
      .style("pointer-events", "none");
  }

  _addMouseHelper(svg, xScale, barHeight, sidePadding, roadmap) {
    let verticalMouse = svg.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 0)
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("stroke-dasharray", "2,2")
      .style("shape-rendering", "crispEdges")
      .style("pointer-events", "none")
      .style("display", "none");

    let verticalMouseBox = svg.append("rect")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("width", 50)
      .attr("height", barHeight)
      .attr("stroke", "none")
      .attr("fill", "black")
      .attr("fill-opacity", 0.8)
      .style("display", "none");

    let verticalMouseText = svg.append("text")
      .attr("font-size", 11)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("text-height", barHeight)
      .attr("fill", "white")
      .style("display", "none");

    const verticalMouseTopPadding = 40;

    svg.on("mousemove", function () {
      let xCoord = d3.mouse(this)[0],
        yCoord = d3.mouse(this)[1];

      if (xCoord > sidePadding) {
        verticalMouse
          .attr("x1", xCoord)
          .attr("y1", 10)
          .attr("x2", xCoord)
          .attr("y2", svg.attr("height") - 20)
          .style("display", "block");

        verticalMouseBox
          .attr("x", xCoord - 25)
          .attr("y", yCoord - (barHeight + 8) / 2 + verticalMouseTopPadding)
          .style("display", "block");

        verticalMouseText
          .attr("transform", "translate(" + xCoord + "," + (yCoord + verticalMouseTopPadding) + ")")
          .text(d3.timeFormat("%b %d")(xScale.invert(xCoord - sidePadding)))
          .style("display", "block");
      } else {
        verticalMouse.style("display", "none");
        verticalMouseBox.style("display", "none");
        verticalMouseText.style("display", "none");
      }
    });

    svg.on("mouseleave", function() {
      verticalMouse.style("display", "none");
      verticalMouseBox.style("display", "none");
      verticalMouseText.style("display", "none");
    });

    svg.on('contextmenu', function() {
      d3.event.preventDefault();
      let contextMenu = new ContextMenu([
        {
          label: "copy json data to clip board",
          cb: function (e) {
            let dummy = document.createElement("input");
            document.body.appendChild(dummy);
            dummy.setAttribute("id", "copy-dummy");
            document.getElementById("copy-dummy").value = roadmap.toString();
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
          }
        }
      ]);
      contextMenu.show(svg, d3.mouse(this)[0], d3.mouse(this)[1]);
    });
  }
}
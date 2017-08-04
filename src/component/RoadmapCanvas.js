import * as d3 from "d3";
import ContextMenu from "d3-v4-contextmenu";
import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';

export class RoadmapCanvas {
  type;
  targetElement;

  style = {
    barHeight: 20,
    topPadding: 20
  };

  /**
   * @param {object} options
   */
  constructor(options) {
    this.type = Object.values(AbstractRoadmapGroup.TYPE).indexOf(options.type) >=0 ? options.type : AbstractRoadmapGroup.TYPE.STORY;
    this.targetElement = d3.select("#" + options.target);
    this._setStyle(options.style !== undefined ? options.style : {});
  }

  /**
   * @param {object} style
   * @private
   */
  _setStyle(style) {
    if (style.barHeight !== undefined) {
      this.style.barHeight = parseInt(style.barHeight);
    }
    this.style.gap = this.style.barHeight + 4;
  }

  /**
   * @param {Roadmap} roadmap
   */
  render(roadmap) {
    // TODO: check. Is this condition need?
    if (Object.values(AbstractRoadmapGroup.TYPE).indexOf(this.type) >= 0)  {
      this._render(roadmap, roadmap.getSortedGroup(this.type));
    } else {
      this._render(roadmap, roadmap.getSortedGroup(AbstractRoadmapGroup.TYPE.STORY));
      this._render(roadmap, roadmap.getSortedGroup(AbstractRoadmapGroup.TYPE.ASSIGNEE));
    }
  }

  /**
   * @param {Roadmap} roadmap
   * @param {AbstractRoadmapGroup[]} groups
   * @private
   */
  _render(roadmap, groups) {
    let groupTasks = [];
    for (let i = 0; i < groups.length; i++) {
      groupTasks = groupTasks.concat(roadmap.getSortedTasksByGroup(groups[i]));
    }

    const w = this.targetElement.node().clientWidth;
    const h = groupTasks.length * this.style.gap + 40;

    let svg = this._appendSVG(w, h);

    this._appendYAxisBoxes(roadmap, groups, svg, this.style.gap, this.style.topPadding, w);

    let yAxisLabels = this._appendYAxisLabels(roadmap, groups, svg, this.style.gap, this.style.topPadding);

    let sidePadding = yAxisLabels.node().parentNode.getBBox().width + 15;

    let xAxisScale = this._generateXAxisScale(groupTasks, w, sidePadding);

    this._appendXAxis(svg, xAxisScale, sidePadding, this.style.topPadding);

    this._appendItemLines(groupTasks, svg, xAxisScale, this.style.gap, sidePadding, this.style.topPadding, this.style.barHeight);

    this._addMouseHelper(roadmap, svg, xAxisScale, this.style.barHeight, sidePadding);
  }

  /**
   * @param {number} w
   * @param {number} h
   * @returns {selection}
   * @private
   */
  _appendSVG(w, h) {
    let svg = this.targetElement.append("svg").attr("width", w).attr("style", "overflow: visible");
    svg.attr("height", function() {
      return parseInt(svg.attr("height") || 0, 10) + h;
    });
    return svg;
  }

  /**
   * @param {Roadmap} roadmap
   * @param {AbstractRoadmapGroup[]} groups
   * @param {selection} svg
   * @param {number} gap
   * @param {number} topPadding
   * @param {number} w
   * @private
   */
  _appendYAxisBoxes(roadmap, groups, svg, gap, topPadding, w) {
    return svg.append("g")
      .selectAll("rect")
      .data(groups)
      .enter()
      .append("rect")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("x", 0)
      .attr("y", function(d, index){
        // Shift y direction for all previous task length
        let total = 0;
        for (let i = 0; i < index; i++) {
          total += roadmap.getSortedTasksByGroup(groups[i]).length;
        }
        return total * gap + topPadding;
      })
      .attr("width", function(){
        return w;
      })
      .attr("height", function(d) {
        return roadmap.getSortedTasksByGroup(d).length * gap - 4;
      })
      .attr("stroke", "none")
      .attr("fill", "#999")
      .attr("fill-opacity", 0.1);
  }

  /**
   * @param {Roadmap} roadmap
   * @param {AbstractRoadmapGroup[]} groups
   * @param {selection} svg
   * @param {number} gap
   * @param {number} topPadding
   * @returns {selection}
   * @private
   */
  _appendYAxisLabels(roadmap, groups, svg, gap, topPadding) {
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
        // Shift y direction for all previous task length
        let total = 0;
        for (let i = 0; i < index; i++) {
          total += roadmap.getSortedTasksByGroup(groups[i]).length;
        }
        return roadmap.getSortedTasksByGroup(d).length * gap / 2 + total * gap + topPadding + 2;
      })
      .attr("font-size", 11)
      .attr("text-anchor", "start")
      .attr("text-height", 14)
      .attr("fill", "#000");
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @param {number} w
   * @param {number} sidePadding
   * @private
   */
  _generateXAxisScale(tasks, w, sidePadding) {
    return d3.scaleTime()
      .domain([
        d3.min(tasks, function(d) {
          return d.from;
        }),
        d3.max(tasks, function(d) {
          return d.to;
        })
      ])
      .rangeRound([0, w - sidePadding - 15]);
  }

  /**
   * @param {selection} svg
   * @param {selection} xScale
   * @param {number} sidePadding
   * @param {number} topPadding
   * @private
   */
  _appendXAxis(svg, xScale, sidePadding, topPadding) {
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

  /**
   * @param {RoadmapTask[]} tasks
   * @param {selection} svg
   * @param {selection} xScale
   * @param {number} gap
   * @param {number} sidePadding
   * @param {number} topPadding
   * @param {number} barHeight
   * @private
   */
  _appendItemLines(tasks, svg, xScale, gap, sidePadding, topPadding, barHeight) {
    let rectangles = svg.append("g")
      .attr("transform", "translate(" + sidePadding + ", 0)")
      .selectAll("rect")
      .data(tasks)
      .enter();

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
        return i * gap + (barHeight / 2 +4) + topPadding;
      })
      .attr("font-size", 11)
      .attr("text-anchor", "middle")
      .attr("text-height", barHeight)
      .attr("fill", "#000")
      .style("pointer-events", "none");
  }

  /**
   * @param {Roadmap} roadmap
   * @param {selection} svg
   * @param {selection} xScale
   * @param {number} barHeight
   * @param {number} sidePadding
   * @private
   */
  _addMouseHelper(roadmap, svg, xScale, barHeight, sidePadding) {
    const mouseBoxHeight = Math.min(20, barHeight);
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
      .attr("height", mouseBoxHeight)
      .attr("stroke", "none")
      .attr("fill", "black")
      .attr("fill-opacity", 0.8)
      .style("display", "none");

    let verticalMouseText = svg.append("text")
      .attr("font-size", 11)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("text-height", mouseBoxHeight)
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
          .attr("y", yCoord - (mouseBoxHeight + 8) / 2 + verticalMouseTopPadding)
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

import * as d3 from "d3";
import ContextMenu from "d3-v4-contextmenu";

export class Roadmappy {

  options = {};

  items = {
    tasks: [],
    people: []
  };

  parsedItems = {
    tasks: [],
    people: []
  };

  constructor(options) {
    this.options = options;
  }

  parse({tasks, people}) {
    this.items.tasks = tasks;
    this.items.people = people;

    const colors = d3.schemeCategory20;
    for (let i = 0; i < tasks.length; i++) {
      let task = {};
      task.type = "task";
      task.group = tasks[i].taskGroup ? tasks[i].taskGroup : '';
      task.name = tasks[i].name ? tasks[i].name : '';
      task.style = tasks[i].style ? tasks[i].style : "normal";
      task.color = tasks[i].color ? tasks[i].color : colors(task.group);
      task.order = tasks[i].order ? parseInt(tasks[i].order, 10) : 0;
      task.from = new Date(tasks[i].from);
      task.to = new Date(new Date(tasks[i].to).setHours((new Date(tasks[i].to).getHours() + 24)));
      if (tasks[i].people) {
        if (Array.isArray(tasks[i].people)) {
          for (let j = 0; j < tasks[i].people.length; j++) {
            this.parsedItems.people.push(
              this._parsePerson(this._getPersonById(tasks[i].people[j], people), task)
            );
          }
        } else {
          this.parsedItems.people.push(
            this._parsePerson(this._getPersonById(tasks[i].people, people), task)
          );
        }
      }
      this.parsedItems.tasks.push(task);
    }
    return this;
  }

  _getPersonById(id, people) {
    for (let i = 0; i < people.length; i++) {
      if (people[i].id === id) {
        return people[i];
      }
    }
  }

  _parsePerson(person, task) {
    return {
      type: "people",
      order: person.order ? parseInt(person.order) : 0,
      group: person.name,
      from: task.from,
      to: task.to,
      name: task.group ? task.name + "(" + task.group + ")" : task.name,
      taskGroup: task.group,
      taskOrder: task.order,
      color: task.color ? task.color : colors(task.group),
      involvement: task.involvement ? parseInt(tasks.involvement, 10) : 100
    };
  }

  render(targetElementName) {
    let targetElement = d3.select("#" + targetElementName);
    this._draw(targetElement, this.parsedItems.tasks);
    this._draw(targetElement, this.parsedItems.people);
  }

  _draw(targetElement, items) {
    let _this = this;

    const barHeight = 20;
    const gap = barHeight + 4;
    const topPadding = 20;

    const h = items.length * gap + 40;
    const w = targetElement.node().clientWidth;

    let svg = targetElement.append("svg").attr("width", w).attr("style", "overflow: visible");
    svg.attr("height", function() {
      return parseInt(svg.attr("height") || 0, 10) + h;
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
            document.getElementById("copy-dummy").value = JSON.stringify(_this.items);
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
          }
        }
      ]);
      contextMenu.show(svg, d3.mouse(this)[0], d3.mouse(this)[1]);
    });

    let groups = [];
    let total = 0;
    for (let i = 0; i < items.length; i++){
      let j = 0;
      let found = false;
      while (j < groups.length && !found) {
        found = (groups[j].name === items[i].group);
        j++;
      }
      if (!found) {
        let count = 0;
        j = 0;
        while (j < items.length) {
          if (items[j].group === items[i].group) {
            count++;
          }
          j++;
        }
        groups.push({
          type: "group",
          name: items[i].group,
          count: count,
          previous: total,
          style: items[i].style
        });
        total += count;
      }
    }

    items.sort(function(a, b) {
      if (a.group === b.group) {
        if (a.taskOrder !== b.taskOrder) {
          return a.taskOrder > b.taskOrder ? 1 : -1;
        }
        return a.from > b.from ? 1 : -1;
      } else {
        if (a.order !== b.order) {
          return a.order > b.order ? 1 : -1;
        }
        return a.group > b.group ? 1 : -1;
      }
    });

    // Draw vertical group boxes
    svg.append("g")
      .selectAll("rect")
      .data(groups)
      .enter()
      .append("rect")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("x", 0)
      .attr("y", function(d){
        return d.previous * gap + topPadding;
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

    // Draw vertical labels
    let axisText = svg.append("g")
      .selectAll("text")
      .data(groups)
      .enter()
      .append("text")
      .text(function(d){
        return d.name;
      })
      .attr("x", 10)
      .attr("y", function(d){
        return d.count * gap / 2 + d.previous * gap + topPadding + 2;
      })
      .attr("font-size", 11)
      .attr("font-weight", function(d) {
        return d.style;
      })
      .attr("text-anchor", "start")
      .attr("text-height", 14)
      .attr("fill", "#000");

    let sidePadding = axisText.node().parentNode.getBBox().width + 15;

    // Init time scale
    let xScale = d3.scaleTime()
      .domain([
        d3.min(items, function(d) {
          return d.from;
        }),
        d3.max(items, function(d) {
          return d.to;
        })
      ])
      .rangeRound([0, w - sidePadding - 15]);

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

    // Draw vertical mouse helper
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

    let verticalMouseTopPadding = 40;

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

  }



}

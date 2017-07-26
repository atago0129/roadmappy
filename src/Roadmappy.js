import * as d3 from "d3";

export class Roadmappy {

  options = {};

  parsedItems = {
    tasks: [],
    people: []
  };

  constructor(options) {
    this.options = options;
  }

  parse({tasks, people}) {
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
    this._draw(d3.select("#" + targetElementName), this.parsedItems.tasks);
  }

  _draw(targetElement, items) {
    const barHeight = 20;
    const gap = barHeight + 4;
    const topPadding = 20;

    const h = items.length * gap + 40;
    const w = targetElement.clientWidth;

    let svg = targetElement.append("svg").attr("width", w).attr("style", "overflow: visible");
    svg.attr("height", function() {
      return parseInt(svg.attr("height") || 0, 10) + h;
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

    let sidePadding = 15;

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
      .range([0, w - sidePadding - 15]);

    let xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeMonday);
    svg.append("g")
      .attr("transform", "translate(0," + svg.attr("height") + ")")
      .call(xAxis);

    // // Init X Axis
    // var xAxis = d3.svg.axis()
    //   .scale(timeScale)
    //   .orient("bottom")
    //   .ticks(d3.time.monday)
    //   .tickSize(- svg.attr("height") + topPadding + 20, 0, 0)
    //   .tickFormat(d3.time.format(currentInstance.graphOption.dateFormat ? currentInstance.graphOption.dateFormat : "%b %d"));
    // if (currentInstance.graphOption.ticksType === "month") {
    //   xAxis.ticks(d3.time.month);
    // }
    //
    // // Draw vertical grid
    // var xAxisGroup = svg.append("g")
    //   .attr("transform", "translate(" + sidePadding + ", " + (svg.attr("height") - 20) + ")")
    //   .call(xAxis);

    // xAxisGroup.selectAll("text")
    //   .style("text-anchor", "middle")
    //   .attr("fill", "#000")
    //   .attr("stroke", "none")
    //   .attr("font-size", 10)
    //   .attr("dy", "1em");
    //
    // xAxisGroup.selectAll(".tick line")
    //   .attr("stroke", "#dddddd")
    //   .attr("shape-rendering", "crispEdges");
    //
    // // Now
    // let now = new Date();
    // if (now > timeScale.domain()[0] && now < timeScale.domain()[1]) {
    //   xAxisGroup
    //     .append("line")
    //     .attr("x1", timeScale(now))
    //     .attr("y1", 0)
    //     .attr("x2", timeScale(now))
    //     .attr("y2", -svg.attr("height") + topPadding + 20)
    //     .attr("class", "now");
    //
    //   xAxisGroup.selectAll(".now")
    //     .attr("stroke", "red")
    //     .attr("opacity", 0.5)
    //     .attr("stroke-dasharray", "2,2")
    //     .attr("shape-rendering", "crispEdges");
    // }

  }



}

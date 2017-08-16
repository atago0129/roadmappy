import * as d3 from 'd3';
import {EventEmitter} from 'events';
import ContextMenu from 'd3-v4-contextmenu';
import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';

export class RoadmapCanvas extends EventEmitter {
  type;
  targetElement;
  style;

  /**
   * @param {RoadmapOption} option
   */
  constructor(option) {
    super();

    this.type = option.type;
    this.targetElement = d3.select(option.targetElementId);
    this.style = option.style;
  }

  /**
   * @param {Roadmap} roadmap
   */
  render(roadmap) {
    this._render(roadmap, roadmap.getSortedGroup(this.type));
  }

  /**
   * @param {Roadmap} roadmap
   * @param {AbstractRoadmapGroup[]} groups
   * @private
   */
  _render(roadmap, groups) {
    const tasks = groups.reduce((tasks, group) => tasks.concat(roadmap.getSortedTasksByGroup(group)), []);

    const svg = this._appendSVG();
    const marginTop = this._getXAxisHeight(svg, tasks);
    const marginLeft = this._getYAxisWidth(svg, groups);

    const w = this.targetElement.node().clientWidth - marginLeft;
    const h = tasks.length * this.style.gap + 40 - marginTop;
    svg
      .attr('width', w)
      .attr('height', h)
      .attr('transform', `translate(${marginLeft}, ${marginTop})`);

    // create chart.
    const xScale = this._generateXAxisScale(tasks, w);
    const yScale = this._generateYAxisScale(tasks, h);
    this._appendXAxis(svg, xScale, h);
    this._appendYAxis(roadmap, groups, svg, yScale);
    this._appendTaskLines(tasks, svg, xScale, yScale);

    // utility.
    this._addMouseHelper(roadmap, svg, xScale, yScale);
  }

  /**
   * @param {number} w
   * @param {number} h
   * @returns {selection}
   * @private
   */
  _appendSVG(w, h) {
    this.targetElement.selectAll('*').remove();
    return this.targetElement.append('svg').attr('style', 'overflow: visible');
  }

  /**
   * @param {selection} svg
   * @param {AbstractRoadmapGroup[]} groups
   * @return {number}
   */
  _getYAxisWidth(svg, groups) {
    const fakeYAxis = svg.append('g')
      .attr('class', 'fake-y-axis-group')

    fakeYAxis
      .selectAll('text')
      .data(groups)
      .enter()
      .append('text')
      .text(function(d){
        return d.name;
      })
      .attr('font-size', 11)
      .attr('text-anchor', 'start')
      .attr('text-height', 14)
      .attr('fill', '#000');

    const width = fakeYAxis.node().getBBox().width;
    fakeYAxis.remove();
    return width + 12;
  }

  /**
   * @param {selection} svg
   * @param {RoadmapTask[]} tasks
   * @return {number}
   */
  _getXAxisHeight(svg, tasks) {
    const fakeXAxis = svg.append('g')
      .attr('class', 'fake-x-axis-group')

    fakeXAxis
      .selectAll('text')
      .data(tasks)
      .enter()
      .append('text')
      .text(function(d) {
        return d3.timeParse(this.style.timeFormat)(d.to);
      })
      .style('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('stroke', 'none')
      .attr('font-size', 10)
      .attr('dy', '1em');

    const height = fakeXAxis.node().getBBox().height;
    fakeXAxis.remove();
    return height + 12;
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @param {number} h
   * @returns {selection}
   * @private
   */
  _generateYAxisScale(tasks, h) {
    return d3.scaleBand()
      .domain(Object.keys(tasks).map( (i) => parseInt(i, 10)))
      .range([0, h]);
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @param {number} w
   * @private
   */
  _generateXAxisScale(tasks, w) {
    return d3.scaleTime()
      .domain([
        d3.min(tasks, (d) => d.from),
        d3.max(tasks, (d) => d.to)
      ])
      .rangeRound([0, w]);
  }

  /**
   * @param {Roadmap} roadmap
   * @param {AbstractRoadmapGroup[]} groups
   * @param {selection} svg
   * @param {selection} yScale
   * @private
   */
  _appendYAxis(roadmap, groups, svg, yScale) {
    const yAxisMap = groups.reduce((labels, group) => {
      let isFirstTaskPerGroup = true;
      return labels.concat(roadmap.getSortedTasksByGroup(group).map((task) => {
        if (isFirstTaskPerGroup) {
          isFirstTaskPerGroup = false;
          return group.name;
        }
        return '';
      }));
    }, []);

    svg.append('g')
      .attr('class', 'y-axis-group')
      .call(
        d3.axisLeft(yScale)
          .tickFormat(function (d) {
            return yAxisMap[d];
          })
      );
  }

  /**
   * @param {selection} svg
   * @param {selection} xScale
   * @param {number} h
   * @private
   */
  _appendXAxis(svg, xScale, h) {
    let xAxis = d3.axisBottom(xScale)
      .ticks(this.style.tickInterval)
      .tickSize(- svg.attr('height'), 0, 0)
      .tickFormat(this.style.timeFormat);
    let xAxisGroup = svg.append('g')
      .attr('transform', 'translate(0,' + h + ')')
      .attr('class', 'x-axis-group')
      .call(xAxis);

    xAxisGroup.selectAll('text')
      .style('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('stroke', 'none')
      .attr('font-size', 10)
      .attr('dy', '1em');

    xAxisGroup.selectAll('.tick line')
      .attr('stroke', '#dddddd')
      .attr('shape-rendering', 'crispEdges');

    // Now
    let now = new Date();
    if (now > xScale.domain()[0] && now < xScale.domain()[1]) {
      xAxisGroup
        .append('line')
        .attr('x1', xScale(now))
        .attr('y1', 0)
        .attr('x2', xScale(now))
        .attr('y2', -h)
        .attr('class', 'now')
        .attr('stroke', 'red')
        .attr('opacity', 0.5)
        .attr('stroke-dasharray', '2,2')
        .attr('shape-rendering', 'crispEdges');
    }
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @param {selection} svg
   * @param {selection} xScale
   * @param {selection} yScale
   * @private
   */
  _appendTaskLines(tasks, svg, xScale, yScale) {
    let rectangles = svg.append('g')
      .attr('class', 'bars')
      .selectAll('rect')
      .data(tasks)
      .enter();

    rectangles.append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('x', function(d){
        return xScale(d.from);
      })
      .attr('y', function(d, i){
        return yScale(i);
      })
      .attr('width', function(d){
        return xScale(d.to) - xScale(d.from);
      })
      .attr('height', yScale.bandwidth())
      .attr('stroke', 'none')
      .attr('fill', function(d) {
        return d.pattern || d.color;
      })
      .attr('fill-opacity', 0.5)
      .on('click', (task) => {
        this.emit('click:task', task);
      })
      .on('mouseover', function() {
        d3.select(this).style({cursor:'pointer'});
      });

    // Draw items texts
    rectangles.append('text')
      .text(function(d){
        return d.name;
      })
      .attr('x', function(d){
        return xScale(d.from) + (xScale(d.to) - xScale(d.from)) / 2;
      })
      .attr('y', function(d, i){
        return yScale(i) + yScale.bandwidth() / 2;
      })
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('text-height', yScale.bandwidth())
      .attr('fill', '#000')
      .style('pointer-events', 'none');
  }

  /**
   * @param {Roadmap} roadmap
   * @param {selection} svg
   * @param {selection} xScale
   * @param {selection} yScale
   * @param {number} sidePadding
   * @private
   */
  _addMouseHelper(roadmap, svg, xScale, yScale, sidePadding) {
    let _this = this;
    const mouseBoxHeight = Math.min(20, yScale.bandwidth());
    let verticalMouse = svg.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 0)
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '2,2')
      .style('shape-rendering', 'crispEdges')
      .style('pointer-events', 'none')
      .style('display', 'none');

    let verticalMouseBox = svg.append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', 50)
      .attr('height', mouseBoxHeight)
      .attr('stroke', 'none')
      .attr('fill', 'black')
      .attr('fill-opacity', 0.8)
      .style('display', 'none');

    let verticalMouseText = svg.append('text')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('text-height', mouseBoxHeight)
      .attr('fill', 'white')
      .style('display', 'none');

    const verticalMouseTopPadding = 40;

    svg.on('mousemove', function () {
      let xCoord = d3.mouse(this)[0],
        yCoord = d3.mouse(this)[1];

      if (xCoord > sidePadding) {
        verticalMouse
          .attr('x1', xCoord)
          .attr('y1', 0)
          .attr('x2', xCoord)
          .attr('y2', svg.attr('height'))
          .style('display', 'block');

        verticalMouseBox
          .attr('x', xCoord - 25)
          .attr('y', yCoord - (mouseBoxHeight + 8) / 2 + verticalMouseTopPadding)
          .style('display', 'block');

        verticalMouseText
          .attr('transform', 'translate(' + xCoord + ',' + (yCoord + verticalMouseTopPadding) + ')')
          .text(d3.timeFormat(_this.style.timeFormat)(xScale.invert(xCoord - sidePadding)))
          .style('display', 'block');
      } else {
        verticalMouse.style('display', 'none');
        verticalMouseBox.style('display', 'none');
        verticalMouseText.style('display', 'none');
      }
    });

    svg.on('mouseleave', function() {
      verticalMouse.style('display', 'none');
      verticalMouseBox.style('display', 'none');
      verticalMouseText.style('display', 'none');
    });

    svg.on('contextmenu', function() {
      d3.event.preventDefault();
      let contextMenu = new ContextMenu([
        {
          label: 'copy json data to clip board',
          cb: function (e) {
            let dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.setAttribute('id', 'copy-dummy');
            document.getElementById('copy-dummy').value = roadmap.toString();
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
          }
        }
      ]);
      contextMenu.show(svg, d3.mouse(this)[0], d3.mouse(this)[1]);
    });
  }
}

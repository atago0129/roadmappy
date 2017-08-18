import * as d3 from 'd3';
import {EventEmitter} from 'events';
import ContextMenu from 'd3-v4-contextmenu';
import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';

export class RoadmapCanvas extends EventEmitter {

  roadmap;
  element;
  style;

  /**
   * @param {Roadmap} roadmap
   * @param {RoadmapOption} option
   */
  constructor(roadmap, option) {
    super();

    this.roadmap = roadmap;
    this.element = d3.select(option.targetElementId);
    this.style = option.style;
    this._init();
  }

  /**
   * @returns {selection}
   * @private
   */
  _init() {
    this.svg = this.element.append('svg').attr('style', 'overflow: visible');
    this.xScale = d3.scaleTime().domain([]);
    this.yScale = d3.scaleBand().domain([]);
    this.xAxis = this._createXAxis();
    this.yAxis = this._createYAxis();
    this.barArea = this._createBarArea();
    this.roadmap.reorder();
  }

  /**
   * @param {Roadmap} roadmap
   */
  render() {
    const groups = this.roadmap.getGroups();
    const tasks = this.roadmap.getTasks();

    const marginBottom = this._getXAxisHeight(tasks);
    const marginLeft = this._getYAxisWidth(groups);

    const w = this.element.node().clientWidth - marginLeft;
    const h = (tasks.length * this.style.barHeight) + (tasks.length + 1) * this.style.barHeight * this.style.barPadding;

    // styling.
    this.svg
      .attr('width', w)
      .attr('height', h)
      .attr('style', `padding: 0 0 ${marginBottom}px ${marginLeft}px`);

    // create chart.
    this._updateXScale(tasks, w);
    this._updateYScale(tasks, h);
    this._updateXAxis(w, h);
    this._updateYAxis();
    this._updateTaskBars(tasks);

    // utility.
    // this._addMouseHelper(marginLeft);
  }

  /**
   * @return {selection}
   */
  _createXAxis() {
    return this.svg.append('svg')
      .style('overflow', 'visible')
      .attr('class', 'x-axis')
      .attr('width', '100%')
      .attr('x', 0)
      .attr('y', '100%');
  }

  /**
   * @return {selection}
   */
  _createYAxis() {
    return this.svg.append('svg')
      .style('overflow', 'visible')
      .attr('class', 'y-axis');
  }

  /**
   * @return {selection}
   */
  _createBarArea() {
    const barArea = this.svg.append('svg')
      .attr('class', 'bar-area')
      .attr('width', '100%')
      .attr('height', '100%');
    barArea.append('rect')
      .attr('class', 'bax-area-background')
      .attr('fill', 'transparent')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', '100%')
      .attr('height', '100%')
    barArea.call(
      d3.drag()
        .container(barArea.node())
        .subject(() => {
          return {
            x: d3.event.x,
            y: d3.event.y,
            from: this.roadmap.from,
            to: this.roadmap.to
          };
        })
        .on('drag', () => {
          const diff = this.xScale.invert(d3.event.subject.x).getTime() - this.xScale.invert(d3.event.x).getTime();
          this.roadmap.from = new Date(d3.event.subject.from.getTime() + diff);
          this.roadmap.to = new Date(d3.event.subject.to.getTime() + diff);
          this.render();
        }, true)
    );
    return barArea;
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @param {number} w
   * @private
   */
  _updateXScale(tasks, w) {
    this.xScale
      .domain([this.roadmap.from, this.roadmap.to])
      .rangeRound([0, w]);
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @param {number} h
   * @returns {selection}
   * @private
   */
  _updateYScale(tasks, h) {
    this.yScale
      .domain(Object.keys(tasks).map( (i) => parseInt(i, 10)))
      .range([0, h])
      .padding([this.style.barPadding]);
  }

  /**
   * @param {number} w
   * @param {number} h
   */
  _updateXAxis(w, h) {
    this.xAxis.call(
      d3.axisBottom(this.xScale)
      .ticks(this.style.tickInterval)
      .tickSize(-h, 0, 0)
      .tickFormat(this.style.timeFormat)
    );

    this.xAxis
      .selectAll('.tick line')
      .attr('stroke', '#dddddd')
      .attr('shape-rendering', 'crispEdges')

    this.xAxis.select('.now').remove();
    const now = this.xScale(new Date());
    if (0 <= now && now <= w) {
      this.xAxis
        .append('line')
        .attr('class', 'now')
        .attr('x1', now)
        .attr('y1', 0)
        .attr('x2', now)
        .attr('y2', -h)
        .attr('stroke', 'red')
        .attr('opacity', 0.5)
        .attr('stroke-dasharray', '2,2')
        .attr('shape-rendering', 'crispEdges');
    }
  }

  /**
   * _updateYAxis.
   */
  _updateYAxis() {
    this.yAxis.call(
      d3.axisLeft(this.yScale)
      .tickSize(0)
      .tickFormat((d) => {
        const yAxisMap = this.roadmap.getGroups().reduce((labels, group) => {
          let isFirstTaskPerGroup = true;
          return labels.concat(this.roadmap.getTasksByGroup(group).map((task) => {
            if (isFirstTaskPerGroup) {
              isFirstTaskPerGroup = false;
              return group.name;
            }
            return '';
          }));
        }, []);
        return yAxisMap[d];
      })
    );
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @private
   */
  _updateTaskBars(tasks) {
    const _this = this;

    const bars = this.barArea.selectAll('.bar').data(tasks);

    // ENTER.
    // ------------------------------------------------------------
    const enter = bars.enter()
      .append('svg')
      .attr('class', 'bar');
    enter.append('rect')
      .attr('class', 'bar-background')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('stroke', 'none')
      .attr('fill-opacity', 0.5)
      .on('click', (d) =>  this.emit('click:task', d));
    enter.append('text')
      .attr('class', 'bar-label')
      .attr('x', '50%')
      .attr('y', '50%')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('font-size', this.yScale.bandwidth() / 2)
      .attr('fill', '#000')
      .attr('cursor', 'move')
      .call(
        d3.drag()
          .container(this.barArea.node())
          .subject(() => this._invertYScale(d3.event.y))
          .on('start', (d) => this.emit('drag:start:task', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('drag', (d) => this.emit('drag:drag:task', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('end', (d) => this.emit('drag:end:task', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
      );
    enter.append('text')
      .attr('class', 'bar-to-handle')
      .text('»')
      .attr('x', '100%')
      .attr('y', '50%')
      .attr('transform', 'translate(-5, 0)')
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'central')
      .attr('font-size', this.yScale.bandwidth() / 2)
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .container(this.barArea.node())
          .subject(() => this._invertYScale(d3.event.y))
          .on('start', (d) => this.emit('drag:start:task:to', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('drag', (d) => this.emit('drag:drag:task:to', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('end', (d) => this.emit('drag:end:task:to', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
      );
    enter.append('text')
      .attr('class', 'bar-from-handle')
      .text('«')
      .attr('x', '0')
      .attr('y', '50%')
      .attr('transform', 'translate(5, 0)')
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'central')
      .attr('font-size', this.yScale.bandwidth() / 2)
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .container(this.barArea.node())
          .subject(() => this._invertYScale(d3.event.y))
          .on('start', (d) => this.emit('drag:start:task:from', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('drag', (d) => this.emit('drag:drag:task:from', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('end', (d) => this.emit('drag:end:task:from', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
      );


    // UPDATE.
    // ------------------------------------------------------------
    const update = bars.merge(enter)
      .attr('width', (d) => this.xScale(d.to) - this.xScale(d.from))
      .attr('height', this.yScale.bandwidth())
      .attr('x', (d) => this.xScale(d.from))
      .attr('y', (d, i) => this.yScale(i));
    update
      .select('.bar-background')
      .attr('fill', (d) => d.color);
    update
      .select('.bar-label')
      .text((d) =>  d.name);

    // EXIT.
    // ------------------------------------------------------------
    bars.exit()
      .remove();
  }

  /**
   * @param {AbstractRoadmapGroup[]} groups
   * @return {number}
   */
  _getYAxisWidth(groups) {
    const fakeYAxis = this.svg.append('g')
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
    return width;
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @return {number}
   */
  _getXAxisHeight(tasks) {
    const fakeXAxis = this.svg.append('g')
      .attr('class', 'fake-x-axis-group')

    fakeXAxis
      .selectAll('text')
      .data(tasks)
      .enter()
      .append('text')
      .text('dummy')
      .style('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('stroke', 'none')
      .attr('font-size', 10)
      .attr('dy', '1em');

    const height = fakeXAxis.node().getBBox().height;
    fakeXAxis.remove();
    return height;
  }

  /**
   * @param {number} y
   * @return {number}
   */
  _invertYScale(y) {
    const step = this.yScale.step();
    return this.roadmap.getTasks()[this.yScale.domain()[Math.floor(y / step)]];
  }

}


import * as d3 from 'd3';
import * as convertColor from 'rgb-hex';
import {EventEmitter} from 'events';
import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';
import {RoadmapStyle} from "./RoadmapStyle";

const ONE_DAY = 1000 * 60 * 60 * 24;

export class RoadmapCanvas extends EventEmitter {

  roadmap;
  element;
  style;

  yAxisMap;

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
    if (this.element.style('position') === 'static') {
      this.element.style('position', 'relative');
    }

    this.svg = this.element.append('svg').attr('style', 'overflow: visible');
    this.svg.on('contextmenu', () => this.emit('contextmenu:canvas', d3.mouse(this.svg.node())));
    this.xScale = d3.scaleTime().domain([]);
    this.yScale = d3.scaleBand().domain([]);
    this.background = this._createBackground();
    this.xAxis = this._createXAxis();
    this.yAxis = this._createYAxis();
    this.barArea = this._createBarArea();
    this.mouseDate = this._createMouseDate();
    this.roadmap.reorder();
    window.addEventListener('scroll', this._onViewportChange.bind(this));
    window.addEventListener('resize', this._onViewportChange.bind(this));
  }

  render() {
    this._initializeYAxisMap();

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
      .attr('style', `padding: 0 0 ${marginBottom}px 0`);

    // create chart.
    this._updateXScale(w);
    this._updateYScale(tasks, h);
    this._updateXAxis(marginLeft, w, h);
    this._updateYAxis(marginLeft);
    this._updateBackground(h);
    this._updateBarArea(marginLeft);
    this._updateTaskBars(tasks);
  }

  _initializeYAxisMap() {
    this.yAxisMap = this.roadmap.getGroups().reduce((map, group) => {
      return map.concat(this.roadmap.getTasksByGroup(group).map(() => {
        return group;
      }));
    }, []);
  }

  _createBackground() {
    return this.svg.append('svg')
      .attr('class', 'background')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('x', 0)
      .attr('y', 0);
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
      .on('click', () => {
        this.emit('click:bar-area', this.xScale.invert(d3.mouse(this.svg.node())[0]), this._invertYScale(d3.mouse(this.svg.node())[1]));
      });
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
          this._updateMouseDate(d3.mouse(this.barArea.node())[0], d3.mouse(this.barArea.node())[1]);
          const diff = this.xScale.invert(d3.event.subject.x).getTime() - this.xScale.invert(d3.event.x).getTime();
          this.roadmap.from = new Date(d3.event.subject.from.getTime() + diff);
          this.roadmap.to = new Date(d3.event.subject.to.getTime() + diff);
          this.render();
        }, true)
    );
    barArea.on('mousemove', () => {
      this._updateMouseDate(d3.mouse(this.barArea.node())[0], d3.mouse(this.barArea.node())[1]);
    });
    barArea
      .on('mouseleave', () => {
        this.mouseDate.select('.mouse-date-line').style("display", "none");
        this.mouseDate.select('.mouse-date-text').style("display", "none");
        this.mouseDate.select('.mouse-date-box').style("display", "none");
      });
    return barArea;
  }

  /**
   * @returns {selection}
   * @private
   */
  _createMouseDate() {
    const mouseDate = this.barArea.append('svg');
    mouseDate.append('line')
      .attr('class', 'mouse-date-line')
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("stroke-dasharray", "2,2")
      .style("shape-rendering", "crispEdges")
      .style("pointer-events", "none")
      .style("display", "none");
    mouseDate.append('rect')
      .attr('class', 'mouse-date-box')
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("height", this.style.barHeight)
      .attr("stroke", "none")
      .attr("fill", "black")
      .attr("fill-opacity", 0.8)
      .style("display", "none");
    mouseDate.append('text')
      .attr('class', 'mouse-date-text')
      .attr("font-size", 11)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("text-height", this.style.barHeight)
      .attr("fill", "white")
      .style("display", "none");
    return mouseDate;
  }

  /**
   * @param {number} w
   * @private
   */
  _updateXScale(w) {
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
   * @param {number} marginLeft
   * @param {number} w
   * @param {number} h
   */
  _updateXAxis(marginLeft, w, h) {
    this.xAxis.call(
      d3.axisBottom(this.xScale)
      .ticks(this.style.tickInterval)
      .tickSize(-h, 0, 0)
      .tickFormat(this.style.timeFormat)
    );

    this.xAxis
      .attr('x', marginLeft);

    this.xAxis
      .selectAll('.tick line')
      .attr('stroke', '#dddddd')
      .attr('shape-rendering', 'crispEdges');

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
   * @param {number} marginLeft
   * @private
   */
  _updateYAxis(marginLeft) {
    this.yAxis.call(
      d3.axisLeft(this.yScale)
      .tickSize(0)
      .tickFormat((d) => {
        if (this.yAxisMap[d - 1] === this.yAxisMap[d]) {
          return '';
        } else {
          return this.yAxisMap[d].name;
        }
      })
    );
    this.yAxis
      .attr('x', marginLeft);
  }

  /**
   * @param {number} h
   * @private
   */
  _updateBackground(h) {
    const colorMap = this.style.backgroundColors.reduce((colors, color) => {
      return colors.concat(color);
    }, []);
    const gap = h / this.yAxisMap.length;
    const background = this.background.selectAll('rect').data(this.yAxisMap);

    let groupIndex = -1;

    const enter = background.enter()
      .append('rect');
    background.merge(enter)
      .attr('fill', (d, i) => {
        if (this.yAxisMap[i - 1] !== this.yAxisMap[i]) {
          groupIndex++;
        }
        return colorMap[groupIndex % colorMap.length]
      })
      .attr('x', 0)
      .attr('y', (d, i) => {
        if (i === 0) {
          return 0;
        } else {
          return i * gap + this.yScale.paddingOuter();
        }
      })
      .attr('width', '100%')
      .attr('height', gap + 1);
  }

  /**
   * @param {number} marginLeft
   * @private
   */
  _updateBarArea(marginLeft) {
    this.barArea
      .attr('x', marginLeft);
  }

  /**
   * @param {number} mouseX
   * @param {number} mouseY
   * @private
   */
  _updateMouseDate(mouseX, mouseY) {
    this.barArea.select('.mouse-date-line')
      .attr("x1", mouseX)
      .attr("y1", 0)
      .attr("x2", mouseX)
      .attr("y2", this.barArea.attr('height'))
      .style("display", "block");
    this.mouseDate.select('.mouse-date-text')
      .attr("transform", "translate(" + mouseX + "," + (mouseY + 40) + ")")
      .text(this.style.timeFormat(this.xScale.invert(mouseX)))
      .style("display", "block");
    this.mouseDate.select('.mouse-date-box')
      .attr("x", mouseX - (this.mouseDate.select('.mouse-date-text').node().getBBox().width + 5) / 2)
      .attr("y", mouseY - (this.style.barHeight + 8) / 2 + 40)
      .style('width', this.mouseDate.select('.mouse-date-text').node().getBBox().width + 5)
      .style("display", "block");
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @private
   */
  _updateTaskBars(tasks) {
    const bars = this.barArea.selectAll('.bar').data(tasks);

    // ENTER.
    // ------------------------------------------------------------
    const enter = bars.enter()
      .append('svg')
      .style('overflow', 'visible')
      .attr('class', 'bar');
    enter.append('rect')
      .attr('class', 'bar-background')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('stroke', 'none')
      .attr('fill-opacity', 0.5)
      .attr('cursor', 'move')
      .on('click', (d) => {
        const [x, y] = d3.mouse(this.element.node());
        this.emit('click:task', d, d3.event.target, {x, y});
      })
      .call(
        d3.drag()
          .container(this.barArea.node())
          .subject(() => d3.event.subject ? d3.event.subject : this.roadmap.getTasks()[this._invertYScale(d3.event.y)])
          .on('start', (d) => this.emit('drag:start:task', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('drag', (d) => {
            this._updateMouseDate(d3.mouse(this.barArea.node())[0], d3.mouse(this.barArea.node())[1]);
            this.emit('drag:drag:task', d3.event.subject, {x: d3.event.x, y: d3.event.y});
          })
          .on('end', (d) => this.emit('drag:end:task', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
      );
    const taskLabel = enter.append('text')
      .attr('class', 'bar-label')
      .attr('y', '50%')
      .attr('alignment-baseline', 'central')
      .attr('font-size', this.yScale.bandwidth() / 2)
      .attr('fill', '#000')
      .attr('cursor', 'move')
      .on('click', (d) => {
        const [x, y] = d3.mouse(this.element.node());
        this.emit('click:task-label', d, d3.event.target, {x, y});
      })
      .call(
        d3.drag()
          .container(this.barArea.node())
          .subject(() => d3.event.subject ? d3.event.subject : this.roadmap.getTasks()[this._invertYScale(d3.event.y)])
          .on('start', (d) => this.emit('drag:start:task', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('drag', (d) => {
            this._updateMouseDate(d3.mouse(this.barArea.node())[0], d3.mouse(this.barArea.node())[1]);
            this.emit('drag:drag:task', d3.event.subject, {x: d3.event.x, y: d3.event.y});
          })
          .on('end', (d) => this.emit('drag:end:task', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
      );
    switch (this.style.taskLabelPosition) {
      case RoadmapStyle.TASK_LABEL_POSITION_TYPE.LEFT:
        taskLabel.attr('x', '15px').attr('text-anchor', 'start');
        break;
      case RoadmapStyle.TASK_LABEL_POSITION_TYPE.LEFT_OUTER:
        taskLabel.attr('x', '-5').attr('text-anchor', 'end');
        break;
      case RoadmapStyle.TASK_LABEL_POSITION_TYPE.CENTER:
        taskLabel.attr('x', '50%').attr('text-anchor', 'middle');
        break;
      case RoadmapStyle.TASK_LABEL_POSITION_TYPE.RIGHT:
        taskLabel.attr('x', '100%').attr('transform', 'translate(-15, 0)').attr('text-anchor', 'end');
        break;
      case RoadmapStyle.TASK_LABEL_POSITION_TYPE.RIGHT_OUTER:
        taskLabel.attr('x', '100%').attr('transform', 'translate(5, 0)').attr('text-anchor', 'start');
        break;
    }

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
          .subject(() => d3.event.subject ? d3.event.subject : this.roadmap.getTasks()[this._invertYScale(d3.event.y)])
          .on('start', (d) => this.emit('drag:start:task:to', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('drag', (d) => {
            this._updateMouseDate(d3.mouse(this.barArea.node())[0], d3.mouse(this.barArea.node())[1]);
            this.emit('drag:drag:task:to', d3.event.subject, {x: d3.event.x, y: d3.event.y});
          })
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
          .subject(() => d3.event.subject ? d3.event.subject : this.roadmap.getTasks()[this._invertYScale(d3.event.y)])
          .on('start', (d) => this.emit('drag:start:task:from', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
          .on('drag', (d) => {
            this._updateMouseDate(d3.mouse(this.barArea.node())[0], d3.mouse(this.barArea.node())[1]);
            this.emit('drag:drag:task:from', d3.event.subject, {x: d3.event.x, y: d3.event.y});
          })
          .on('end', (d) => this.emit('drag:end:task:from', d3.event.subject, {x: d3.event.x, y: d3.event.y}))
      );


    // UPDATE.
    // ------------------------------------------------------------
    const update = bars.merge(enter)
      .attr('width', (d) => this.xScale(new Date(d.to.getTime() +  ONE_DAY)) - this.xScale(d.from))
      .attr('height', this.yScale.bandwidth())
      .attr('x', (d) => this.xScale(d.from))
      .attr('y', (d, i) => this.yScale(i));
    update
      .select('.bar-background')
      .attr('stroke', (d) => d.selected ? 'black' : 'none')
      .attr('fill', (d) => this._defineBarColor(d));
    update
      .select('.bar-label')
      .text((d) =>  d.name);

    // EXIT.
    // ------------------------------------------------------------
    bars.exit()
      .remove();
  }

  _defineBarColor(task) {
    if (task.color) {
      return task.color;
    }
    const hue = (parseInt(task.storyId, 10) || 0) * (340 / this.roadmap.getStories().length);
    return '#' + convertColor(d3.hsl(hue, 1, 0.4).toString());
  }

  /**
   * @param {AbstractRoadmapGroup[]} groups
   * @return {number}
   */
  _getYAxisWidth(groups) {
    const fakeYAxis = this.svg.append('g')
      .attr('class', 'fake-y-axis-group');

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
      .attr('class', 'fake-x-axis-group');

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
    return this.yScale.domain()[Math.floor(y / step)];
  }

  _onViewportChange(e) {
    this.render();
  }

}


import * as d3 from 'd3';
import {EventEmitter} from 'events';
import ContextMenu from 'd3-v4-contextmenu';
import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';

export class RoadmapCanvas extends EventEmitter {
  type;
  element;
  style;

  /**
   * @param {Roadmap} roadmap
   * @param {RoadmapOption} option
   */
  constructor(roadmap, option) {
    super();

    this.roadmap = roadmap;
    this.type = option.type;
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
  }

  /**
   * @param {Roadmap} roadmap
   */
  render() {
    const groups = this.roadmap.getSortedGroups(this.type);
    const tasks = this.roadmap.getGroupSortedTasks(this.type);

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
    return this.svg.append('svg')
      .style('overflow', 'visible')
      .attr('class', 'bar-area')
      .attr('width', '100%')
      .attr('height', '100%');
  }

  /**
   * @param {RoadmapTask[]} tasks
   * @param {number} w
   * @private
   */
  _updateXScale(tasks, w) {
    this.xScale
      .domain([d3.min(tasks, (d) => d.from), d3.max(tasks, (d) => d.to)])
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
        const yAxisMap = this.roadmap.getSortedGroups(this.type).reduce((labels, group) => {
          let isFirstTaskPerGroup = true;
          return labels.concat(this.roadmap.getSortedTasksByGroup(group).map((task) => {
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

    const bars = this.barArea
      .selectAll('.bar')
      .data(tasks);

    // ENTER.
    // ------------------------------------------------------------
    const bar = bars.enter()
      .append('svg')
      .attr('class', 'bar');
    bar.append('rect')
      .attr('class', 'bar-background')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('stroke', 'none')
      .attr('fill-opacity', 0.5)
      .on('click', (task) => {
        this.emit('click:task', task);
      });
    bar.append('text')
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
          .on('start', function(d) {
            _this.emit('drag:start:task', d, {x: d3.event.x, y: d3.event.y});
          })
          .on('drag', function(d) {
            _this.emit('drag:drag:task', d, {x: d3.event.x, y: d3.event.y});
          })
          .on('end', function(d) {
            _this.emit('drag:end:task', d, {x: d3.event.x, y: d3.event.y});
          })
      );
    bar.append('text')
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
          .on('start', function(d) {
            _this.emit('drag:start:task:to', d, {x: d3.event.x, y: d3.event.y});
          })
          .on('drag', function(d) {
            _this.emit('drag:drag:task:to', d, {x: d3.event.x, y: d3.event.y});
          })
          .on('end', function(d) {
            _this.emit('drag:end:task:to', d, {x: d3.event.x, y: d3.event.y});
          })
      );
    bar.append('text')
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
          .on('start', function(d) {
            _this.emit('drag:start:task:from', d, {x: d3.event.x, y: d3.event.y});
          })
          .on('drag', function(d) {
            _this.emit('drag:drag:task:from', d, {x: d3.event.x, y: d3.event.y});
          })
          .on('end', function(d) {
            _this.emit('drag:end:task:from', d, {x: d3.event.x, y: d3.event.y});
          })
      );


    // UPDATE.
    // ------------------------------------------------------------
    bars.merge(bar)
      .attr('width', (d) => this.xScale(d.to) - this.xScale(d.from))
      .attr('height', this.yScale.bandwidth())
      .attr('x', (d) => this.xScale(d.from))
      .attr('y', (d, i) => this.yScale(i));
    bars.merge(bar)
      .selectAll('.bar-background')
      .attr('fill', (d) => d.pattern || d.color);
    bars.merge(bar)
      .selectAll('.bar-label')
      .text((d) => d.name);

    // EXIT.
    // ------------------------------------------------------------
    bars.exit()
      .remove();
  }

  /**
   * @param {Roadmap} roadmap
   * @param {number} sidePadding
   * @private
   */
  _addMouseHelper(sidePadding) {
    const _this = this;
    const mouseBoxHeight = this.yScale.bandwidth();
    const verticalMouse = this.svg.append('line')
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

    const verticalMouseBox = this.svg.append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', 50)
      .attr('height', mouseBoxHeight)
      .attr('stroke', 'none')
      .attr('fill', 'black')
      .attr('fill-opacity', 0.8)
      .style('display', 'none');

    const verticalMouseText = this.svg.append('text')
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('text-height', mouseBoxHeight)
      .attr('fill', 'white')
      .style('display', 'none');

    const verticalMouseTopPadding = 40;

    this.svg.on('mousemove', function () {
      const xCoord = d3.mouse(this)[0];
      const yCoord = d3.mouse(this)[1];

      if (xCoord > sidePadding) {
        verticalMouse
          .attr('x1', xCoord)
          .attr('y1', 0)
          .attr('x2', xCoord)
          .attr('y2', _this.svg.attr('height'))
          .style('display', 'block');

        verticalMouseBox
          .attr('x', xCoord - 25)
          .attr('y', yCoord - (mouseBoxHeight + 8) / 2 + verticalMouseTopPadding)
          .style('display', 'block');

        verticalMouseText
          .attr('transform', 'translate(' + xCoord + ',' + (yCoord + verticalMouseTopPadding) + ')')
          .text(d3.timeFormat(_this.style.timeFormat)(_this.xScale.invert(xCoord - sidePadding)))
          .style('display', 'block');
      } else {
        verticalMouse.style('display', 'none');
        verticalMouseBox.style('display', 'none');
        verticalMouseText.style('display', 'none');
      }
    });

    this.svg.on('mouseleave', function() {
      verticalMouse.style('display', 'none');
      verticalMouseBox.style('display', 'none');
      verticalMouseText.style('display', 'none');
    });

    this.svg.on('contextmenu', function() {
      d3.event.preventDefault();
      const contextMenu = new ContextMenu([
        {
          label: 'copy json data to clip board',
          cb: function (e) {
            const dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.setAttribute('id', 'copy-dummy');
            document.getElementById('copy-dummy').value = _this.roadmap.toString();
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
          }
        }
      ]);
      contextMenu.show(_this.svg, d3.mouse(this)[0], d3.mouse(this)[1]);
    });
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

}


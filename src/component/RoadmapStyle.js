import * as d3 from 'd3';

export class RoadmapStyle {
  barHeight = 20;
  barPadding = 0.1;
  timeFormat = d3.timeFormat('%b %d');
  tickInterval = d3.timeMonday;
  backgroundColors = [
    '#f9f9f9',
    '#eeeeee'
  ];

  /**
   * @param {object} style
   */
  constructor(style) {
    if (style.barHeight !== undefined) {
      this.barHeight = parseInt(style.barHeight);
    }
    if (style.timeFormat !== undefined) {
      this.timeFormat = d3.timeFormat(style.timeFormat);
    }
    if (style.tickInterval !== undefined && d3.hasOwnProperty(style.tickInterval)) {
      this.tickInterval = d3[style.tickInterval];
    }
    if (style.backgroundColors !== undefined) {
      this.backgroundColors = [].concat(style.backgroundColors);
    }
  }
}

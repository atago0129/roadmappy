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

  static TASK_LABEL_POSITION_TYPE = {
    LEFT: 'left',
    LEFT_OUTER: 'left_outer',
    CENTER: 'center',
    RIGHT: 'right',
    RIGHT_OUTER: 'right_outer'
  };
  taskLabelPosition = RoadmapStyle.TASK_LABEL_POSITION_TYPE.CENTER;

  static isValidAlignType(type) {
    return Object.values(this.TASK_LABEL_POSITION_TYPE).indexOf(type) >= 0;
  }

  /**
   * @param {object} style
   */
  constructor(style) {
    if (style.hasOwnProperty('barHeight')) this.barHeight = parseInt(style.barHeight, 10);
    if (style.hasOwnProperty('timeFormat')) this.timeFormat = d3.timeFormat(style.timeFormat);
    if (style.hasOwnProperty('tickInterval') && d3.hasOwnProperty(style.tickInterval)) this.tickInterval = d3[style.tickInterval];
    if (style.hasOwnProperty('backgroundColors')) this.backgroundColors = [].concat(style.backgroundColors);
    if (style.hasOwnProperty('taskLabelPosition') && RoadmapStyle.isValidAlignType(style.taskLabelPosition)) this.taskLabelPosition = style.taskLabelPosition;
  }

}

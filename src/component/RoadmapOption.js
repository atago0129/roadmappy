import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';
import {RoadmapStyle} from './RoadmapStyle';

export class RoadmapOption {
  type;
  baseDate;
  span;
  targetElementId;
  style;
  plugins;

  /**
   * @param {object} options
   */
  constructor(options) {
    this.type = AbstractRoadmapGroup.isValidType(options.type) ? options.type : AbstractRoadmapGroup.TYPE.STORY;
    this.baseDate = new Date(options['baseDate'] || new Date());
    this.span = [].concat(options['span'] || [30, 30]);
    this.targetElementId = '#' + options.target;
    this.style = new RoadmapStyle(options.hasOwnProperty('style') ? options.style : {});
    this.plugins = [].concat(options['plugins'] || []);
  }
}

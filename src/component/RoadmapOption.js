import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';
import {RoadmapStyle} from './RoadmapStyle';

export class RoadmapOption {
  type;
  targetElementId;
  style;

  /**
   * @param {object} options
   */
  constructor(options) {
    this.type = AbstractRoadmapGroup.isValidType(options.type) ? options.type : AbstractRoadmapGroup.TYPE.STORY;
    this.targetElementId = '#' + options.target;
    this.style = new RoadmapStyle(options.hasOwnProperty('style') ? options.style : {});
  }
}

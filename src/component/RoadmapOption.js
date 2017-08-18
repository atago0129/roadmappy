import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';
import {RoadmapStyle} from './RoadmapStyle';

const ONE_DAY = 1000 * 60 * 60 * 24;

export class RoadmapOption {
  type;
  targetElementId;
  style;

  /**
   * @param {object} options
   */
  constructor(options) {
    this.type = AbstractRoadmapGroup.isValidType(options.type) ? options.type : AbstractRoadmapGroup.TYPE.STORY;
    this.from =  new Date(new Date().getTime() - ONE_DAY * 30);
    this.to = new Date(new Date().getTime() + ONE_DAY * 30);
    this.targetElementId = '#' + options.target;
    this.style = new RoadmapStyle(options.hasOwnProperty('style') ? options.style : {});
  }
}

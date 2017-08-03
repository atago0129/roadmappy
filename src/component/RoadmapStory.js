import {AbstractRoadmapGroup} from "./AbstractRoadmapGroup";

export class RoadmapStory extends AbstractRoadmapGroup{
  /**
   * @param {number|string} id
   * @param {string} name
   * @param {number} order
   */
  constructor(id, name, order) {
    super(id, name, order);
    this.type = "story";
  }
}
import {AbstractRoadmapGroup} from "./AbstractRoadmapGroup";

export class RoadmapAssignee extends AbstractRoadmapGroup{
  /**
   * @param {number|string} id
   * @param {string} name
   * @param {number} order
   */
  constructor(id, name, order) {
    super(id, name, order);
    this.type = "assignee";
  }
}
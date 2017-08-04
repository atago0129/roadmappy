import {AbstractRoadmapGroup} from '../group/AbstractRoadmapGroup';

export class RoadmapTask {
  id;
  name;
  storyId;
  assigneeIdList = [];
  color;
  order;
  from;
  to;
  involvement;

  /**
   * @param {number|string} id
   * @param {string} name
   * @param {number|string} storyId
   * @param {number|string} assigneeIds
   * @param {string|null} color
   * @param {number} order
   * @param {string} from
   * @param {string} to
   * @param {number} involvement
   */
  constructor(id, name, storyId, assigneeIds, color, order, from, to, involvement) {
    this.id = id;
    this.name = name;
    this.storyId = storyId;
    this.assigneeIds = [].concat(assigneeIds || []);
    this.color = color;
    this.order = parseInt(order);
    this.from = new Date(from);
    this.to = new Date(new Date(to).setHours((new Date(to).getHours() + 24)));
    this.involvement = Math.min(parseInt(involvement), 100);
  }

}


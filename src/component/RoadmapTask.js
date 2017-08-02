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
   * @param {number|string} assigneeIdList
   * @param {string|null} color
   * @param {number} order
   * @param {string} from
   * @param {string} to
   * @param {number} involvement
   */
  constructor(id, name, storyId, assigneeIdList, color, order, from, to, involvement) {
    this.id = id;
    this.name = name;
    this.storyId = storyId;
    this.assigneeIdList = assigneeIdList;
    this.color = color;
    this.order = parseInt(order);
    this.from = new Date(from);
    this.to = new Date(new Date(to).setHours((new Date(to).getHours() + 24)));
    this.involvement = parseInt(involvement);
    if (this.involvement > 100) {
      this.involvement = 100;
    }
  }
}
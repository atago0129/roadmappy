export class AbstractRoadmapGroup {

  static TYPE = {
    STORY: 'story',
    ASSIGNEE: 'assignee'
  };

  /**
   * @param {string} type
   * @return {boolean}
   */
  static isValidType(type) {
    return Object.values(this.TYPE).indexOf(type) >= 0;
  }

  type;
  id;
  name;
  order;

  /**
   * @param {string} type
   * @param {number|string} id
   * @param {string} name
   * @param {number} order
   */
  constructor(type, id, name, order) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.order = order;
  }


  /**
   * @param {RoadmapTask} task
   * @return {boolean}
   */
  match(task) {
    throw new Error('not implemented.');
  }

}


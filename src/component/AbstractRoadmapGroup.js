export class AbstractRoadmapGroup {
  type;
  id;
  name;
  order;

  /**
   * @param {number|string} id
   * @param {string} name
   * @param {number} order
   */
  constructor(id, name, order) {
    this.id = id;
    this.name = name;
    this.order = order;
  }

}
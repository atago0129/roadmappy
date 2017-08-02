export class AbstractRoadmapGroup {
  id;
  name;
  order;
  tasks = [];

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

  /**
   * @param {RoadmapTask} task
   */
  pushTask(task) {
    this.tasks.push(task);
  }

  /**
   * @returns {RoadmapTask[]}
   */
  getTaskList() {
    let result = this.tasks;
    result.sort(function (a, b) {
      if (a.order !== b.order) {
        return a.order > b.order ? 1 : -1;
      } else {
        return a.from > b.from ? 1 : -1;
      }
    });
    return result;
  }

  /**
   * @returns {number}
   */
  getTasksLength() {
    return this.tasks.length;
  }
}
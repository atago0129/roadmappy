import {AbstractRoadmapGroup} from './AbstractRoadmapGroup';

export class RoadmapAssignee extends AbstractRoadmapGroup {
  /**
   * @param {number|string} id
   * @param {string} name
   * @param {number} order
   */
  constructor(id, name, order) {
    super(AbstractRoadmapGroup.TYPE.ASSIGNEE, id, name, order);
  }

  /**
   * @param {RoadmapTask} task
   * @return {boolean}
   */
  match(task) {
    return task.assigneeIds.indexOf(this.id) >= 0;
  }

}


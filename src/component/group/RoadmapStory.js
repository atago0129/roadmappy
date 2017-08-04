import {AbstractRoadmapGroup} from "./AbstractRoadmapGroup";

export class RoadmapStory extends AbstractRoadmapGroup {
  /**
   * @param {number|string} id
   * @param {string} name
   * @param {number} order
   */
  constructor(id, name, order) {
    super(AbstractRoadmapGroup.TYPE.STORY, id, name, order);
  }

  /**
   * @param {RoadmapTask} task
   * @return {boolean}
   */
  match(task) {
    return task.storyId === this.id;
  }

}


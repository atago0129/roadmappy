import {Roadmap} from './Roadmap';
import {RoadmapTask} from './task/RoadmapTask';
import {RoadmapStory} from './group/RoadmapStory';
import {RoadmapAssignee} from './group/RoadmapAssignee';

export class RoadmapFactory {

  /**
   * @param {RoadmapOption} option
   * @param {object} dataSet
   * @returns {Roadmap}
   */
  create(option, dataSet) {
    return new Roadmap(
      option.type,
      option.baseDate,
      option.span,
      this._createTasks(dataSet.tasks || []),
      this._createStories(dataSet.stories || []),
      this._createAssignees(dataSet.assignees || [])
    );
  }

  /**
   * @param {Array} stories
   * @return {RoadmapStory[]}
   * @private
   */
  _createStories(stories) {
    return stories.filter((story) => {
      return story.id && story.name;
    }).map((story) => {
      return new RoadmapStory(
        story.id,
        story.name,
        story.order || 0
      );
    });
  }

  /**
   * @param {Array} assignees
   * @return {RoadmapAssignee[]}
   * @private
   */
  _createAssignees(assignees) {
    return assignees.filter((assignee) => {
      return assignee.id && assignee.name;
    }).map((assignee) => {
      return new RoadmapAssignee(
        assignee.id,
        assignee.name,
        assignee.order || 0
      );
    });
  }

  /**
   * @param {Array} tasks
   * @return {RoadmapTask[]}
   * @private
   */
  _createTasks(tasks) {
    return tasks.filter((task) => {
      return task.id && task.name && task.from && task.to;
    }).map((task) => {
      return new RoadmapTask(
        task.id,
        task.name,
        task.story || null,
        task.assignee || null,
        task.color || null,
        task.order || 0,
        task.from,
        task.to,
        task.involvement || 0
      );
    });
  }

}

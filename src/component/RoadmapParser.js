import {Roadmap} from './Roadmap';
import {RoadmapTask} from './task/RoadmapTask';
import {RoadmapStory} from './group/RoadmapStory';
import {RoadmapAssignee} from './group/RoadmapAssignee';

export class RoadmapParser {
  roadmap;

  /**
   * @param {object} dataSet
   * @returns {Roadmap}
   */
  parse(dataSet) {
    this.roadmap = new Roadmap();

    if (dataSet.tasks === undefined) {
      // invalid
      throw new Error('invalid data set.');
    }

    if (dataSet.stories === undefined && dataSet.assignees === undefined) {
      // invalid
      throw new Error('invalid data set.');
    }

    if (dataSet.stories) {
      this._parseStories(dataSet.stories);
    }
    if (dataSet.assignees) {
      this._parseAssignees(dataSet.assignees);
    }
    this._parseTasks(dataSet.tasks);

    return this.roadmap;
  }

  /**
   * @param {object} stories
   * @private
   */
  _parseStories(stories) {
    for (let i = 0; i < stories.length; i++) {
      let story = stories[i];
      if (story.id === undefined || story.name === undefined) {
        // invalid item
        continue;
      }
      this.roadmap.addStory(new RoadmapStory(
        story.id,
        story.name,
        story.order ? story.order : 0
      ));
    }
  }

  /**
   * @param {object} assignees
   * @private
   */
  _parseAssignees(assignees) {
    for (let i = 0; i < assignees.length; i++) {
      let assignee = assignees[i];
      if (assignee.id === undefined || assignee.name === undefined) {
        // invalid item
        continue;
      }
      this.roadmap.addAssignee(new RoadmapAssignee(
        assignee.id,
        assignee.name,
        assignee.order ? assignee.order : 0
      ));
    }
  }

  /**
   * @param {object} tasks
   * @private
   */
  _parseTasks(tasks) {
    for (let i = 0; i < tasks.length; i++) {
      let task = tasks[i];
      if (task.id === undefined || task.name === undefined || task.from === undefined || task.to === undefined) {
        // invalid item
        continue;
      }
      let roadmapTask = new RoadmapTask(
        task.id,
        task.name,
        task.story ? task.story : null,
        task.assignee ? task.assignee : [],
        task.color ? task.color : null,
        task.order ? task.order : 0,
        task.from,
        task.to,
        task.involvement
      );
      this.roadmap.addTask(roadmapTask);
    }
  }

}

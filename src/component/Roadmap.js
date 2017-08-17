import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';

export class Roadmap {

  _type = null;
  _tasks = [];
  _stories = [];
  _assignees = [];

  /**
   * @param {string} type
   * @param {RoadmapTask[]} tasks
   * @param {RoadmapStory[]} stories
   * @param {RoadmapAssignee[]} assignees
   */
  constructor(type, tasks, stories, assignees) {
    this._type = type || AbstractRoadmapGroup.TYPE.STORY;
    this._tasks = this._tasks.concat(tasks || []);
    this._stories = this._stories.concat(stories || []);
    this._assignees = this._assignees.concat(assignees || []);
  }

  /**
   * @param {RoadmapTask} task
   */
  addTask(task) {
    this._tasks.push(task);
  }

  /**
   * @param {RoadmapStory} story
   */
  addStory(story) {
    this._stories.push(story);
  }

  /**
   * @param {RoadmapAssignee} assignee
   */
  addAssignee(assignee) {
    this._assignees.push(assignee);
  }

  /**
   * @param {number} taskId
   * @return {RoadmapTask|null}
   */
  getTaskById(taskId) {
    return this._tasks.filter(function(task) {
      return task.id === taskId;
    }).pop() || null;
  }

  /**
   * @param {number} i
   * @return {RoadmapTask|null}
   */
  getTaskByIndex(i) {
    return this._tasks[i];
  }

  /**
   * @param {number} storyId
   * @returns {RoadmapStory|null}
   */
  getStoryById(storyId) {
    return this._stories.filter(function(story) {
      return story.id === storyId;
    }).pop() || null;
  }

  /**
   * @param {number} assigneeId
   * @returns {RoadmapAssignee|null}
   */
  getAssigneeById(assigneeId) {
    return this._assignees.filter(function(asignee) {
      return asignee.id === assigneeId;
    }).pop() || null;
  }

  /**
   * @return {RoadmapTask[]}
   */
  getTasks() {
    return this.getGroups().reduce((tasks, group) => {
      return tasks.concat(this.getTasksByGroup(group));
    }, []);
  }

  /**
   * @param {AbstractRoadmapGroup} group
   * @returns {RoadmapTask[]}
   */
  getTasksByGroup(group) {
    return this._tasks.filter(function(task) {
      return group.match(task);
    });
  }

  /**
   * @returns {AbstractRoadmapGroup[]}
   */
  getGroups() {
    switch (this._type) {
      case AbstractRoadmapGroup.TYPE.STORY:
        return [].concat(this._stories);
      case AbstractRoadmapGroup.TYPE.ASSIGNEE:
        return [].concat(this._assignees);
      default:
        throw new Error('not detected group type.');
    }
  }

  /**
   * reorder.
   */
  reorder() {
    this._assignees.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order > b.order ? 1 : -1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    });
    this._stories.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order > b.order ? 1 : -1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    });
    this._tasks.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order > b.order ? 1 : -1;
      } else {
        return a.from > b.from ? 1 : -1;
      }
    });
  }

  /**
   * @return {string}
   */
  toString() {
    // TODO: implements
    return 'call toString';
  }

}

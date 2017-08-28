import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';
import {RoadmapTask} from "./task/RoadmapTask";

const ONE_DAY = 1000 * 60 * 60 * 24;

export class Roadmap {

  _type = null;
  _from = null;
  _to = null;
  _tasks = [];
  _stories = [];
  _assignees = [];

  /**
   * @param {string} type
   * @param {Date} baseDate
   * @param {array} span
   * @param {RoadmapTask[]} tasks
   * @param {RoadmapStory[]} stories
   * @param {RoadmapAssignee[]} assignees
   */
  constructor(type, baseDate, span, tasks, stories, assignees) {
    this._type = type || AbstractRoadmapGroup.TYPE.STORY;
    this._tasks = this._tasks.concat(tasks || []);
    this._stories = this._stories.concat(stories || []);
    this._assignees = this._assignees.concat(assignees || []);
    this._defineRange(baseDate, span);
  }

  _defineRange(baseDate, span) {
    const baseTime = baseDate.getTime();
    const fromSpan = span[0];
    const toSpan = span[Math.min(1, span.length - 1)];

    this._from = new Date(baseTime - ONE_DAY * fromSpan);
    this._to = new Date(baseTime + ONE_DAY * toSpan);
  }

  /**
   * @param {number} id
   * @returns {RoadmapStory|null}
   */
  getStoryById(id) {
    return this._stories.filter(function(story) {
      return story.id === id;
    }).pop() || null;
  }

  /**
   * @param {number} id
   * @returns {RoadmapAssignee|null}
   */
  getAssigneeById(id) {
    return this._assignees.filter(function(asignee) {
      return asignee.id === id;
    }).pop() || null;
  }

  /**
   * @param {number} id
   * @return {RoadmapTask}
   */
  getTaskById(id) {
    return this._tasks.filter(function(task) {
      return task.id === id;
    }).pop() || null;
  }

  /**
   * @param {number} id
   */
  removeTaskById(id) {
    this._tasks = this._tasks.filter(function(task) {
      return task.id !== id;
    });
  }

  /**
   * @returns {RoadmapTask[]}
   */
  getRawTask() {
    return this._tasks;
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
        return this.getStories();
      case AbstractRoadmapGroup.TYPE.ASSIGNEE:
        return this.getAssignees();
      default:
        throw new Error('not detected group type.');
    }
  }

  /**
   * @returns {RoadmapStory[]}
   */
  getStories() {
    return [].concat(this._stories);
  }

  /**
   * @returns {RoadmapAssignee[]}
   */
  getAssignees() {
    return [].concat(this._assignees);
  }

  /**
   * @param {number} index
   * @param {AbstractRoadmapGroup} group
   * @param {string} from
   */
  addEmptyTask(index, group, from) {
    const taskId = Math.max.apply(null, this._tasks.reduce((taskIds, task) => taskIds.concat(task.id), [])) + 1;
    let newTask;
    switch (group.type) {
      case AbstractRoadmapGroup.TYPE.STORY:
        newTask = new RoadmapTask(taskId, 'new task', group.id, null, null, 0, from, new Date(from.getTime() + 7 * ONE_DAY), 100);
        break;
      case AbstractRoadmapGroup.TYPE.ASSIGNEE:
        newTask = new RoadmapTask(taskId, 'new task', null, group.id, null, 0, from, new Date(from.getTime() + 7 * ONE_DAY), 100);
        break;
      default:
        throw new Error('invalid argument.');
    }
    this._tasks.splice(index, 0, newTask);
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

  get from() {
    return this._from;
  }

  get to() {
    return this._to;
  }

  set from(from) {
    if ((from.getTime() - this.to.getTime()) > -ONE_DAY) {
      this._to = new Date(from.getTime() + ONE_DAY);
    }
    this._from = from;
  }

  set to(to) {
    if ((this.from.getTime() - to.getTime()) > -ONE_DAY) {
      this._from = new Date(to.getTime() - ONE_DAY);
    }
    this._to = to;
  }

  toAssoc() {
    return {
      'tasks': this._tasks.reduce((tasks, task) => {return tasks.concat(task.toAssoc());}, []),
      'stories': this._stories.reduce((stories, story) => {return stories.concat(story.toAssoc())}, []),
      'assignees': this._assignees.reduce((assginees, assignee) => {return assginees.concat(assignee.toAssoc())}, [])
    };
  }

}

import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';
import {RoadmapTask} from "./task/RoadmapTask";
import {RoadmapStory} from "./group/RoadmapStory";
import {RoadmapAssignee} from "./group/RoadmapAssignee";

const ONE_DAY = 1000 * 60 * 60 * 24;

export class Roadmap {

  _lang = null;
  _type = null;
  _taskSortRule = {};
  _from = null;
  _to = null;
  _tasks = [];
  _stories = [];
  _assignees = [];

  /**
   * @param {string} lang
   * @param {string} type
   * @param {string[]} taskSortRule
   * @param {Date} baseDate
   * @param {array} span
   * @param {RoadmapTask[]} tasks
   * @param {RoadmapStory[]} stories
   * @param {RoadmapAssignee[]} assignees
   */
  constructor(lang, type, taskSortRule, baseDate, span, tasks, stories, assignees) {
    this._lang = lang;
    this._type = type || AbstractRoadmapGroup.TYPE.STORY;
    this._taskSortRule = taskSortRule;
    this._tasks = this._tasks.concat(tasks || []);
    this._stories = this._stories.concat(stories || []);
    this._assignees = this._assignees.concat(assignees || []);
    this._initialize(baseDate, span);
  }

  /**
   * @param {Date} baseDate
   * @param {Array} span
   */
  _initialize(baseDate, span) {
    // initialize from/to.
    this._from = new Date(baseDate.getTime() - ONE_DAY * span[0]);
    this._to = new Date(baseDate.getTime() + ONE_DAY * span[1]);

    // initialize empty group.
    this.getGroups().forEach(group => {
      if (this.getTasksByGroup(group).length === 0) {
        this.addEmptyTask(0, group, this._from);
      }
    });
  }

  /**
   * @returns {string}
   */
  getLanguage() {
    return this._lang;
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
    return this._getGroupsByType(this._type);
  }

  _getGroupsByType(type) {
    switch (type) {
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
    const taskId = Math.max.apply(null, [0].concat(this._tasks.map(t => t.id))) + 1;
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
   * @param {number} taskId
   */
  copyTask(taskId) {
    const targetTask = this.getTaskById(taskId);
    const newTaskId = Math.max.apply(null, [0].concat(this._tasks.map(t => t.id))) + 1;
    const newTask = new RoadmapTask(newTaskId, '[copy]' + targetTask.name, targetTask.storyId, targetTask.assigneeIds, targetTask.color, targetTask.order, targetTask.from, targetTask.to, targetTask.involvement);
    this._tasks.push(newTask);
  }

  /**
   * @param {string} name
   * @param {string} type
   */
  addNewGroup(name, type) {
    const groups = this._getGroupsByType(type);
    const id = Math.max.apply(null, [0].concat(groups.map(g => g.id))) + 1;
    const order = Math.max.apply(null, [0].concat(groups.map(g => g.order))) + 1;
    switch (type) {
      case AbstractRoadmapGroup.TYPE.STORY:
        this._stories.push(new RoadmapStory(id, name, order));
        break;
      case AbstractRoadmapGroup.TYPE.ASSIGNEE:
        this._assignees.push(new RoadmapAssignee(id, name, order));
        break;
      default:
        throw new Error('invalid argument.');
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
      const _a = a.toAssoc();
      const _b = b.toAssoc();
      if (_a.order !== _b.order) {
        return _a.order > _b.order ? 1 : -1;
      } else {
        for (let i = 0; i < this._taskSortRule.length; i++) {
          if (!_a.hasOwnProperty(this._taskSortRule[i]) || !_b.hasOwnProperty(this._taskSortRule[i])) continue;
          if (_a[this._taskSortRule[i]] !== _b[this._taskSortRule[i]]) {
            return _a[this._taskSortRule[i]] > _b[this._taskSortRule[i]] ? 1 : -1;
          }
        }
        return _a.id > _b.id ? 1 : -1;
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

  /**
   * @return {Date}
   */
  get from() {
    return this._from;
  }

  /**
   * @return {Date}
   */
  get to() {
    return this._to;
  }

  /**
   * @param {Date}
   */
  set from(from) {
    if ((from.getTime() - this.to.getTime()) > -ONE_DAY) {
      this._to = new Date(from.getTime() + ONE_DAY);
    }
    this._from = from;
  }

  /**
   * @param {Date}
   */
  set to(to) {
    if ((this.from.getTime() - to.getTime()) > -ONE_DAY) {
      this._from = new Date(to.getTime() - ONE_DAY);
    }
    this._to = to;
  }

  /**
   * @return {object}
   */
  toAssoc() {
    return {
      tasks: this._tasks.map(t => t.toAssoc()),
      stories: this._stories.map(s => s.toAssoc()),
      assignees: this._assignees.map(a => a.toAssoc())
    };
  }

}

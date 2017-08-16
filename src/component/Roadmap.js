import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';

export class Roadmap {

  tasks = [];
  stories = [];
  assignees = [];

  /**
   * @param {RoadmapTask} task
   */
  addTask(task) {
    this.tasks.push(task);
  }

  /**
   * @param {RoadmapStory} story
   */
  addStory(story) {
    this.stories.push(story);
  }

  /**
   * @param {RoadmapAssignee} assignee
   */
  addAssignee(assignee) {
    this.assignees.push(assignee);
  }

  /**
   * @param {number} taskId
   * @return {RoadmapTask|null}
   */
  getTaskById(taskId) {
    return this.tasks.filter(function(task) {
      return task.id === taskId;
    }).pop() || null;
  }

  /**
   * @param {number} storyId
   * @returns {RoadmapStory|null}
   */
  getStoryById(storyId) {
    return this.stories.filter(function(story) {
      return story.id === storyId;
    }).pop() || null;
  }

  /**
   * @param {number} assigneeId
   * @returns {RoadmapAssignee|null}
   */
  getAssigneeById(assigneeId) {
    return this.assignees.filter(function(asignee) {
      return asignee.id === assigneeId;
    }).pop() || null;
  }

  /**
   * @param {string} type
   * @return {RoadmapTask[]}
   */
  getGroupSortedTasks(type) {
    return this.getSortedGroups(type).reduce((tasks, group) => {
      return tasks.concat(this.getSortedTasksByGroup(group));
    }, []);
  }

  /**
   * @param {AbstractRoadmapGroup} group
   * @returns {RoadmapTask[]}
   */
  getSortedTasksByGroup(group) {
    return this.tasks.filter(function(task) {
      return group.match(task);
    }).sort(function(a, b) {
      if (a.order !== b.order) {
        return a.order > b.order ? 1 : -1;
      } else {
        return a.from > b.from ? 1 : -1;
      }
    });
  }

  /**
   * @param {string} type
   * @returns {AbstractRoadmapGroup[]}
   */
  getSortedGroups(type) {
    const groups = (() => {
      switch (type) {
        case AbstractRoadmapGroup.TYPE.STORY:
          return this.stories;
        case AbstractRoadmapGroup.TYPE.ASSIGNEE:
          return this.assignees;
        default:
          throw new Error('not detected group type.');
      }
    })();

    return [].concat(groups).sort(function(a, b) {
      if (a.order !== b.order) {
        return a.order > b.order ? 1 : -1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    });
  }

  toString() {
    // TODO: implements
    return 'call toString';
  }

}

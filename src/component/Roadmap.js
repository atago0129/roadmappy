export class Roadmap {
  tasks = {};
  stories = {};
  assignees = {};

  /**
   * @param {RoadmapTask} task
   */
  addTask(task) {
    this.tasks[task.id] = task;
  }

  /**
   * @param {RoadmapStory} story
   */
  addStory(story) {
    this.stories[story.id] = story;
  }

  /**
   * @param storyId
   * @returns {RoadmapStory} | null
   */
  getStoryById(storyId) {
    if (this.stories[storyId] === undefined) {
      return null;
    }
    return this.stories[storyId];
  }

  /**
   * @returns {RoadmapStory[]}
   */
  getStoryList() {
    let result = [];
    for (let k in this.stories) {
      if (this.stories.hasOwnProperty(k)) {
        result.push(this.stories[k]);
      }
    }
    result.sort(function (a, b) {
      if (a.order !== b.order) {
        return a.order > b.order ? 1 : -1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    });
    return result;
  }

  /**
   * @param {RoadmapAssignee} assignee
   */
  addAssignee(assignee) {
    this.assignees[assignee.id] = assignee;
  }

  /**
   * @param assgneeId
   * @returns {RoadmapAssignee} | null
   */
  getAssigneeById(assgneeId) {
    if (this.assignees[assgneeId] === undefined) {
      return null;
    }
    return this.assignees[assgneeId];
  }

  /**
   * @returns {RoadmapAssignee[]}
   */
  getAssigneeList() {
    let result = [];
    for (let k in this.assignees) {
      if (this.assignees.hasOwnProperty(k)) {
        result.push(this.assignees[k]);
      }
    }
    result.sort(function (a, b) {
      if (a.order !== b.order) {
        return a.order > b.order ? 1 : -1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    });
    return result;
  }

  toString() {
    // TODO: implements
    return "call toString";
  }
}
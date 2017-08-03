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
   * @param {AbstractRoadmapGroup} group
   * @returns {RoadmapTask[]}
   */
  getSortedTaskListByGroup(group) {
    let result = [];
    for (let i = 0; i < this.tasks.length; i++) {
      if (group.type === "story") {
        if (group.id === this.tasks[i].storyId) {
          result.push(this.tasks[i]);
        }
      } else if (group.type === "assignee") {
        for (let j = 0; j < this.tasks[i].assigneeIdList.length; j++) {
          if (group.id === this.tasks[i].assigneeIdList[j]) {
            result.push(this.tasks[i]);
          }
        }
      }
    }
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
   * @param {RoadmapStory} story
   */
  addStory(story) {
    this.stories.push(story);
  }

  /**
   * @param storyId
   * @returns {RoadmapStory} | null
   */
  getStoryById(storyId) {
    for (let i = 0; i < this.stories.length; i++) {
      if (storyId === this.stories[i].id) {
        return this.stories[i];
      }
    }
    return null;
  }

  /**
   * @returns {RoadmapStory[]}
   */
  getSortedStoryList() {
    let result = this.stories;
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
    this.assignees.push(assignee);
  }

  /**
   * @param assigneeId
   * @returns {RoadmapAssignee} | null
   */
  getAssigneeById(assigneeId) {
    for (let i = 0; i < this.assignees.length; i++) {
      if (assigneeId === this.assignees[i].id) {
        return this.assignees[i];
      }
    }
    return null;
  }

  /**
   * @returns {RoadmapAssignee[]}
   */
  getSortedAssigneeList() {
    let result = this.assignees;
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
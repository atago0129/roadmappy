export class Roadmap {
  tasks = [];
  people = [];

  setTask(task) {
    this.tasks.push(task);
  }

  setPerson(person) {
    this.people.push(person);
  }

  getTasks() {
    return this._sortItems(this.tasks);
  }

  getPeople() {
    return this._sortItems(this.people);
  }

  _sortItems(items) {
    items.sort(function(a, b) {
      if (a.group === b.group) {
        if (a.taskOrder !== b.taskOrder) {
          return a.taskOrder > b.taskOrder ? 1 : -1;
        }
        return a.from > b.from ? 1 : -1;
      } else {
        if (a.order !== b.order) {
          return a.order > b.order ? 1 : -1;
        }
        return a.group > b.group ? 1 : -1;
      }
    });
    return items;
  }

  getTaskGroups() {
    return this._getGroups(this.tasks);
  }

  getPersonGroups() {
    return this._getGroups(this.people);
  }

  _getGroups(items) {
    let groups = [];
    for (let i = 0; i < items.length; i++){
      let j = 0;
      let found = false;
      while (j < groups.length && !found) {
        found = (groups[j].name === items[i].group);
        j++;
      }
      if (!found) {
        let count = 0;
        j = 0;
        while (j < items.length) {
          if (items[j].group === items[i].group) {
            count++;
          }
          j++;
        }
        groups.push({
          type: "group",
          name: items[i].group,
          count: count,
          style: items[i].style
        });
      }
    }
    return groups;
  }

  toString() {
    // TODO: implements
    return "call toString";
  }
}
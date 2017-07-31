import {Roadmap} from "./Roadmap";

export class RoadmapParser {
  parse(tasks, people) {
    let roadmap = new Roadmap();

    for (let i = 0; i < tasks.length; i++) {
      let task = {};
      task.type = "task";
      task.group = tasks[i].taskGroup ? tasks[i].taskGroup : '';
      task.name = tasks[i].name ? tasks[i].name : '';
      task.style = tasks[i].style ? tasks[i].style : "normal";
      task.color = tasks[i].color ? tasks[i].color : null;
      task.order = tasks[i].order ? parseInt(tasks[i].order, 10) : 0;
      task.from = new Date(tasks[i].from);
      task.to = new Date(new Date(tasks[i].to).setHours((new Date(tasks[i].to).getHours() + 24)));
      if (tasks[i].people) {
        if (Array.isArray(tasks[i].people)) {
          for (let j = 0; j < tasks[i].people.length; j++) {
            roadmap.setPerson(
              this._parsePerson(this._getPersonById(tasks[i].people[j], people), task)
            );
          }
        } else {
          roadmap.setPerson(
            this._parsePerson(this._getPersonById(tasks[i].people, people), task)
          );
        }
      }
      roadmap.setTask(task);
    }
    return roadmap;
  }

  _getPersonById(id, people) {
    for (let i = 0; i < people.length; i++) {
      if (people[i].id === id) {
        return people[i];
      }
    }
  }

  _parsePerson(person, task) {
    return {
      type: "people",
      order: person.order ? parseInt(person.order) : 0,
      group: person.name,
      from: task.from,
      to: task.to,
      name: task.group ? task.name + "(" + task.group + ")" : task.name,
      taskGroup: task.group,
      taskOrder: task.order,
      color: task.color ? task.color : colors(task.group),
      involvement: task.involvement ? parseInt(tasks.involvement, 10) : 100
    };
  }
}
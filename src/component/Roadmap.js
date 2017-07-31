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
    return this.tasks;
  }

  getPeople() {
    return this.people;
  }

  toString() {
    // TODO: implements
    return "call toString";
  }
}
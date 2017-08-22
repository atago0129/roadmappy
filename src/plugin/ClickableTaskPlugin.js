import {PluginInterface} from "./PluginInterface";

export class ClickableTaskPlugin extends PluginInterface {

  roadmappy;

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;
    roadmappy.on('click:task', this._click.bind(this));
  }

  _click(task) {
    task.to = new Date(task.to.getTime() + 1000 * 60 * 60 * 24);
    this.roadmappy.render();
  }
}
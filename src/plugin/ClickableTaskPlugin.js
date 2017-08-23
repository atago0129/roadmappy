import {PluginInterface} from "./PluginInterface";

export class ClickableTaskPlugin extends PluginInterface {

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;
    roadmappy.on('click:task', this._click.bind(this));
  }

  _click(task) {
    // do nothing
  }

}
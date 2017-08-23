import {PluginInterface} from "./PluginInterface";
import * as d3 from 'd3';

export class ClickableTaskLabelPlugin extends PluginInterface {

  clickCount = 0;

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;
    roadmappy.on('click:task-label', this._click.bind(this));
  }

  _click(task, labelNode) {
    if (this.clickCount === 0) {
      ++this.clickCount;
      setTimeout(() => {this.clickCount = 0;}, 350);
    } else {
      d3.event.preventDefault();

      this._doubleClick(task, labelNode);

      this.clickCount = 0;
    }
  }

  _doubleClick(task, labelNode) {
    // todo: implements label edit mode
    // ex. http://jsfiddle.net/brx3xm59/
  }
}
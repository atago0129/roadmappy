import {ContextMenuItemInterface} from "./ContextMenuItemInterface";

export class TaskReorderItem extends ContextMenuItemInterface {

  labelString;

  sortKey;

  /**
   * @param {Roadmappy} roadmappy
   * @param {string} labelString
   * @param {string[]} sortKey
   */
  constructor(roadmappy, labelString, sortKey) {
    this.roadmappy = roadmappy;
    this.labelString = labelString;
    this.sortKey = sortKey;
  }

  label = () => {
    return this.labelString;
  };

  onClick = () => {
    this.roadmappy.roadmap.reorder(this.sortKey);
    this.roadmappy.render();
  };

  items = () => {

  }

}

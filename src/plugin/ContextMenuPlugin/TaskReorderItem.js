import {ContextMenuPluginInterface} from "./ContextMenuPluginInterface";

export class TaskReorderItem extends ContextMenuPluginInterface {

  labelString;

  sortKey;

  /**
   * @param {Roadmappy} roadmappy
   * @param {string} labelString
   * @param {string[]} sortKey
   */
  constructor(roadmappy, labelString, sortKey) {
    super();
    this.initialize(roadmappy);
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
    return null;
  }

}

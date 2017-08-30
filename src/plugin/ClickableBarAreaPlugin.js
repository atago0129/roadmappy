import {PluginInterface} from "./PluginInterface";

export class ClickableBarAreaPlugin extends PluginInterface {

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;
    roadmappy.on('click:bar-area', this.toOnDoubleClick(this._onDoubleClick));
  }

  _onDoubleClick = (xIndex, yIndex) => {
    this.roadmappy.roadmap.addEmptyTask(
      this.roadmappy.roadmap.getRawTask().indexOf(this.roadmappy.roadmap.getTasks()[yIndex]),
      this.roadmappy.canvas.yAxisMap[yIndex],
      xIndex
    );
    this.roadmappy.render();
  }

}

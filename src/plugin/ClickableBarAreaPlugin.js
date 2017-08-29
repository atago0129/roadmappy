import {PluginInterface} from "./PluginInterface";
import * as d3 from 'd3';

export class ClickableBarAreaPlugin extends PluginInterface {
  doubleClickTimerId;
  clickCount = 0;

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

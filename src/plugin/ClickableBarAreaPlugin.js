import {PluginInterface} from "./PluginInterface";
import * as d3 from 'd3';

export class ClickableBarAreaPlugin extends PluginInterface {
  doubleClickTimerId;
  clickCount = 0;

  initialize(roadmappy) {
    this.roadmappy = roadmappy;
    roadmappy.on('click:bar-area', this._onClick);
  }

  _onClick = (xIndex, yIndex) => {
    if (this.clickCount === 0) {
      ++this.clickCount;

      if (this.doubleClickTimerId) {
        clearTimeout(this.doubleClickTimerId);
      }
      this.doubleClickTimerId = setTimeout(() => this.clickCount = 0, 350);
    } else {
      this.clickCount = 0;
      d3.event.preventDefault();
      this._onDoubleClick(xIndex, yIndex);
    }
  };

  _onDoubleClick = (xIndex, yIndex) => {
    this.roadmappy.roadmap.addEmptyTask(
      this.roadmappy.roadmap.getRawTask().indexOf(this.roadmappy.roadmap.getTasks()[yIndex]),
      this.roadmappy.canvas.yAxisMap[yIndex],
      xIndex
    );
    this.roadmappy.render();
  }
}
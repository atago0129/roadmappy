import { PluginInterface } from './PluginInterface';

export class CreateNewTaskPlugin extends PluginInterface {
  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;
    roadmappy.on('click:bar-area', this.toOnDoubleClick(this._createNewTask));
  }

  _createNewTask = (xIndex, yIndex) => {
    this.roadmappy.roadmap.addEmptyTask(
      this.roadmappy.roadmap.getRawTask().indexOf(this.roadmappy.roadmap.getTasks()[yIndex]),
      this.roadmappy.canvas.yAxisMap[yIndex],
      xIndex
    );
    this.roadmappy.render();
  };
}

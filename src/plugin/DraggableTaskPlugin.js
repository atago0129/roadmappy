import {PluginInterface} from "./PluginInterface";

const DRAG_THRESHOLD_PIXEL = 10;

export class DraggableTaskPlugin extends PluginInterface {

  isDragging = false;
  dragStartPos = null;

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;

    roadmappy.on('drag:start:task:from', this._startDrag.bind(this));
    roadmappy.on('drag:drag:task:from', this._draggingEdgeOfTask.bind(this, 'from'));
    roadmappy.on('drag:end:task:from', this._endDrag.bind(this));

    roadmappy.on('drag:start:task:to', this._startDrag.bind(this));
    roadmappy.on('drag:drag:task:to', this._draggingEdgeOfTask.bind(this, 'to'));
    roadmappy.on('drag:end:task:to', this._endDrag.bind(this));

    roadmappy.on('drag:start:task', this._startDrag.bind(this));
    roadmappy.on('drag:drag:task', this._draggingTask.bind(this));
    roadmappy.on('drag:end:task', this._endDrag.bind(this));
  }

  _startDrag(task, pos) {
    this.dragStartPos = pos;
  }

  _draggingTask(task, pos) {
    if (this.isDragging) {
      const xScale = this.roadmappy.canvas.xScale;
      const width = xScale(task.to) - xScale(task.from);
      task.from = xScale.invert(pos.x - width / 2);
      task.to = xScale.invert(pos.x + width / 2);
      this.roadmappy.render();
    } else {
      this.isDragging = Math.abs(this.dragStartPos.x - pos.x) > DRAG_THRESHOLD_PIXEL;
    }
  }

  _draggingEdgeOfTask(key, task, pos) {
    if (this.isDragging) {
      const xScale = this.roadmappy.canvas.xScale;
      task[key] = xScale.invert(pos.x);
      this.roadmappy.render();
    } else {
      this.isDragging = Math.abs(this.dragStartPos.x - pos.x) > DRAG_THRESHOLD_PIXEL;
    }
  }

  _endDrag(task, pos) {
    this.roadmappy.roadmap.reorder();
    this.isDragging = false;
    this.dragStartPos = null;
  }

}

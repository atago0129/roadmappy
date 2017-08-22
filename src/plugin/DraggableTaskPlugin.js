import {PluginInterface} from "./PluginInterface";

export class DraggableTaskPlugin extends PluginInterface {

  roadmappy;

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;

    roadmappy.on('drag:start:task:from', this._drag.bind(this, 'from', false));
    roadmappy.on('drag:drag:task:from', this._drag.bind(this, 'from', false));
    roadmappy.on('drag:end:task:from', this._drag.bind(this, 'from', true));
    roadmappy.on('drag:start:task:to', this._drag.bind(this, 'to', false));
    roadmappy.on('drag:drag:task:to', this._drag.bind(this, 'to', false));
    roadmappy.on('drag:end:task:to', this._drag.bind(this, 'to', true));

    roadmappy.on('drag:start:task', this._move.bind(this, false));
    roadmappy.on('drag:drag:task', this._move.bind(this, false));
    roadmappy.on('drag:end:task', this._move.bind(this, true));
  }

  _drag(key, reorder, task, pos) {
    const xScale = this.roadmappy.canvas.xScale;
    task[key] = xScale.invert(pos.x);
    if (reorder) this.roadmappy.roadmap.reorder();
    this.roadmappy.render();
  }

  _move(reorder, task, pos) {
    const xScale = this.roadmappy.canvas.xScale;
    const width = xScale(task.to) - xScale(task.from);
    task.from = xScale.invert(pos.x - width / 2);
    task.to = xScale.invert(pos.x + width / 2);
    if (reorder) this.roadmappy.roadmap.reorder();
    this.roadmappy.render();
  }

}
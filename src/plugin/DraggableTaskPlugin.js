import { PluginInterface } from './PluginInterface';
import * as d3 from 'd3';

const DRAG_THRESHOLD_PIXEL = 10;

export class DraggableTaskPlugin extends PluginInterface {
  isDragging = false;
  dragStartPos = null;

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;

    roadmappy.on('click:task', this._select.bind(this));
    roadmappy.on('click:bar-area', this._unselect.bind(this));
    roadmappy.on('contextmenu:canvas', this._unselect.bind(this));

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

  _select(task) {
    if (d3.event.shiftKey) {
      task.selected = true;
      this.roadmappy.render();
    }
  }

  _unselect() {
    this.roadmappy.roadmap.getSelectedTasks().forEach(task => (task.selected = false));
    this.roadmappy.render();
  }

  _startDrag(task, pos) {
    this.dragStartPos = pos;
    this.taskPosMap = [task].concat(this.roadmappy.roadmap.getSelectedTasks()).reduce((tasks, task) => {
      tasks[task.id] = { from: task.from, to: task.to };
      return tasks;
    }, {});
  }

  _draggingTask(task, pos) {
    if (this.isDragging) {
      const xScale = this.roadmappy.canvas.xScale;

      const diff = xScale.invert(pos.x).getTime() - xScale.invert(this.dragStartPos.x).getTime();
      for (var taskId in this.taskPosMap) {
        const task = this.roadmappy.roadmap.getTaskById(parseInt(taskId, 10));
        if (task) {
          task.from = new Date(this.taskPosMap[taskId].from.getTime() + diff);
          task.to = new Date(this.taskPosMap[taskId].to.getTime() + diff);
        }
      }
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
    if (this.isDragging) {
      this.dragStartPos = null;
      this.taskPosMap = {};
      this.roadmappy.roadmap.getSelectedTasks().forEach(task => (task.selected = false));
      this.isDragging = false;
    }
    this.roadmappy.render();
  }
}

import {EventEmitter} from 'events';
import {RoadmapParser} from './component/RoadmapParser';
import {RoadmapCanvas} from './component/RoadmapCanvas';
import {RoadmapOption} from './component/RoadmapOption';

export class Roadmappy extends EventEmitter {

  roadmap;

  canvas;

  /**
   * @param {object} options
   * @param {object} dataSet
   */
  constructor(options, dataSet) {
    super();

    this.roadmap = new RoadmapParser().parse(dataSet);
    this.canvas = new RoadmapCanvas(this.roadmap, new RoadmapOption(options));
    this.canvas.on('click:task', this.emit.bind(this, 'click:task'));
    this.canvas.on('drag:start:task', this.emit.bind(this, 'drag:start:task'));
    this.canvas.on('drag:drag:task', this.emit.bind(this, 'drag:drag:task'));
    this.canvas.on('drag:end:task', this.emit.bind(this, 'drag:end:task'));
    this.canvas.on('drag:start:task:from', this.emit.bind(this, 'drag:start:task:from'));
    this.canvas.on('drag:drag:task:from', this.emit.bind(this, 'drag:drag:task:from'));
    this.canvas.on('drag:end:task:from', this.emit.bind(this, 'drag:end:task:from'));
    this.canvas.on('drag:start:task:to', this.emit.bind(this, 'drag:start:task:to'));
    this.canvas.on('drag:drag:task:to', this.emit.bind(this, 'drag:drag:task:to'));
    this.canvas.on('drag:end:task:to', this.emit.bind(this, 'drag:end:task:to'));
  }

  /**
   * @returns {void}
   */
  render() {
    this.canvas.render();
  }


}

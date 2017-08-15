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
    this.canvas = new RoadmapCanvas(new RoadmapOption(options));
    this.canvas.on('click:task', this.emit.bind(this, 'click:task'));
  }

  /**
   * @returns {void}
   */
  render() {
    this.canvas.render(this.roadmap);
  }


}

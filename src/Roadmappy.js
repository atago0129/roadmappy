import {RoadmapParser} from "./component/RoadmapParser";
import {RoadmapCanvas} from "./component/RoadmapCanvas";

export class Roadmappy {

  roadmap;

  canvas;

  /**
   * @param {object} options
   * @param {object} dataSet
   */
  constructor(options, dataSet) {
    this.canvas = new RoadmapCanvas(options);
    this.roadmap = new RoadmapParser().parse(dataSet);
  }

  /**
   * @returns {void}
   */
  render() {
    this.canvas.render(this.roadmap);
  }


}

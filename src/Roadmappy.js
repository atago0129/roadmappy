import {RoadmapParser} from "./component/RoadmapParser";
import {RoadmapCanvas} from "./component/RoadmapCanvas";
import {RoadmapOption} from "./component/RoadmapOption";

export class Roadmappy {

  roadmap;

  canvas;

  /**
   * @param {object} options
   * @param {object} dataSet
   */
  constructor(options, dataSet) {
    this.canvas = new RoadmapCanvas(new RoadmapOption(options));
    this.roadmap = new RoadmapParser().parse(dataSet);
  }

  /**
   * @returns {void}
   */
  render() {
    this.canvas.render(this.roadmap);
  }


}

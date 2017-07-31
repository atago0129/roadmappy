import {RoadmapParser} from "./component/RoadmapParser";
import {RoadmapCanvas} from "./component/RoadmapCanvas";

export class Roadmappy {

  roadmap;

  roadmapCanvas;

  constructor(options, {tasks, people}) {
    this.roadmapCanvas = new RoadmapCanvas(options);
    let parser = new RoadmapParser();
    this.roadmap = parser.parse(tasks, people);
  }

  render() {
    this.roadmapCanvas.render(this.roadmap);
  }


}

import {Roadmappy} from './Roadmappy';
import {CanvasContextMenuPlugin} from "./plugin/CanvasContextMenuPlugin";
import {ClickableTaskPlugin} from "./plugin/ClickableTaskPlugin";
import {ClickableTaskLabelPlugin} from "./plugin/ClickableTaskLable/ClickableTaskLabelPlugin";
import {ClickableBarAreaPlugin} from "./plugin/ClickableBarAreaPlugin";
import {DraggableTaskPlugin} from "./plugin/DraggableTaskPlugin";

if (document) {
  var scripts = document.getElementsByTagName('script');
  var current = scripts[scripts.length - 1];
  if (current && current.getAttribute('data-roadmappy')) {
    new Roadmappy(JSON.parse(current.getAttribute('data-roadmappy')));
  }
}

export default Roadmappy;

export {CanvasContextMenuPlugin};
export {ClickableTaskPlugin};
export {ClickableTaskLabelPlugin};
export {ClickableBarAreaPlugin};
export {DraggableTaskPlugin};

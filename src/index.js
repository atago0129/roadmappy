import {Roadmappy} from './Roadmappy';
import {DraggableTaskPlugin} from "./plugin/DraggableTaskPlugin";
import {ClickableTaskPlugin} from "./plugin/ClickableTaskPlugin";

if (document) {
  var scripts = document.getElementsByTagName('script');
  var current = scripts[scripts.length - 1];
  if (current && current.getAttribute('data-roadmappy')) {
    new Roadmappy(JSON.parse(current.getAttribute('data-roadmappy')));
  }
}

export default Roadmappy;

export {DraggableTaskPlugin};
export {ClickableTaskPlugin};
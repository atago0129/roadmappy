import { Roadmappy } from './Roadmappy';
import { ExportTaskDataPlugin } from './plugin/ContextMenuPlugin/ExportTaskDataPlugin';
import { TaskEditFormPlugin } from './plugin/TaskEditFormPlugin/TaskEditFormPlugin';
import { CreateNewTaskPlugin } from './plugin/CreateNewTaskPlugin';
import { DraggableTaskPlugin } from './plugin/DraggableTaskPlugin';
import { TaskReorderPlugin } from './plugin/ContextMenuPlugin/TaskReorderPlugin';

if (document) {
  var scripts = document.getElementsByTagName('script');
  var current = scripts[scripts.length - 1];
  if (current && current.getAttribute('data-roadmappy')) {
    new Roadmappy(JSON.parse(current.getAttribute('data-roadmappy')));
  }
}

export default Roadmappy;

export { ExportTaskDataPlugin };
export { TaskEditFormPlugin };
export { CreateNewTaskPlugin };
export { DraggableTaskPlugin };
export { TaskReorderPlugin };

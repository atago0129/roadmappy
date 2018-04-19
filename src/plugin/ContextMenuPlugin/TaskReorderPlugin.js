import i18next from "i18next";
import { TaskReorderItem } from "./TaskReorderPluginItem";
import { ContextMenuItemInterface } from "./ContextMenuItemInterface";

export class TaskReorderPlugin extends ContextMenuItemInterface {

  label = () => {
    return i18next.t('reorder task');
  };

  onClick = () => {
    this.roadmappy.roadmap.reorder();
    this.roadmappy.render();
  };

  items = () => {
    return [
      new TaskReorderItem(this.roadmappy, i18next.t('From'), ['from', 'name']),
      new TaskReorderItem(this.roadmappy, i18next.t('To'), ['to', 'name']),
      new TaskReorderItem(this.roadmappy, i18next.t('Task name'), ['name']),
      new TaskReorderItem(this.roadmappy, i18next.t('Story'), ['storyId', 'from', 'name'])
    ];
  };

  getTranslation() {
    return {
      ja: {
        'reorder task': 'タスクソート'
      }
    };
  }
}

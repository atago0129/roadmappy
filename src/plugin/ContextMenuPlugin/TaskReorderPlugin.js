import { ContextMenuPluginInterface } from './ContextMenuPluginInterface';
import i18next from 'i18next';

export class TaskReorderPlugin extends ContextMenuPluginInterface {
  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;
  }

  label() {
    return i18next.t('reorder task');
  }

  cb() {
    this.roadmappy.roadmap.reorder();
    this.roadmappy.render();
  }

  getTranslation() {
    return {
      ja: {
        'reorder task': 'タスクをソートし直し'
      }
    };
  }
}

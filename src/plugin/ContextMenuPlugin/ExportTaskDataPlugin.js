import { ContextMenuPluginInterface } from './ContextMenuPluginInterface';
import i18next from 'i18next';

export class ExportTaskDataPlugin extends ContextMenuPluginInterface {
  label = () => {
    return i18next.t('Export');
  };

  action = () => {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.setAttribute('id', 'copy-dummy');
    document.getElementById('copy-dummy').value = JSON.stringify(this.roadmappy.roadmap.toAssoc());
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  };

  items = () => {
    return [
      {
        label: () => {
          return i18next.t('Clipboard');
        },
        onClick: () => {
          const dummy = document.createElement('textarea');
          document.body.appendChild(dummy);
          dummy.setAttribute('id', 'copy-dummy');
          document.getElementById('copy-dummy').value = JSON.stringify(this.roadmappy.roadmap.toAssoc());
          dummy.select();
          document.execCommand('copy');
          document.body.removeChild(dummy);
        },
        items: null
      },
      {
        label: () => {
          return i18next.t('File');
        },
        onClick: () => {
          const blob = new Blob([JSON.stringify(this.roadmappy.roadmap.toAssoc())], { type: 'application/json' });
          let a = document.createElement('a');
          const now = new Date();
          a.download = 'roadmappy_' + [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('') + '.json';
          a.href = URL.createObjectURL(blob);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
        items: null
      }
    ];
  };

  getTranslation() {
    return {
      ja: {
        Export: 'エクスポート',
        Clipboard: 'クリップボード',
        File: 'ファイル'
      }
    };
  }
}

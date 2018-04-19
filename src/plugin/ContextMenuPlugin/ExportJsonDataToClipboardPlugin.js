import { ContextMenuPluginInterface } from './ContextMenuPluginInterface';
import i18next from 'i18next';

export class ExportJsonDataToClipboardPlugin extends ContextMenuPluginInterface {

  label = () => {
    return i18next.t('export json data to clipboard.');
  };

  onClick = () => {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.setAttribute('id', 'copy-dummy');
    document.getElementById('copy-dummy').value = JSON.stringify(this.roadmappy.roadmap.toAssoc());
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  };

  getTranslation() {
    return {
      ja: {
        'export json data to clipboard.': 'JSON データをクリップボードへコピー'
      }
    };
  }
}

import {EventEmitter} from 'events';
import {RoadmapFactory} from './component/RoadmapFactory';
import {RoadmapCanvas} from './component/RoadmapCanvas';
import {RoadmapOption} from './component/RoadmapOption';
import {PluginInterface} from "./plugin/PluginInterface";
import i18next from 'i18next';
import {ContextMenuPluginInterface} from "./plugin/ContextMenuPlugin/ContextMenuPluginInterface";
import {contextmenu} from "@atago0129/d3-v4-contextmenu";

export class Roadmappy extends EventEmitter {

  roadmap;

  canvas;

  /**
   * @param {object} option
   * @param {object} dataSet
   */
  constructor(option, dataSet) {
    super();

    option = new RoadmapOption(option);
    this.roadmap = new RoadmapFactory().create(option, dataSet);
    this.canvas = new RoadmapCanvas(this.roadmap, option);
    this.canvas.on('click:task', this.emit.bind(this, 'click:task'));
    this.canvas.on('click:task-label', this.emit.bind(this, 'click:task-label'));
    this.canvas.on('drag:start:task', this.emit.bind(this, 'drag:start:task'));
    this.canvas.on('drag:drag:task', this.emit.bind(this, 'drag:drag:task'));
    this.canvas.on('drag:end:task', this.emit.bind(this, 'drag:end:task'));
    this.canvas.on('drag:start:task:from', this.emit.bind(this, 'drag:start:task:from'));
    this.canvas.on('drag:drag:task:from', this.emit.bind(this, 'drag:drag:task:from'));
    this.canvas.on('drag:end:task:from', this.emit.bind(this, 'drag:end:task:from'));
    this.canvas.on('drag:start:task:to', this.emit.bind(this, 'drag:start:task:to'));
    this.canvas.on('drag:drag:task:to', this.emit.bind(this, 'drag:drag:task:to'));
    this.canvas.on('drag:end:task:to', this.emit.bind(this, 'drag:end:task:to'));
    this.canvas.on('contextmenu:canvas', this.emit.bind(this, 'contextmenu:canvas'));
    this.canvas.on('click:bar-area', this.emit.bind(this, 'click:bar-area'));

    i18next.init({
      fallbackLng: this.roadmap.getLanguage(),
      nsSeparator: ':::',
      keySeparator: '::'
    });

    const contextMenus = [];
    option.plugins.forEach((plugin) => {
      if (!(plugin instanceof PluginInterface)) return;
      const translation = plugin.getTranslation();
      for (let lang in translation) {
        if (!translation.hasOwnProperty(lang)) continue;
        i18next.addResourceBundle(lang, 'translation', translation[lang], true, true);
      }
      plugin.initialize(this);
      if (plugin instanceof ContextMenuPluginInterface) {
        contextMenus.push(plugin.toObject());
      }
    });

    // init context menu
    if (contextMenus.length > 0) {
      this.canvas.on('contextmenu:canvas', contextmenu(contextMenus));
    }

  }

  /**
   * @returns {void}
   */
  render() {
    this.canvas.render();
  }

}

import {AbstractRoadmapGroup} from './group/AbstractRoadmapGroup';
import {RoadmapStyle} from './RoadmapStyle';
import {CreateNewTaskPlugin, DraggableTaskPlugin, ExportJsonDataToClipboardPlugin, TaskEditFormPlugin, TaskReorderPlugin} from "../";

export class RoadmapOption {
  lang;
  type;
  taskSortRule;
  baseDate;
  span;
  targetElementId;
  style;
  plugins;

  /**
   * @param {object} options
   */
  constructor(options) {
    this.lang = options.hasOwnProperty('lang') ? options.lang : 'en';
    this.type = AbstractRoadmapGroup.isValidType(options.type) ? options.type : AbstractRoadmapGroup.TYPE.STORY;
    this.taskSortRule = options.hasOwnProperty('taskSortRule') ? options.taskSortRule.split(',') : ['from', 'name'];
    this.baseDate = new Date(options['baseDate'] || new Date());
    this.span = [].concat(options['span'] || [30, 30]);
    this.targetElementId = '#' + options.target;
    this.style = new RoadmapStyle(options.hasOwnProperty('style') ? options.style : {});
    this.plugins = [].concat(options['plugins'] || [
      // default plugins
      new DraggableTaskPlugin(),
      new TaskEditFormPlugin(),
      new ExportJsonDataToClipboardPlugin(),
      new CreateNewTaskPlugin(),
      new TaskReorderPlugin()
    ]);
  }
}

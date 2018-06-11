import {PluginInterface} from "../PluginInterface";

export class ContextMenuPluginInterface extends PluginInterface {

  /**
   * Define context menu label
   * @returns string
   */
  label() {
    throw new Error('not implemented.');
  }

  /**
   * Define callback function when context menu is clicked
   * @returns function
   */
  onClick() {
    throw new Error('not implemented.');
  }

  items() {
    throw new Error('not items.');
  }

  toObject() {
    const _this = this;
    return {
      label: function() {
        return _this.label();
      },
      onClick: function() {
        return _this.onClick();
      },
      items: function() {
        return _this.items();
      }
    };
  }
}

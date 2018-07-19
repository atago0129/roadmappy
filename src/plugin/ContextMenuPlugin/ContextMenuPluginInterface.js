import { PluginInterface } from '../PluginInterface';

export class ContextMenuPluginInterface extends PluginInterface {
  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;
  }

  /**
   * Define context menu label
   * @returns string
   */
  label = () => {
    throw new Error('not implemented.');
  };

  /**
   * Define callback function when context menu is clicked
   * @returns function
   */
  action = () => {
    throw new Error('not implemented.');
  };

  /**
   * Define nested items if you need
   * @type {null|object[]}
   */
  items = null;
}

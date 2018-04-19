export class ContextMenuItemInterface {

  roadmappy;

  initilize(roadmappy) {
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
  onClick = () => {
    throw new Error('not implemented.');
  };

  /**
   * Define nested items if you need
   * @type {null|object[]}
   */
  items = null;
}

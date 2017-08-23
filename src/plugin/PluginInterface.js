export class PluginInterface {
  /**
   * {Roadmappy}
   */
  roadmappy;

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    throw new Error('not implemented.');
  }
}
import * as d3 from 'd3';

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

  /**
   * @param {Function} onClick
   * @return {Function}
   */
  toOnDoubleClick(onClick) {
    let clickCount = 0;
    let timerId = 0;

    return (...args) => {
      if (!clickCount) {
        clickCount = clickCount + 1;

        if (timerId) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
          clickCount = 0;
        }, 350);
        return;
      }

      clickCount = 0;
      d3.event.preventDefault();
      onClick(...args);
    };
  }

  getTranslation() {
    return {};
  }
}

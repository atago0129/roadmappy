import {PluginInterface} from "./PluginInterface";
import * as d3 from 'd3';
import ContextMenu from 'd3-v4-contextmenu';

export class CanvasContextMenu extends PluginInterface{
  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;

    roadmappy.on('contextmenu:canvas', this._contextMenu.bind(this));
  }

  _contextMenu(mousePos) {
    console.log(mousePos);
    d3.event.preventDefault();
    const contextMenu = new ContextMenu([
      {
        label: 'copy to json data to clip board.',
        cb: this._copyToClipBoard.bind(this)
      }
    ]);
    contextMenu.show(this.roadmappy.canvas.svg, mousePos[0], mousePos[1]);
  }

  _copyToClipBoard() {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.setAttribute('id', 'copy-dummy');
    document.getElementById('copy-dummy').value = JSON.stringify(this.roadmappy.roadmap.toAssoc(), null, 2);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }
}
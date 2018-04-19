import {PluginInterface} from "../PluginInterface";
import D3V4ContextMenu from '@atago0129/d3-v4-contextmenu';
import * as d3 from "d3";

export class ContextMenuPlugin extends PluginInterface {

  /**
   * {ContextMenuItemInterface[]}
   */
  items;

  initialize(roadmappy) {
    this.roadmappy = roadmappy;
    if (this.items.length > 0) {
      this.items.map((item) => item.initialize(roadmappy));
      const contextMenu = new D3V4ContextMenu(roadmappy.canvas.svg, this.items);
      roadmappy.canvas.on('contextmenu:canvas', (mousePos) => {
        d3.event.preventDefault();
        contextMenu.show(mousePos[0], mousePos[1]);
      });
    }
  }

  /**
   * @param {ContextMenuItemInterface[]} items
   */
  setItems(items) {
    this.items = items;
  }

}

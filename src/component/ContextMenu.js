import * as d3 from "d3";

export default class ConetextMenu {
  menuItems = [];

  width;
  height;

  margin = 0.1;

  style = {
    'rect': {
      'mouseout': {
        'fill': 'rgb(244,244,244)',
        'stroke': 'white',
        'stroke-width': '1px'
      },
      'mouseover': {
        'fill': 'rgb(200,200,200)'
      }
    },
    'text': {
      'fill': 'steelblue',
      'font-size': '13'
    }
  };

  constructor(menuItems, menuWidth, menuHeight) {
    this.menuItems = menuItems;
    this.width = menuWidth;
    this.height = menuHeight;
  }

  show(canvas, x, y) {
    let _this = this;

    d3.select(".context-menu").remove();

    canvas.append("g").attr("class", "context-menu");
    let contextMenu = d3.select(".context-menu").selectAll("g").data(this.menuItems);
    let contextItems = contextMenu.enter().append("g").attr("class", "menu-entry");
    contextItems.style("cursor", "pointer");
    contextItems.on("mouseover", function(){
      d3.select(this).select('rect').style("fill", "rgb(200,200,200)");
    });
    contextItems.on("mouseout", function(){
      let rect = d3.select(this).select('rect');
      rect.style("fill", "rgb(250,250,250)");
      rect.style("stroke", "rgb(0,0,0)");
      rect.style("stroke-width", "1px");
    });

    contextItems.append("rect")
      .attr("x", x)
      .attr('y', function(d, i){return y + (i * _this.height);})
      .attr('width', this.width)
      .attr('height', this.height)
      .style(this.style.rect.mouseout);

    contextItems.append("text")
      .text(function (d) {
        return d;
      })
      .attr('x', x)
      .attr('y', function(d, i){ return y + (i * _this.height); })
      .attr('dy', this.height - this.margin / 2)
      .attr('dx', this.margin)
      .style(this.style.text);

    // Other interactions
    d3.select('body')
      .on('click', function() {
        d3.select('.context-menu').remove();
      });
  }
}
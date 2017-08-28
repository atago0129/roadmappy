const ONE_DAY = 1000 * 60 * 60 * 24;

export class RoadmapTask {
  id;
  name;
  storyId;
  assigneeIds = [];
  color;
  order;
  involvement;

  /**
   * @private
   */
  _from;

  /**
   * @private
   */
  _to;

  /**
   * @param {number|string} id
   * @param {string} name
   * @param {number|string|null} storyId
   * @param {number|string|null} assigneeIds
   * @param {string|null} color
   * @param {number} order
   * @param {string|number|Date} from
   * @param {string|number|Date} to
   * @param {number} involvement
   */
  constructor(id, name, storyId, assigneeIds, color, order, from, to, involvement) {
    this.id = id;
    this.name = name;
    this.storyId = storyId;
    this.assigneeIds = [].concat(assigneeIds || []);
    this.color = color || '#4286f4';
    this.order = parseInt(order);
    this.involvement = Math.min(parseInt(involvement), 100);
    this._from = new Date(from);
    this._to = new Date(new Date(to).setHours((new Date(to).getHours() + 24)));
    this.from = this._from;
    this.to = this._to;
  }

  get from() {
    return this._from;
  }

  get to() {
    return this._to;
  }

  set from(from) {
    from = this._fixDate(from);
    if ((from.getTime() - this.to.getTime()) > -ONE_DAY) {
      this._to = new Date(from.getTime() + ONE_DAY);
    }
    this._from = from;
  }

  set to(to) {
    to = this._fixDate(to);
    if ((this.from.getTime() - to.getTime()) > -ONE_DAY) {
      this._from = new Date(to.getTime() - ONE_DAY);
    }
    this._to = to;
  }

  _fixDate(date) {
    return new Date(date.getTime() - (date.getTime() % ONE_DAY));
  }

  /**
   * @param {object} assoc
   */
  merge(assoc) {
    for (const name in assoc) {
      switch (name) {
        case 'assigneeIds':
          this[name] = [].concat(assoc[name] || []).map((id) => parseInt(id, 10));
          break;
        default:
          this[name] = assoc[name];
          break;
      }
    }
  }

  /**
   * @returns {{id: number|string, name: string, from: string, to: string, color: string, story: number|string, assignee: number[]|string[], involvement: number}}
   */
  toAssoc() {
    return {
      'id': this.id,
      'name': this.name,
      'from': this._from.toISOString(),
      'to': this._to.toISOString(),
      'color': this.color,
      'storyId': this.storyId,
      'assigneeIds': this.assigneeIds,
      'involvement': this.involvement
    };
  }

}


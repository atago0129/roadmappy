import {PluginInterface} from "./PluginInterface";
import * as d3 from 'd3';
import template from 'lodash.template';
import getFormData from 'get-form-data';
import './ClickableTaskLabelPlugin.css';

export class ClickableTaskLabelPlugin extends PluginInterface {

  doubleClickTimerId;
  clickCount = 0;

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;
    this.form = document.createElement('form');
    this.form.setAttribute('class', 'ClickableTaskLabelPlugin-form');
    this.form.addEventListener('submit', this._onSubmit);
    this.form.addEventListener('click', this._onClick);
    roadmappy.on('click:task-label', this.toOnDoubleClick(this._onTaskLabelDoubleClick));
  }

  /**
   * @param {RoadmapTask} task
   * @param {Selection} labelNode
   */
  _onTaskLabelDoubleClick = (task, labelNode) => {
    this._initializeForm(task);
    this.roadmappy.canvas.element.node().appendChild(this.form);
  };

  /**
   * @param {RoadmapTask} task
   */
  _initializeForm(task) {
    this.form.innerHTML = template(`
      <input type="hidden" name="id" value="<%= task.id %>">
      <div>
        <label>
          <span>name</span>
          <input type="text" name="name" value="<%= task.name  %>">
        </label>
      </div>
      <div>
        <label>
          <span>story</span>
          <select name="storyId">
            <% for (const s of stories) { %>
            <option value="<%= s.id %>"<%= task.storyId === s.id ? " selected": "" %>><%= s.name %></option>
            <% } %>
          </select>
        </label>
      </div>
      <div>
        <label>
          <span>assignee</span>
          <select name="assigneeIds" multiple="true">
            <% for (const a of assignees) { %>
            <option value="<%= a.id %>"<%= task.assigneeIds.indexOf(a.id) >= 0 ? " selected": "" %>><%= a.name %></option>
            <% } %>
          </select>
        </label>
      </div>
      <div>
        <label>
          <span>color</span>
          <input type="color" name="color" value="<%= task.color  %>">
        </label>
      </div>
      <div>
        <input type="submit" value="Save" data-button-type="save">
        /
        <input type="submit" value="Delete" data-button-type="delete">
        /
        <input type="submit" value="Cancel" data-button-type="cancel">
      </div>
    `)({
      task: task.toAssoc(),
      stories: this.roadmappy.roadmap.getStories().map(s => s.toAssoc()),
      assignees: this.roadmappy.roadmap.getAssignees().map(a => a.toAssoc()),
    });
  }

  /**
   * @param {Event} e
   */
  _onSubmit = e => {
    e.preventDefault();
  };

  /**
   * @param {Event} e
   */
  _onClick = e => {
    const name = e.target.getAttribute('data-button-type');
    switch (name) {
      case 'save': {
        const assoc = getFormData(this.form);
        assoc.id = parseInt(assoc.id, 10);
        const task = this.roadmappy.roadmap.getTaskById(assoc.id);
        task.merge(assoc);
        this.roadmappy.render();
        this.form.parentElement.removeChild(this.form);
        break;
      }
      case 'delete': {
        const assoc = getFormData(this.form);
        assoc.id = parseInt(assoc.id, 10);
        this.roadmappy.roadmap.removeTaskById(assoc.id);
        this.roadmappy.render();
        this.form.parentElement.removeChild(this.form);
        break;
      }
      case 'cancel': {
        this.form.parentElement.removeChild(this.form);
        break;
      }
    }
  };

}

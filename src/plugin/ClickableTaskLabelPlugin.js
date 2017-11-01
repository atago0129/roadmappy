import {PluginInterface} from "./PluginInterface";
import template from 'lodash.template';
import getFormData from 'get-form-data';
import './ClickableTaskLabelPlugin.css';

export class ClickableTaskLabelPlugin extends PluginInterface {

  currentTask;

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
    this.currentTask = task;
    this._initializeForm(labelNode);
  };

  /**
   * @param {Selection} labelNode
   */
  _initializeForm(labelNode) {
    const task = this.currentTask;
    if (this.form.parentElement) {
      this.form.parentElement.removeChild(this.form);
    }
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
            <option value="<%= s.id %>"<%= task.storyId == s.id ? ' selected': '' %>><%= s.name %></option>
            <% } %>
          </select>
        </label>
        <span class="ClickableTaskLabelPlugin-form-add-group-button" data-group-type="story">+</span>
      </div>
      <div>
        <label>
          <span>assignee</span>
          <select name="assigneeIds" multiple="true">
            <% for (const a of assignees) { %>
            <option value="<%= a.id %>"<%= task.assigneeIds.indexOf(a.id) >= 0 ? ' selected': '' %>><%= a.name %></option>
            <% } %>
          </select>
        </label>
        <span class="ClickableTaskLabelPlugin-form-add-group-button" data-group-type="assignee">+</span>
      </div>
      <div>
        <label>
          <span>color</span>
          <input type="checkbox"<%= task.color !== null ? ' checked' : '' %> class="ClickableTaskLabelPlugin-form-color-checkbox">
          <input type="color" name="color" value="<%= task.color  %>" class="ClickableTaskLabelPlugin-form-color-input"<%= task.color === null ? ' disabled style="display:none"' : '' %>>
        </label>
      </div>
      <div>
        <label>
          <span>from</span>
          <input type="date" name="from" value="<%= task.from  %>">
        </label>
      </div>
      <div>
        <label>
          <span>to</span>
          <input type="date" name="to" value="<%= task.to  %>">
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

    // display in right down of the task
    const taskLabelRect = labelNode.getBoundingClientRect();
    const canvasRect = this.roadmappy.canvas.element.node().getBoundingClientRect();
    this.form.style.left = `${taskLabelRect.x + taskLabelRect.width - canvasRect.x}px`;
    this.form.style.top = `${taskLabelRect.y + taskLabelRect.height - canvasRect.y}px`;

    this.roadmappy.canvas.element.node().appendChild(this.form);

    this.form.querySelector('.ClickableTaskLabelPlugin-form-color-checkbox').removeEventListener('click', this._onClickColorSelect);
    this.form.querySelector('.ClickableTaskLabelPlugin-form-color-checkbox').addEventListener('click', this._onClickColorSelect);
    this.form.querySelectorAll('.ClickableTaskLabelPlugin-form-add-group-button').forEach((elm) => elm.removeEventListener('click', this._onClickAddGroupButton));
    this.form.querySelectorAll('.ClickableTaskLabelPlugin-form-add-group-button').forEach((elm) => elm.addEventListener('click', this._onClickAddGroupButton));
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
        if (!assoc.hasOwnProperty('color')) assoc['color'] = null;
        console.log(assoc);
        const task = this.roadmappy.roadmap.getTaskById(assoc.id);
        task.merge(assoc);
        this.roadmappy.render();
        this.form.parentElement.removeChild(this.form);
        this.currentTask = null;
        break;
      }
      case 'delete': {
        const assoc = getFormData(this.form);
        assoc.id = parseInt(assoc.id, 10);
        this.roadmappy.roadmap.removeTaskById(assoc.id);
        this.roadmappy.render();
        this.form.parentElement.removeChild(this.form);
        this.currentTask = null;
        break;
      }
      case 'cancel': {
        this.form.parentElement.removeChild(this.form);
        this.currentTask = null;
        break;
      }
    }
  };

  /**
   * @param {Event} e
   */
  _onClickColorSelect = e => {
    const colorInput = this.form.querySelector('.ClickableTaskLabelPlugin-form-color-input');
    if (e.target.checked) {
      colorInput.style.display = '';
      colorInput.removeAttribute('disabled');
    } else {
      colorInput.style.display = 'none';
      colorInput.setAttribute('disabled', 'true');
    }
  };

  _onClickAddGroupButton = e => {
    const type = e.target.getAttribute('data-group-type');
    const groupName = window.prompt('enter ' + type + ' name');
    if (groupName === '') return;
    this.roadmappy.roadmap.addNewGroup(groupName, type);
    this._initializeForm();
  }

}

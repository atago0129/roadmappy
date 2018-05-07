import { PluginInterface } from '../PluginInterface';
import i18next from 'i18next';
import translation from './translation';
import template from 'lodash.template';
import getFormData from 'get-form-data';
import './TaskEditForm.css';
import { AbstractRoadmapGroup } from '../../component/group/AbstractRoadmapGroup';

export class TaskEditFormPlugin extends PluginInterface {
  currentTask;

  /**
   * @param {Roadmappy} roadmappy
   */
  initialize(roadmappy) {
    this.roadmappy = roadmappy;
    this.form = document.createElement('form');
    this.form.setAttribute('class', 'task-edit-form');
    this.form.addEventListener('submit', this._onSubmit);
    this.form.addEventListener('click', this._onClick);
    roadmappy.on('click:task', this.toOnDoubleClick(this._showTaskEditForm));
    roadmappy.on('click:task-label', this.toOnDoubleClick(this._showTaskEditForm));
  }

  getTranslation() {
    return translation;
  }

  /**
   * @param {RoadmapTask} task
   * @param {Selection} labelNode
   * @param {{x,y}} pos
   */
  _showTaskEditForm = (task, labelNode, pos) => {
    this.currentTask = task;
    this._initializeForm(pos);
  };

  /**
   * @param {{x,y}} pos
   */
  _initializeForm(pos) {
    const task = this.currentTask;
    if (this.form.parentElement) {
      this.form.parentElement.removeChild(this.form);
    }
    this.form.innerHTML = template(`
      <input type="hidden" name="id" value="<%= task.id %>">
      <div>
        <label>
          <span><%= i18next.t('Task name') %></span>
          <input type="text" name="name" value="<%= task.name  %>">
        </label>
      </div>
      <div>
        <label>
          <span><%= i18next.t('Story') %></span>
          <select name="storyId">
            <% for (const s of stories) { %>
            <option value="<%= s.id %>"<%= task.storyId == s.id ? ' selected': '' %>><%= s.name %></option>
            <% } %>
          </select>
        </label>
        <span class="task-edit-form-add-group-button" data-group-type="story">+</span>
      </div>
      <div>
        <label>
          <span><%= i18next.t('Assignee') %></span>
          <select name="assigneeIds" multiple="true">
            <% for (const a of assignees) { %>
            <option value="<%= a.id %>"<%= task.assigneeIds.indexOf(a.id) >= 0 ? ' selected': '' %>><%= a.name %></option>
            <% } %>
          </select>
        </label>
        <span class="task-edit-form-add-group-button" data-group-type="assignee">+</span>
      </div>
      <div>
        <label>
          <span><%= i18next.t('Color') %></span>
          <input type="checkbox"<%= task.color !== null ? ' checked' : '' %> class="task-edit-form-color-checkbox">
          <input type="color" name="color" value="<%= task.color  %>" class="task-edit-form-color-input"<%= task.color === null ? ' disabled style="display:none"' : '' %>>
          <div class="task-edit-form-color-all-story" style="display:none"> - <input type="checkbox" name="colorForAllStory"> <%= i18next.t('Applies to all tasks belonging to the same story(Apply when saving)') %></div>
        </label>
      </div>
      <div>
        <label>
          <span><%= i18next.t('From') %></span>
          <input type="date" name="from" value="<%= task.from  %>">
        </label>
      </div>
      <div>
        <label>
          <span><%= i18next.t('To') %></span>
          <input type="date" name="to" value="<%= task.to  %>">
        </label>
      </div>
      <div>
        <input type="submit" value="<%= i18next.t('Save') %>" data-button-type="save">
        /
        <input type="submit" value="<%= i18next.t('Delete') %>" data-button-type="delete">
        /
        <input type="submit" value="<%= i18next.t('Copy') %>" data-button-type="copy">
        /
        <input type="submit" value="<%= i18next.t('Cancel') %>" data-button-type="cancel">
      </div>
    `)({
      task: task.toAssoc(),
      stories: this.roadmappy.roadmap.getStories().map(s => s.toAssoc()),
      assignees: this.roadmappy.roadmap.getAssignees().map(a => a.toAssoc()),
      i18next: i18next
    });

    this.form.style.left = `${pos.x}px`;
    this.form.style.top = `${pos.y}px`;

    this.roadmappy.canvas.element.node().appendChild(this.form);

    this.form.querySelector('.task-edit-form-color-checkbox').removeEventListener('click', this._onClickColorSelect);
    this.form.querySelector('.task-edit-form-color-checkbox').addEventListener('click', this._onClickColorSelect);
    this.form
      .querySelectorAll('.task-edit-form-add-group-button')
      .forEach(elm => elm.removeEventListener('click', this._onClickAddGroupButton));
    this.form
      .querySelectorAll('.task-edit-form-add-group-button')
      .forEach(elm => elm.addEventListener('click', this._onClickAddGroupButton));
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
        assoc.storyId = parseInt(assoc.storyId, 10);
        if (!assoc.hasOwnProperty('color')) assoc['color'] = null;
        if (!assoc.hasOwnProperty('colorForAllStory')) assoc['colorForAllStory'] = 'off';
        const task = this.roadmappy.roadmap.getTaskById(assoc.id);
        task.merge(assoc);
        if (assoc['colorForAllStory'] === 'on') {
          const story = this.roadmappy.roadmap.getStoryById(assoc.storyId);
          this.roadmappy.roadmap.getTasksByGroup(story).map(function(task) {
            task.color = assoc['color'];
            return task;
          });
        }
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
      case 'copy': {
        const assoc = getFormData(this.form);
        assoc.id = parseInt(assoc.id, 10);
        this.roadmappy.roadmap.copyTask(assoc.id);
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
    const colorInput = this.form.querySelector('.task-edit-form-color-input');
    const colorAllGroup = this.form.querySelector('.task-edit-form-color-all-story');
    if (e.target.checked) {
      colorInput.style.display = '';
      colorInput.removeAttribute('disabled');
      colorAllGroup.style.display = '';
    } else {
      colorInput.style.display = 'none';
      colorInput.setAttribute('disabled', 'true');
      colorAllGroup.style.display = 'none';
    }
  };

  _onClickAddGroupButton = e => {
    const type = e.target.getAttribute('data-group-type');
    let message = '';
    if (type === AbstractRoadmapGroup.TYPE.STORY) {
      message = i18next.t('Enter story name.');
    } else {
      message = i18next.t('Enter assignee name.');
    }
    if (message === '') return;
    const groupName = window.prompt(message);
    this.roadmappy.roadmap.addNewGroup(groupName, type);
    this._initializeForm();
  };
}

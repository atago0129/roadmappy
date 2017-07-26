import {Roadmappy} from './Roadmappy';

if (document) {
  var scripts = document.getElementsByTagName('script');
  var current = scripts[scripts.length - 1];
  if (current && current.getAttribute('data-roadmappy')) {
    new Roadmappy(JSON.parse(current.getAttribute('data-roadmappy')));
  }
}

export default Roadmappy;


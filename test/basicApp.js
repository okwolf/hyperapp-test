import { h } from 'hyperapp';

module.exports = {
  init(state, actions) {
    actions.say('nothing');
  },
  actions: {
    say: (state, actions, message) => ({ message })
  },
  view: ({ message }) => h('main', {}, message)
};

import { h } from 'hyperapp';

module.exports = {
  state: {
    message: 'nothing'
  },
  actions: {
    say: (state, actions, message) => ({ message })
  },
  view: ({ message }) => h('main', {}, message)
};

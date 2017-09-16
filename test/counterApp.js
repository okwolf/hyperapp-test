import { h } from 'hyperapp';

export default {
  state: {
    count: 0
  },
  view: (state, actions) =>
    h(
      'main',
      {},
      h('h1', {}, state.count),
      h(
        'button',
        {
          onclick: actions.down,
          disabled: state.count <= 0
        },
        '-'
      ),
      h(
        'button',
        {
          onclick: actions.up
        },
        '+'
      )
    ),
  actions: {
    down: (state, actions, { by = 1 } = {}) => ({ count: state.count - by }),
    up: (state, actions, { by = 1 } = {}) => ({ count: state.count + by })
  }
};

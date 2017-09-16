const { app } = require('hyperapp');

const isFn = value => typeof value === 'function';
const isObj = value => typeof value === 'object';

const test = (
  emit,
  pendingActions = 0,
  tracking = { states: [], actions: [], views: [] },
  events = {}
) => ({
  events: {
    load(state) {
      tracking.states.push(state);
    },
    action(state, actions, action) {
      pendingActions++;
      tracking.actions.push(action);
    },
    resolve(state, actions, result) {
      if (typeof result === 'function') {
        return update =>
          result(result => {
            pendingActions--;
            return update(result);
          });
      } else {
        pendingActions--;
      }
    },
    update(state, actions, nextState) {
      tracking.states.push(nextState);
      if (pendingActions === 0 && isFn(events.update)) {
        events.update(tracking);
      }
    },
    render: (state, actions, view) => (...args) => {
      const nextView = view(...args);
      tracking.views.push(nextView);
      if (pendingActions === 0 && isFn(events.render)) {
        events.render(tracking);
      }
      return nextView;
    },
    testAction: (state, actions, { name, data, eventName }) =>
      new Promise((resolve, reject) => {
        const action = actions[name];
        if (action) {
          events[eventName] = resolve;
          actions[name](data);
        } else {
          reject(`unknown action: ${name}`);
        }
      }),
    resetTracking: state => {
      tracking.states = [state];
      tracking.actions = [];
      tracking.views = [];
      events = {};
    }
  }
});

const testApp = (props, ...tests) => {
  const eventName = isFn(props.view) ? 'render' : 'update';
  const initialState = tests.find(test => !Array.isArray(test));
  const createAppProps = Object.assign({}, props, {
    state: initialState || props.state,
    mixins: [test, ...(props.mixins || [])]
  });
  const emit = app(createAppProps);

  const actionTests = tests.filter(test => Array.isArray(test));
  return actionTests.reduce((actionPromise, [name, ...args]) => {
    const data = args.find(isObj);
    const assertFn = args.find(isFn);
    return actionPromise
      .then(() => emit('testAction', { name, data, eventName }))
      .then(assertFn)
      .then(() => emit('resetTracking'));
  }, Promise.resolve());
};

module.exports = {
  test,
  testApp
};

const { app } = require('hyperapp');

const isFn = value => typeof value === 'function';

const createTestProps = () => ({
  actions: {
    test: {
      run: (state, actions, { eventName, resolve, action, data }) => update => {
        update({ on: { [eventName]: resolve } });
        action(data);
      },
      trackState: ({ states }, actions, nextState) => {
        const nonTestState = Object.assign({}, nextState);
        delete nonTestState.test;
        return {
          states: states.concat(nonTestState)
        };
      },
      startAction: ({ actions, pendingActions }, _, action) => ({
        actions: actions.concat(action),
        pendingActions: pendingActions.concat(action)
      }),
      endAction: ({ pendingActions, on }, actions, action) => update => {
        update({
          pendingActions: pendingActions.filter(
            pendingAction => pendingAction !== action
          )
        });
        return update(updatedState => {
          if (updatedState.pendingActions.length === 0 && isFn(on.update)) {
            on.update(updatedState);
          }
        });
      },
      trackView: ({ views, pendingActions, on }, actions, view) => update => {
        update({
          views: views.concat(view)
        });
        return update(updatedState => {
          if (updatedState.pendingActions.length === 0 && isFn(on.render)) {
            on.render(updatedState);
          }
        });
      },
      reset: ({ states = [] } = {}) => {
        return {
          states: states.slice(-1),
          actions: [],
          pendingActions: [],
          views: [],
          on: {}
        };
      }
    }
  },
  render: render => (state, actions, ...otherArgs) => {
    const renderedView = render(state, actions, ...otherArgs);
    actions.test.trackView(renderedView);
    return renderedView;
  },
  hooks: [
    (state, actions) => {
      const endAction = (action, nextState) => {
        actions.test.trackState(nextState);
        actions.test.endAction(action);
        return nextState;
      };
      actions.test.reset();
      actions.test.trackState(state);
      return action => {
        if (!action.name.startsWith('test')) {
          actions.test.startAction(action);
          return result => {
            if (isFn(result)) {
              return update =>
                result(updatedResult =>
                  update(endAction(action, updatedResult))
                );
            } else {
              return endAction(action, result);
            }
          };
        }
      };
    }
  ]
});

const testApp = (props, ...tests) => {
  const eventName = isFn(props.view) ? 'render' : 'update';
  const initialState = tests.find(test => !Array.isArray(test));
  const testProps = createTestProps();
  const createAppProps = Object.assign(
    {},
    props,
    {
      state: initialState || props.state,
      actions: Object.assign({}, props.actions || {}, testProps.actions),
      hooks: [...(props.hooks || []), ...testProps.hooks]
    },
    props.view && {
      view: testProps.render(props.view)
    }
  );
  const actions = app(createAppProps);

  const actionTests = tests.filter(test => Array.isArray(test));
  return actionTests.reduce((actionPromise, [name, ...args]) => {
    const data = args.find(arg => !isFn(arg));
    const assertFn = args.find(isFn);
    return actionPromise
      .then(
        () =>
          new Promise((resolve, reject) => {
            const action = actions[name];
            if (action) {
              actions.test.run({ eventName, resolve, action, data });
            } else {
              reject(`unknown action: ${name}`);
            }
          })
      )
      .then(assertFn)
      .then(() => actions.test.reset());
  }, Promise.resolve());
};

module.exports = {
  createTestProps,
  testApp
};

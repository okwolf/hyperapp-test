# hyperapp-test

[![Build Status](https://travis-ci.org/okwolf/hyperapp-test.svg?branch=master)](https://travis-ci.org/okwolf/hyperapp-test)
[![Codecov](https://img.shields.io/codecov/c/github/okwolf/hyperapp-test/master.svg)](https://codecov.io/gh/okwolf/hyperapp-test)
[![npm](https://img.shields.io/npm/v/hyperapp-test.svg)](https://www.npmjs.org/package/hyperapp-test)

hyperapp-test is a JavaScript Testing utility for [Hyperapp](https://github.com/hyperapp/hyperapp) that makes it easier to write assertions for app logic related to state changes as a result of actions and the resulting views. This task is complicated by the auto wiring of actions by Hyperapp's state management and the support for asynchronous actions provided by thunks. By providing a low overhead API to solve this, testing app logic can be simple as it would be in [Redux](http://redux.js.org/docs/recipes/WritingTests.html) or [Elm](http://elmprogramming.com/easy-to-test.html).

hyperapp-test is unopinionated regarding which test runner or assertion library you use, and should be compatible with all major test runners and assertion libraries out there.

hyperapp-test is compatible with `Hyperapp 0.13.x` and `Node.js >=4`.

## Setup

Install with npm / Yarn:

```bash
npm i -D hyperapp-test
```

Then in your test files add the following at the top:

```js
const { testApp } = require('hyperapp-test');
```

Or if you are using [Babel](https://babeljs.io) for ES6 module support:

```js
import { testApp } from 'hyperapp-test';
```

## Usage

Assuming we want to test the following basic app:

```jsx
import { h } from 'hyperapp';
/** @jsx h */

const basicApp = {
  state: {
    message: 'nothing'
  },
  actions: {
    say: (state, actions, message) => ({ message })
  },
  view: ({ message }) => <main>{message}</main>
};
```

We want to write a test to verify that the `say` action updates the `state.message` correctly by checking that the before and after states match our expected values.

### Jest

To test this action with [Jest](https://facebook.github.io/jest/docs/en/getting-started.html) we call the handy `testApp` function passing our `basicApp` followed by our test assertions comprised of the name of the action to fire (`say`), the (optional) data to include with the action, and the assertion function that destructures out the `states` our app went through since the last action. The first item in `states` is our before state and the second item is the state after our `say` action. Here is what that test code looks like:

```js
import { testApp } from 'hyperapp-test';

test('a basic app', () =>
  testApp(basicApp, [
    'say',
    'hello',
    ({ states }) => expect(states).toEqual([
      // Before state
      { message: 'nothing' },
      // After state
      { message: 'hello' }
    ])
  ], [
    'say',
    'goodbye',
    ({ states }) => expect(states).toEqual([
      // Before state
      { message: 'hello' },
      // After state
      { message: 'goodbye' }
    ])
  ])
);
```

### Mocha / Chai

The [Mocha](https://mochajs.org) example works very similarly, just with different assertions:

```js
import { expect } from 'chai';
import { testApp } from 'hyperapp-test';

test('a basic app', () =>
  testApp(basicApp, [
    'say',
    'hello',
    ({ states }) => expect(states).to.deep.equal([
      // Before state
      { message: 'nothing' },
      // After state
      { message: 'hello' }
    ])
  ], [
    'say',
    'goodbye',
    ({ states }) => expect(states).to.deep.equal([
      // Before state
      { message: 'hello' },
      // After state
      { message: 'goodbye' }
    ])
  ])
);
```

## API

### `testApp`

A function intended to be called by tests to start a new app, optionally set some intial state, and fire one or more actions with assertions on the results.

The `testApp` function is called with:

- An object of the same shape that would be passed to the `app` function from Hyperapp.
- Optionally an intial state object to override the default state before running any test actions.
- One or more `ActionTest` definitions.

`testApp` returns a promise that resolves when the test successfully completes, and rejects when it fails. Here is the overall shape of `testApp`:

```js
testApp = function(
  app: Hyperapp.App,
  initialState?: object,
  ...tests: ActionTest
): Promise
```

Each `ActionTest` is an array that specifies:

- The name of the action to fire.
- Optionally the data to include with the action.
- An assertion function that receives an object with all the `states`, `actions`, and `views` that have resulted since the last action, or from the creation of the app if no prior actions.

This is the shape of each `ActionTest`:

```js
ActionTest = [
  actionName: string,
  actionData?: any,
  assertion: function({
    states: object[],
    actions: object[],
    views: VirtualNode[]
  })
]
```

To verify the views were rendered correctly, compare expected `VirtualNode`s with the actual results:

```jsx
import { h } from 'hyperapp';
import { testApp } from 'hyperapp-test';
/** @jsx h */

test('a basic app renders the right view', () =>
  testApp(basicApp, [
    'say',
    'hello',
    ({ views }) => expect(views).toEqual([
      <main>hello</main>
    ])
  ])
);
```

### `createTestProps`

A function that creates `props` used internally by hyperapp-test for tracking the last `states`, `actions`, and `views`. This is also responsible for firing the test actions and calling our assertion functions when the processing of the action is complete. Unless you are building your own reusable test library, you probably want to use `testApp` instead of this.

## License

hyperapp-test is MIT licensed. See [LICENSE](LICENSE.md).

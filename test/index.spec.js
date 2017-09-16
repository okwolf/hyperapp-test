import { app, h } from 'hyperapp';
import { testApp } from '../src';
import counterApp from './counterApp';

window.requestAnimationFrame = process.nextTick;

describe('testApp', () => {
  describe('without a view', () => {
    it('should handle hello world', () =>
      testApp(
        {
          actions: {
            hello: () => ({ message: 'hello world' })
          }
        },
        [
          'hello',
          ({ states, actions }) => {
            expect(states).toEqual([{}, { message: 'hello world' }]);
            expect(actions).toEqual([{ name: 'hello' }]);
          }
        ]
      ));
    it('should error for unknown actions', () =>
      expect(testApp({}, ['wrong'])).rejects.toEqual('unknown action: wrong'));
    it('should handle initial state and actions with or without data', () =>
      testApp(
        {
          actions: {
            inc: (state, actions, { by = 1 } = {}) => ({
              count: state.count + by
            })
          }
        },
        { count: 2 },
        [
          'inc',
          ({ states }) => expect(states).toEqual([{ count: 2 }, { count: 3 }])
        ],
        [
          'inc',
          { by: 2 },
          ({ states }) => expect(states).toEqual([{ count: 3 }, { count: 5 }])
        ]
      ));
    it('should handle async', () =>
      testApp(
        {
          state: {
            done: false
          },
          actions: {
            async: () => update =>
              process.nextTick(() => update({ done: true }))
          }
        },
        [
          'async',
          ({ states }) =>
            expect(states).toEqual([{ done: false }, { done: true }])
        ]
      ));
  });
  describe('with a view', () => {
    it('should handle hello world', () =>
      testApp(
        {
          actions: {
            hello: () => ({ message: 'hello world' })
          },
          view: ({ message }) => h('main', {}, message)
        },
        [
          'hello',
          ({ states, actions, views }) => {
            expect(states).toEqual([{}, { message: 'hello world' }]);
            expect(actions).toEqual([{ name: 'hello' }]);
            expect(views).toEqual([h('main', {}, 'hello world')]);
          }
        ]
      ));
    it('should error for unknown actions', () =>
      expect(testApp(counterApp, ['wrong'])).rejects.toEqual(
        'unknown action: wrong'
      ));
    it('should handle initial state and actions with or without data', () =>
      testApp(
        counterApp,
        { count: 5 },
        [
          'up',
          ({ states }) => expect(states).toEqual([{ count: 5 }, { count: 6 }])
        ],
        [
          'down',
          ({ states }) => expect(states).toEqual([{ count: 6 }, { count: 5 }])
        ],
        [
          'up',
          { by: 2 },
          ({ states }) => expect(states).toEqual([{ count: 5 }, { count: 7 }])
        ],
        [
          'down',
          { by: 3 },
          ({ states }) => expect(states).toEqual([{ count: 7 }, { count: 4 }])
        ]
      ));
    it('should handle async', () =>
      testApp(
        {
          state: {
            done: false
          },
          actions: {
            async: () => update =>
              process.nextTick(() => update({ done: true }))
          },
          view: state => h('h1', {}, state.done)
        },
        [
          'async',
          ({ states }) =>
            expect(states).toEqual([{ done: false }, { done: true }])
        ]
      ));
  });
});

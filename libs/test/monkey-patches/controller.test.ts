import { test, expect } from 'vitest'
import {
  CreateTinyShieldController,
  EnableTinyShield,
  type TinyShieldWindow
} from '@filteringdev/tinyshield-lib'

function CreateTestWindow(): TinyShieldWindow {
  class TestFunction extends Function {}
  class TestMap<Key, Value> extends Map<Key, Value> {}
  class TestWeakMap<Key extends object, Value> extends WeakMap<Key, Value> {}

  const TestSetTimeout = (() => 1) as unknown as typeof globalThis.setTimeout
  const TestSetInterval = (() => 1) as unknown as typeof globalThis.setInterval

  return {
    RegExp,
    Array,
    String,
    Object,
    Function: TestFunction as unknown as FunctionConstructor,
    Map: TestMap as unknown as MapConstructor,
    WeakMap: TestWeakMap as unknown as WeakMapConstructor,
    setTimeout: TestSetTimeout,
    setInterval: TestSetInterval
  }
}

test('EnableTinyShield installs wrappers only once for the same window', () => {
  const TestWindow = CreateTestWindow()

  const FirstController = EnableTinyShield({ Window: TestWindow })
  const FirstMapGet = TestWindow.Map.prototype.get
  const SecondController = EnableTinyShield({ Window: TestWindow })

  expect(FirstController.IsEnabled()).toBe(true)
  expect(SecondController.IsEnabled()).toBe(true)
  expect(TestWindow.Map.prototype.get).toBe(FirstMapGet)
})

test('Disable turns off behavior without restoring the installed wrapper', () => {
  const TestWindow = CreateTestWindow()
  const OriginalMapGet = TestWindow.Map.prototype.get
  const Controller = CreateTinyShieldController({ Window: TestWindow, PatchIds: ['MapGet'] })

  Controller.Enable()
  const WrappedMapGet = TestWindow.Map.prototype.get
  Controller.Disable()

  const MapInstance = new TestWindow.Map<string, string>([['Key', 'Value']])

  expect(WrappedMapGet).not.toBe(OriginalMapGet)
  expect(TestWindow.Map.prototype.get).toBe(WrappedMapGet)
  expect(Controller.IsEnabled('MapGet')).toBe(false)
  expect(MapInstance.get('Key')).toBe('Value')
})

test('Controller can enable and disable a selected patch subset', () => {
  const TestWindow = CreateTestWindow()
  const Controller = CreateTinyShieldController({ Window: TestWindow, PatchIds: ['SetTimeout'] })

  Controller.Enable()

  expect(Controller.IsEnabled('SetTimeout')).toBe(true)
  expect(Controller.IsEnabled('SetInterval')).toBe(false)

  Controller.Disable()

  expect(Controller.IsEnabled('SetTimeout')).toBe(false)
})

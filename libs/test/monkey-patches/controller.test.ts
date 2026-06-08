import Test from 'ava'
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

Test('EnableTinyShield installs wrappers only once for the same window', T => {
  const TestWindow = CreateTestWindow()

  const FirstController = EnableTinyShield({ Window: TestWindow })
  const FirstMapGet = TestWindow.Map.prototype.get
  const SecondController = EnableTinyShield({ Window: TestWindow })

  T.true(FirstController.IsEnabled())
  T.true(SecondController.IsEnabled())
  T.is(TestWindow.Map.prototype.get, FirstMapGet)
})

Test('Disable turns off behavior without restoring the installed wrapper', T => {
  const TestWindow = CreateTestWindow()
  const OriginalMapGet = TestWindow.Map.prototype.get
  const Controller = CreateTinyShieldController({ Window: TestWindow, PatchIds: ['MapGet'] })

  Controller.Enable()
  const WrappedMapGet = TestWindow.Map.prototype.get
  Controller.Disable()

  const MapInstance = new TestWindow.Map<string, string>([['Key', 'Value']])

  T.not(WrappedMapGet, OriginalMapGet)
  T.is(TestWindow.Map.prototype.get, WrappedMapGet)
  T.false(Controller.IsEnabled('MapGet'))
  T.is(MapInstance.get('Key'), 'Value')
})

Test('Controller can enable and disable a selected patch subset', T => {
  const TestWindow = CreateTestWindow()
  const Controller = CreateTinyShieldController({ Window: TestWindow, PatchIds: ['SetTimeout'] })

  Controller.Enable()

  T.true(Controller.IsEnabled('SetTimeout'))
  T.false(Controller.IsEnabled('SetInterval'))

  Controller.Disable()

  T.false(Controller.IsEnabled('SetTimeout'))
})

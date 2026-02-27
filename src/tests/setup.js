// src/tests/setup.js
import { config } from '@vue/test-utils'
import { expect, vi } from 'vitest'

// Глобальные моки
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Мок для BX24
global.BX24 = {
  callMethod: vi.fn()
}

// Мок для sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}
global.sessionStorage = sessionStorageMock

// Мок для localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Мок для Vuetify компонентов
config.global.stubs = {
  'v-app': true,
  'v-main': true,
  'v-container': true,
  'v-stepper': true,
  'v-card': true,
  'v-card-text': true,
  'v-card-title': true,
  'v-autocomplete': true,
  'v-textarea': true,
  'v-text-field': true,
  'v-file-input': true,
  'v-radio-group': true,
  'v-radio': true,
  'v-select': true,
  'v-btn': true,
  'v-dialog': true,
  'v-list': true,
  'v-list-item': true,
  'v-chip': true,
  'v-progress-circular': true,
  'v-data-table': true,
  'v-icon': true,
  'v-spacer': true,
  'v-row': true,
  'v-col': true,
  'TheForm': true
}
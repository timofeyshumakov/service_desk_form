// tests/unit/Home.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Home from '@/pages/Home.vue'

// Моки для BX24 и других зависимостей
vi.stubGlobal('BX24', {
  callMethod: vi.fn()
})

// Мок для moment
vi.mock('moment', () => ({
  default: () => ({
    format: () => '01.01.2024',
    diff: () => 3600000
  })
}))

// Мок для XLSX
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(),
    json_to_sheet: vi.fn(),
    book_append_sheet: vi.fn(),
    decode_range: vi.fn(() => ({ s: { r: 0 }, e: { r: 0 } })),
    encode_cell: vi.fn()
  },
  writeFile: vi.fn()
}))

describe('Home.vue - Подсветка обязательных полей', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Home, {
      global: {
        stubs: {
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
          'TheForm': true
        }
      }
    })
  })

  describe('Шаг 1 - Основные поля', () => {
    it('должен подсветить поле "Направление" при нажатии на кнопку "Продолжить", если оно не заполнено', async () => {
      // Устанавливаем step = 1
      wrapper.vm.step = 1
      
      // Проверяем, что поле direction не подсвечено изначально
      expect(wrapper.vm.touchedFields.direction).toBe(false)
      
      // Вызываем метод goNextStep (имитируем нажатие на кнопку)
      wrapper.vm.goNextStep()
      
      // Проверяем, что поле direction стало "тронутым"
      expect(wrapper.vm.touchedFields.direction).toBe(true)
      
      // Проверяем, что валидация не пройдена (поле пустое)
      expect(wrapper.vm.isNextStepAvailable).toBe(false)
    })

    it('должен подсветить поле "Тип заявки" при выборе направления "1С" и нажатии на кнопку "Продолжить"', async () => {
      wrapper.vm.step = 1
      
      // Выбираем направление 1С
      wrapper.vm.form.direction = '1С'
      
      // Проверяем, что поле requestType не подсвечено изначально
      expect(wrapper.vm.touchedFields.requestType).toBe(false)
      
      // Нажимаем кнопку "Продолжить"
      wrapper.vm.goNextStep()
      
      // Проверяем, что поле requestType стало "тронутым"
      expect(wrapper.vm.touchedFields.requestType).toBe(true)
      
      // Проверяем, что валидация не пройдена
      expect(wrapper.vm.isNextStepAvailable).toBe(false)
    })

    it('должен подсветить поле "Описание" при выборе направления "1С" и нажатии на кнопку "Продолжить"', async () => {
      wrapper.vm.step = 1
      
      wrapper.vm.form.direction = '1С'
      
      expect(wrapper.vm.touchedFields.description).toBe(false)
      
      wrapper.vm.goNextStep()
      
      expect(wrapper.vm.touchedFields.description).toBe(true)
    })

    it('НЕ должен подсвечивать поля, если они заполнены, при нажатии на кнопку "Продолжить"', async () => {
      wrapper.vm.step = 1
      
      // Заполняем обязательные поля
      wrapper.vm.form.direction = '1С'
      wrapper.vm.form.requestType = 'Не работает / Сломалось'
      wrapper.vm.form.description = 'Тестовое описание'
      
      // Сохраняем состояние touchedFields до нажатия
      const beforeTouch = { ...wrapper.vm.touchedFields }
      
      wrapper.vm.goNextStep()
      
      // Проверяем, что поля не стали "тронутыми" (так как валидация прошла успешно)
      expect(wrapper.vm.touchedFields.direction).toBe(beforeTouch.direction)
      expect(wrapper.vm.touchedFields.requestType).toBe(beforeTouch.requestType)
      expect(wrapper.vm.touchedFields.description).toBe(beforeTouch.description)
      
      // Проверяем, что шаг изменился на 2
      expect(wrapper.vm.step).toBe(2)
    })
  })

  describe('Шаг 2 - Дополнительные вопросы', () => {
    beforeEach(() => {
      // Устанавливаем шаг 2 и необходимые данные
      wrapper.vm.step = 2
      wrapper.vm.form.direction = '1С'
    })

    describe('Тип заявки: "Не работает / Сломалось"', () => {
      beforeEach(() => {
        wrapper.vm.form.requestType = 'Не работает / Сломалось'
      })

      it('должен подсветить radio-group "Остановлена ли работа?" при нажатии на кнопку "создать заявку"', async () => {
        expect(wrapper.vm.touchedFields.workStopped).toBe(false)
        
        wrapper.vm.completeStepper()
        
        expect(wrapper.vm.touchedFields.workStopped).toBe(true)
      })

      it('должен подсветить поле "Текст ошибки" при нажатии на кнопку "создать заявку"', async () => {
        expect(wrapper.vm.touchedFields.errorText).toBe(false)
        
        wrapper.vm.completeStepper()
        
        expect(wrapper.vm.touchedFields.errorText).toBe(true)
      })

      it('должен подсветить поле "Обходной путь" при нажатии на кнопку "создать заявку"', async () => {
        expect(wrapper.vm.touchedFields.workaround).toBe(false)
        
        wrapper.vm.completeStepper()
        
        expect(wrapper.vm.touchedFields.workaround).toBe(true)
      })

      it('НЕ должен подсвечивать поля, если они заполнены', async () => {
        // Заполняем обязательные поля
        wrapper.vm.questions.workStopped = true
        wrapper.vm.questions.errorText = 'Текст ошибки'
        wrapper.vm.questions.workaround = 'Обходной путь'
        
        const beforeTouch = { ...wrapper.vm.touchedFields }
        
        await wrapper.vm.completeStepper()
        
        // Проверяем, что поля не стали "тронутыми"
        expect(wrapper.vm.touchedFields.workStopped).toBe(beforeTouch.workStopped)
        expect(wrapper.vm.touchedFields.errorText).toBe(beforeTouch.errorText)
        expect(wrapper.vm.touchedFields.workaround).toBe(beforeTouch.workaround)
      })
    })

    describe('Тип заявки: "Нужно изменить или доработать"', () => {
      beforeEach(() => {
        wrapper.vm.form.requestType = 'Нужно изменить или доработать'
      })

      const fields = [
        'currentSituation',
        'expectedResult',
        'businessGoal',
        'location',
        'criticality',
        'desiredDate',
        'desiredDateReason'
      ]

      fields.forEach(field => {
        it(`должен подсветить поле "${field}" при нажатии на кнопку "создать заявку"`, async () => {
          expect(wrapper.vm.touchedFields[field]).toBe(false)
          
          wrapper.vm.completeStepper()
          
          expect(wrapper.vm.touchedFields[field]).toBe(true)
        })
      })

      it('НЕ должен подсвечивать поля, если они заполнены', async () => {
        // Заполняем все обязательные поля
        wrapper.vm.questions.currentSituation = 'Текущая ситуация'
        wrapper.vm.questions.expectedResult = 'Ожидаемый результат'
        wrapper.vm.questions.businessGoal = 'Бизнес-цель'
        wrapper.vm.questions.location = 'Место'
        wrapper.vm.questions.criticality = 'Блокирует'
        wrapper.vm.questions.desiredDate = '2024-12-31'
        wrapper.vm.questions.desiredDateReason = 'Причина'
        
        const beforeTouch = { ...wrapper.vm.touchedFields }
        
        await wrapper.vm.completeStepper()
        
        // Проверяем, что поля не стали "тронутыми"
        fields.forEach(field => {
          expect(wrapper.vm.touchedFields[field]).toBe(beforeTouch[field])
        })
      })
    })

    describe('Тип заявки: "Корректировка данных / Консультация"', () => {
      beforeEach(() => {
        wrapper.vm.form.requestType = 'Корреĸтировĸа данных / Консультация'
      })

      it('должен подсветить поле "Выберите тип" при нажатии на кнопку "создать заявку"', async () => {
        expect(wrapper.vm.touchedFields.subType).toBe(false)
        
        wrapper.vm.completeStepper()
        
        expect(wrapper.vm.touchedFields.subType).toBe(true)
      })

      describe('Подтип: "Очистка/корректировка данных"', () => {
        beforeEach(() => {
          wrapper.vm.questions.subType = 'Очистĸа/ĸорреĸтировĸа данных'
        })

        const fields = [
          'whatDataIsWrong',
          'whereDataLocated',
          'correctionReason',
          'correctResult'
        ]

        fields.forEach(field => {
          it(`должен подсветить поле "${field}" при нажатии на кнопку "создать заявку"`, async () => {
            expect(wrapper.vm.touchedFields[field]).toBe(false)
            
            wrapper.vm.completeStepper()
            
            expect(wrapper.vm.touchedFields[field]).toBe(true)
          })
        })
      })

      describe('Подтип: "Консультация"', () => {
        beforeEach(() => {
          wrapper.vm.questions.subType = 'Консультация'
        })

        const fields = [
          'consultationLocation',
          'alreadyTried'
        ]

        fields.forEach(field => {
          it(`должен подсветить поле "${field}" при нажатии на кнопку "создать заявку"`, async () => {
            expect(wrapper.vm.touchedFields[field]).toBe(false)
            
            wrapper.vm.completeStepper()
            
            expect(wrapper.vm.touchedFields[field]).toBe(true)
          })
        })
      })
    })

    describe('Тип заявки: "Нужен доступ"', () => {
      beforeEach(() => {
        wrapper.vm.form.requestType = 'Нужен доступ'
      })

      it('должен подсветить radio-group "Остановлена ли работа?" при нажатии на кнопку "создать заявку"', async () => {
        expect(wrapper.vm.touchedFields.workStopped).toBe(false)
        
        wrapper.vm.completeStepper()
        
        expect(wrapper.vm.touchedFields.workStopped).toBe(true)
      })

      it('должен подсветить поле "Текст ошибки" при нажатии на кнопку "создать заявку"', async () => {
        expect(wrapper.vm.touchedFields.errorText).toBe(false)
        
        wrapper.vm.completeStepper()
        
        expect(wrapper.vm.touchedFields.errorText).toBe(true)
      })

      it('должен подсветить поле "Обходной путь" при нажатии на кнопку "создать заявку"', async () => {
        expect(wrapper.vm.touchedFields.workaround).toBe(false)
        
        wrapper.vm.completeStepper()
        
        expect(wrapper.vm.touchedFields.workaround).toBe(true)
      })
    })
  })

  describe('Интеграционные тесты', () => {
    it('должен последовательно подсвечивать поля на обоих шагах при попытке создать заявку без заполнения', async () => {
      wrapper.vm.step = 1
      
      // Шаг 1: пытаемся перейти без заполнения
      wrapper.vm.goNextStep()
      
      // Проверяем подсветку на шаге 1
      expect(wrapper.vm.touchedFields.direction).toBe(true)
      expect(wrapper.vm.step).toBe(1) // Шаг не должен измениться
      
      // Заполняем шаг 1
      wrapper.vm.form.direction = '1С'
      wrapper.vm.form.requestType = 'Не работает / Сломалось'
      wrapper.vm.form.description = 'Тестовое описание'
      
      // Переходим на шаг 2
      wrapper.vm.goNextStep()
      expect(wrapper.vm.step).toBe(2)
      
      // На шаге 2 пытаемся создать заявку без заполнения
      wrapper.vm.completeStepper()
      
      // Проверяем подсветку на шаге 2
      expect(wrapper.vm.touchedFields.workStopped).toBe(true)
      expect(wrapper.vm.touchedFields.errorText).toBe(true)
      expect(wrapper.vm.touchedFields.workaround).toBe(true)
      
      // successDialog не должен открыться
      expect(wrapper.vm.successDialog).toBe(false)
    })

    it('должен успешно создать заявку при заполнении всех полей', async () => {

      // Заполняем шаг 1
      wrapper.vm.form.direction = '1С'
      wrapper.vm.form.requestType = 'Не работает / Сломалось'
      wrapper.vm.form.description = 'Тестовое описание'
      wrapper.vm.goNextStep()
      
      // Заполняем шаг 2
      wrapper.vm.questions.workStopped = true
      wrapper.vm.questions.errorText = 'Текст ошибки'
      wrapper.vm.questions.workaround = 'Обходной путь'
      
      // Создаем заявку
      await wrapper.vm.completeStepper()
      
      // Проверяем, что successDialog открылся
      expect(wrapper.vm.successDialog).toBe(true)
    })
  })
})

// Тесты для вычисляемых свойств
describe('Home.vue - Вычисляемые свойства валидации', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Home, {
      global: {
        stubs: {
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
          'TheForm': true
        }
      }
    })
  })

  describe('isNextStepAvailable', () => {
    it('должен возвращать false, если направление не выбрано', () => {
      wrapper.vm.form.direction = null
      expect(wrapper.vm.isNextStepAvailable).toBe(false)
    })

    it('должен возвращать false для направления "1С" без типа заявки и описания', () => {
      wrapper.vm.form.direction = '1С'
      wrapper.vm.form.requestType = null
      wrapper.vm.form.description = ''
      expect(wrapper.vm.isNextStepAvailable).toBe(false)
    })

    it('должен возвращать true для направления "1С" с типом заявки и описанием', () => {
      wrapper.vm.form.direction = '1С'
      wrapper.vm.form.requestType = 'Не работает / Сломалось'
      wrapper.vm.form.description = 'Описание'
      expect(wrapper.vm.isNextStepAvailable).toBe(true)
    })

    it('должен возвращать false для направления "ИТ" без категории', () => {
      wrapper.vm.form.direction = 'ИТ'
      wrapper.vm.form.category = null
      expect(wrapper.vm.isNextStepAvailable).toBe(false)
    })

    it('должен возвращать true для направления "ИТ" с категорией', () => {
      wrapper.vm.form.direction = 'ИТ'
      wrapper.vm.form.category = '[ИТ]: Рабочее место'
      expect(wrapper.vm.isNextStepAvailable).toBe(true)
    })
  })

  describe('isValid (валидация второго шага)', () => {
    beforeEach(() => {
      wrapper.vm.form.direction = '1С'
    })

    it('должен возвращать false для типа "Не работает / Сломалось" без заполненных полей', () => {
      wrapper.vm.form.requestType = 'Не работает / Сломалось'
      wrapper.vm.questions.workStopped = null
      wrapper.vm.questions.errorText = ''
      wrapper.vm.questions.workaround = ''
      
      expect(wrapper.vm.isValid).toBe(false)
    })

    it('должен возвращать true для типа "Не работает / Сломалось" со всеми заполненными полями', () => {
      wrapper.vm.form.requestType = 'Не работает / Сломалось'
      wrapper.vm.questions.workStopped = true
      wrapper.vm.questions.errorText = 'Текст ошибки'
      wrapper.vm.questions.workaround = 'Обходной путь'
      
      expect(wrapper.vm.isValid).toBe(true)
    })

    it('должен возвращать true для направления не "1С"', () => {
      wrapper.vm.form.direction = 'ИТ'
      wrapper.vm.form.requestType = null
      
      expect(wrapper.vm.isValid).toBe(true)
    })
  })

  describe('buttonColor', () => {
    it('должен возвращать "gray" для невалидной формы на шаге 1', () => {
      wrapper.vm.form.direction = '1С'
      wrapper.vm.form.requestType = null
      
      expect(wrapper.vm.buttonColor).toBe('gray')
    })

    it('должен возвращать "green" для валидной формы на шаге 1', () => {
      wrapper.vm.form.direction = '1С'
      wrapper.vm.form.requestType = 'Не работает / Сломалось'
      wrapper.vm.form.description = 'Описание'
      
      expect(wrapper.vm.buttonColor).toBe('green')
    })
  })
})
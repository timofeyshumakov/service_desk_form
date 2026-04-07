<template>
  <v-app>
    <div>{{ }}</div>
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <v-main v-else>
      <v-container class="pa-8">
        <v-stepper
          v-model="step"
          :items="['Основные поля', 'Дополнительные вопросы']"
        >
          <template v-slot:item.1>
                <v-card title="Основные поля">
                  <v-card-text>
        <v-autocomplete
          v-model="form.direction"
          :items="directions"
          label="Направление"
          @update:modelValue="onDirectionChange"
          required
          variant="outlined"
          :rules="[v => !!v || 'Поле обязательно']"
          :error="touchedFields.direction && !form.direction"
        ></v-autocomplete>
        <v-autocomplete
          v-if="form.direction === '1С'"
          v-model="form.requestType"
          :items="requestTypes"
          item-title="VALUE"
          item-value="VALUE"
          label="Тип заявки"
          @update:modelValue="onRequestTypeChange"
          required
          variant="outlined"
          :rules="[v => !!v || 'Тип заявки обязателен']"
          :error="touchedFields.requestType && !form.requestType"
        ></v-autocomplete>
        <v-checkbox
          v-if="form.direction === '1С'"
          v-model="form.isImportant"
          label="Важно"
          color="warning"
        ></v-checkbox>
        <v-autocomplete
          v-if="form.direction === 'Б24'"
          v-model="form.category"
          :items="categories"
          item-title="VALUE"
          item-value="VALUE"
          label="Категория"
          @update:modelValue="onCategoryChange"
          required
          variant="outlined"
        ></v-autocomplete>
        <v-combobox
          v-model="form.title"
          label="Краткое описание / Тема"
          required
          variant="outlined"
          auto-grow
        ></v-combobox>

        <v-textarea
          v-model="form.description"
          label="Описание"
          required
          variant="outlined"
          :rules="[v => !!v || 'Описание обязательно']"
          rows="4"
          auto-grow
          :error="touchedFields.description && !form.description"
        ></v-textarea>

        <!-- Links -->
        <v-text-field
          v-model="newLink"
          label="Ссылки"
          append-icon="mdi-plus"
          @click:append="addLink"
          @keyup.enter="addLink"
          variant="outlined"
        ></v-text-field>
        <v-list v-if="form.links.length" class="links">
          <v-list-item v-for="(link, index) in form.links" :key="index">
            <v-list-item-title>{{ link }}</v-list-item-title>
            <v-btn icon="mdi-delete" @click="removeLink(index)"></v-btn>
          </v-list-item>
        </v-list>

        <!-- File Upload -->
        <v-file-input
          v-model="form.files"
          label="Файл/ы"
          multiple
          chips
          variant="outlined"
        ></v-file-input>
                  </v-card-text>
                </v-card>
    </template>
<template v-slot:item.2>
  <v-card>
    <v-card-title class="d-flex align-center">
      Дополнительные вопросы
      <v-chip v-if="form.requestType" class="ml-4" color="primary" size="small">
        {{ form.requestType }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <!-- Блок для типа 1: "Не работает / Сломалось" -->
      <template v-if="form.requestType === 'Не работает / Сломалось'">
        <v-radio-group
          v-model="questions.workStopped"
          label="1. Остановлена ли работа?"
          required
          :rules="[v => v !== null || 'Поле обязательно']"
          inline
          :error="touchedFields.workStopped && questions.workStopped === null"
        >
          <v-radio label="Да" :value="true"></v-radio>
          <v-radio label="Нет" :value="false"></v-radio>
        </v-radio-group>

        <v-file-input
          v-model="questions.errorScreenshot"
          label="2. Скриншот ошибки"
          variant="outlined"
          prepend-icon="mdi-camera"
          multiple
        ></v-file-input>

        <v-textarea
          v-model="questions.errorText"
          rows="2"
          label="2. Текст ошибки"
          variant="outlined"
          placeholder="Опишите текст ошибки"
          required
          :rules="[v => !!v || 'Текст ошибки обязателен']"
          auto-grow
          :error="touchedFields.errorText && !questions.errorText"
        ></v-textarea>

        <v-textarea
          v-model="questions.workaround"
          label="3. Есть ли обходной путь?"
          rows="3"
          variant="outlined"
          placeholder="Опишите временное решение, если есть"
          required
          :rules="[v => !!v || 'Обходной путь обязателен']"
          auto-grow
          :error="touchedFields.workaround && !questions.workaround"
        ></v-textarea>
      </template>

      <!-- Блок для типа 2: "Нужно изменить или доработать" -->
      <template v-if="form.requestType === 'Нужно изменить или доработать'">
        <v-textarea
          v-model="questions.currentSituation"
          label="1. Что сейчас происходит?"
          rows="3"
          variant="outlined"
          placeholder="Как выполняется процесс сейчас?"
          required
          :rules="[v => !!v || 'Поле обязательно']"
          auto-grow
          :error="touchedFields.currentSituation && !questions.currentSituation"
        ></v-textarea>

        <v-textarea
          v-model="questions.expectedResult"
          label="2. Что должно происходить?"
          rows="3"
          variant="outlined"
          placeholder="Ожидаемый результат"
          required
          :rules="[v => !!v || 'Поле обязательно']"
          auto-grow
          :error="touchedFields.expectedResult && !questions.expectedResult"
        ></v-textarea>

        <v-textarea
          v-model="questions.businessGoal"
          label="3. Зачем нужно изменение?"
          rows="3"
          variant="outlined"
          placeholder="Бизнес-цель, которая достигается"
          required
          :rules="[v => !!v || 'Поле обязательно']"
          auto-grow
          :error="touchedFields.businessGoal && !questions.businessGoal"
        ></v-textarea>

        <v-text-field
          v-model="questions.location"
          label="4. Где это происходит?"
          variant="outlined"
          placeholder="База 1С, раздел, документ, отчет"
          required
          :rules="[v => !!v || 'Поле обязательно']"
          auto-grow
          :error="touchedFields.location && !questions.location"
        ></v-text-field>

        <v-autocomplete
          v-model="questions.criticality"
          :items="criticalityOptions"
          label="5. Насколько критично изменение?"
          variant="outlined"
          required
          :rules="[v => !!v || 'Поле обязательно']"
          auto-grow
          :error="touchedFields.criticality && !questions.criticality"
        ></v-autocomplete>
            <v-text-field
              v-model="questions.desiredDateReason"
              label="6. Есть ли желаемый срок"
              placeholder="Дата и причина установки срока"
              variant="outlined"
              required
              :rules="[v => !!v || 'Поле обязательно']"
              auto-grow
              :error="touchedFields.desiredDateReason && !questions.desiredDateReason"
            ></v-text-field>
      </template>

      <!-- Блок для типа 3: "Корреĸтировĸа данных / Консультация" -->
      <template v-if="form.requestType === 'Корреĸтировĸа данных / Консультация'">
        <v-autocomplete
          v-model="questions.subType"
          :items="correctionSubTypes"
          label="Выберите тип"
          variant="outlined"
          required
          clearable
          :rules="[v => !!v || 'Поле обязательно']"
          @update:modelValue="onSubTypeChange"
          :error="touchedFields.subType && !questions.subType"
        ></v-autocomplete>

        <!-- Подблок для "Очистка/корректировка данных" -->
        <template v-if="questions.subType === 'Очистĸа/ĸорреĸтировĸа данных'">
          <v-textarea
            v-model="questions.whatDataIsWrong"
            label="1. Какие данные неверны?"
            rows="3"
            variant="outlined"
            placeholder="В чем ошибка?"
            required
            :rules="[v => !!v || 'Поле обязательно']"
            auto-grow
            :error="touchedFields.whatDataIsWrong && !questions.whatDataIsWrong"
          ></v-textarea>

          <v-textarea
            v-model="questions.whereDataLocated"
            label="2. Где находятся данные?"
            rows="3"
            variant="outlined"
            placeholder="База 1С, документ, отчет, период"
            required
            :rules="[v => !!v || 'Поле обязательно']"
            auto-grow
            :error="touchedFields.whereDataLocated && !questions.whereDataLocated"
          ></v-textarea>

          <v-text-field
            v-model="questions.correctionReason"
            label="3. Почему требуется корректировка?"
            variant="outlined"
            placeholder="Причина"
            required
            :rules="[v => !!v || 'Поле обязательно']"
            auto-grow
            :error="touchedFields.correctionReason && !questions.correctionReason"
          ></v-text-field>

          <v-textarea
            v-model="questions.correctResult"
            label="4. Какой должен быть правильный результат?"
            rows="3"
            variant="outlined"
            required
            :rules="[v => !!v || 'Поле обязательно']"
            auto-grow
            :error="touchedFields.correctResult && !questions.correctResult"
          ></v-textarea>
        </template>

        <!-- Подблок для "Консультация" -->
        <template v-if="questions.subType === 'Консультация'">
          <v-text-field
            v-model="questions.consultationLocation"
            label="1. Где возник вопрос?"
            variant="outlined"
            placeholder="База 1С, раздел / документ"
            required
            :rules="[v => !!v || 'Поле обязательно']"
            auto-grow
            :error="touchedFields.consultationLocation && !questions.consultationLocation"
          ></v-text-field>

          <v-textarea
            v-model="questions.alreadyTried"
            label="2. Что уже пробовали сделать?"
            rows="3"
            variant="outlined"
            required
            :rules="[v => !!v || 'Поле обязательно']"
            auto-grow
            :error="touchedFields.alreadyTried && !questions.alreadyTried"
          ></v-textarea>
        </template>
      </template>

      <!-- Блок для типа 4: "Нужен доступ" -->
      <template v-if="form.requestType === 'Нужен доступ'">
        <v-text-field
          v-model="questions.accessRecipient"
          label="1. Кому требуется доступ?"
          placeholder="ФИО, должность"
          variant="outlined"
          required
          :rules="[v => !!v || 'Поле обязательно']"
          :error="touchedFields.accessRecipient && !questions.accessRecipient"
        ></v-text-field>

        <v-text-field
          v-model="questions.accessDatabase"
          label="2. В какой базе 1С?"
          placeholder="Наименование и путь к базе, если известно"
          variant="outlined"
          required
          :rules="[v => !!v || 'Поле обязательно']"
          :error="touchedFields.accessDatabase && !questions.accessDatabase"
        ></v-text-field>

        <v-text-field
          v-model="questions.accessLevel"
          label="3. Какой уровень доступа нужен?"
          placeholder="Просмотр / ввод / проведение / как у кого?"
          variant="outlined"
          required
          :rules="[v => !!v || 'Поле обязательно']"
          :error="touchedFields.accessLevel && !questions.accessLevel"
        ></v-text-field>

        <v-text-field
          v-model="questions.accessObjects"
          label="4. К каким разделам/объектам?"
          placeholder="Продажи, склад и т.п."
          variant="outlined"
          required
          :rules="[v => !!v || 'Поле обязательно']"
          :error="touchedFields.accessObjects && !questions.accessObjects"
        ></v-text-field>
      </template>

      <template v-if="!form.requestType">
        <v-card-text>
                      <v-text-field
                        v-model="project"
                        label="Проект"
                        required
                        variant="outlined"
                      ></v-text-field>

                      <v-autocomplete
                        v-model="urgency"
                        :items="urgencyOptions"
                        label="Срочность"
                        required
                        :rules="[v => !!v || 'Поле обязательно']"
                        variant="outlined"
                      ></v-autocomplete>

                      <v-autocomplete
                        v-model="importance"
                        :items="importanceOptions"
                        label="Важность"
                        required
                        :rules="[v => !!v || 'Поле обязательно']"
                        variant="outlined"
                      ></v-autocomplete>
                  </v-card-text>
      </template>
    </v-card-text>
  </v-card>
</template>
      <div class="buttons">
        <v-btn v-if="step > 1" @click="step--">назад</v-btn>
        <v-btn color="primary" prepend-icon="mdi-play" @click="showVideo = true">Видеоинструкция</v-btn>
        <v-btn v-if="step === 1" :color="buttonColor" @click="goNextStep">{{form.direction === "ИТ" || form.direction === "Б24" ? 'создать заявку' : 'Продолжить'}}</v-btn>
        <v-btn v-if="step === 2"  :color="isValid ? 'success' : null" @click="completeStepper">создать заявку</v-btn>
      </div>
        </v-stepper>
        <v-btn class="reports-button" @click="reportsDialog = true">Отчеты</v-btn>
      </v-container>
    </v-main>
      <v-dialog v-model="successDialog" max-width="500" class="successDialog">
        <v-card>
          <v-card-title class="success white--text">Успешно выполнено!</v-card-title>
          <v-card-text class="v-card-text mt-4 text-center">Заявка успешно создана</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="successDialog = false">закрыть</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="errorDialog" max-width="500" class="errorDialog">
        <v-card>
          <v-card-title class="error white--text">Ошибка!</v-card-title>
          <v-card-text color="error" class="v-card-text mt-4 text-center">{{ errorDisplay }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="errorDialog = false">закрыть</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
<v-dialog
        v-model="showVideo"
        max-width="850"
      >
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <!--<span>Просмотр видео</span>-->
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="showVideo = false"
            ></v-btn>
          </v-card-title>
          <v-card-text>
            <!--
            <video
              ref="videoPlayer"
              class="video-player"
              :src="videoSrc"
              controls
            >
                <source :src="videoSrc" type="video/mp4">
                Ваш браузер не поддерживает HTML5 видео.
            </video>-->
            Инструкция в разработке
          </v-card-text>
        </v-card>
      </v-dialog>
  <!-- Диалог выбора отчетов -->
  <v-dialog v-model="reportsDialog">
    <v-card>
      <v-card-title class="success white--text d-flex justify-space-between align-center">
        Выбор отчета
        <v-btn icon small @click="reportsDialog = false" class="ma-1">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text class="pa-6">
        <div class="reports-menu">
          <v-card 
            v-for="report in visibleReports" 
            :key="report.id"
            class="report-card mb-4"
            :class="{ 'report-card-active': selectedReport === report.id }"
            @click="openReport(report.id)"
            hover
          >
            <v-card-text class="d-flex align-center">
              <v-icon 
                :color="selectedReport === report.id ? 'primary' : 'grey'"
                class="mr-4"
                size="32"
              >
                {{ report.icon }}
              </v-icon>
              <div>
                <h3 class="report-title">{{ report.title }}</h3>
                <p class="report-description">{{ report.description }}</p>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Диалог отчета 1 (существующий) -->
  <v-dialog v-model="report1Dialog" scrollable>
    <v-card>
      <v-card-title class="success white--text d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-btn icon @click="backToReportsMenu" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          Отчет по заявкам категории ИТ
        </div>
        <div class="d-flex align-center">
          <div class="d-flex align-center">
            <v-btn 
              icon 
              @click="exportDetailedInvoicesToExcel(pivotTableDate, 'Отчет_по_заявкам_ИТ')"
              title="Экспорт в Excel"
              class="mr-2"
            >
              <v-icon>mdi-file-excel</v-icon>
            </v-btn>
          </div>
          <v-btn icon small @click="report1Dialog = false" class="ma-1">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      
      <v-card-text>
<TheForm @update-data="handleInvoicesData" :users="invoiceUsers"></TheForm>
<div v-if="invoicesLoading" class="table-loading">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <span>Загрузка данных...</span>
        </div>
            <v-data-table v-else 
          :items="itemsTableDate" 
          :headers="itemsTableHeaders" 
          :group-by="[{ key: 'FULL_NAME', order: 'asc' }]" 
          items-per-page="-1" 
          hide-default-footer
          ref="invoicesTable"
          @keydown="handleTableKeydown"
          tabindex="0"
          >
                <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
                  <tr>
                    <td :colspan="columns.length" class="summary-grid-container">
                      <div class="summary-grid-compact">
                        <div class="grid-header">
                          <v-btn size="small" :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'" 
                                @click="toggleGroup(item)" class="toggle-btn"></v-btn>
                          <span class="executor-name">{{ item.value }}</span>
                        </div>
                        <div class="grid-stats">
                          <div class="stat-item">
                              <span class="stat-number">{{ getSummary(item.value).totalDeals }}</span>
                              <span class="stat-label">Кол-во тикетов</span>
                          </div>
                          <div class="stat-item">
                            <span class="stat-number">{{ getSummary(item.value).openCount }}</span>
                            <span class="stat-label">Открытых</span>
                          </div>

                          <div class="stat-item">
                              <span class="stat-number">{{ getSummary(item.value).totalTimeSpent }}</span>
                              <span class="stat-label">Время затрачено:</span>
                          </div>

                          <div class="stat-item">
                            <span class="stat-number">{{ getSummary(item.value).slaCompletedCount }}</span>
                            <span class="stat-label">SLA выполнен</span>
                          </div>
                          
                          <div class="stat-item">
                            <span class="stat-number">{{ getSummary(item.value).slaNotCompletedCount }}</span>
                            <span class="stat-label">SLA не выполнен</span>
                          </div>

                          <div class="stat-item">
                            <span class="stat-number">{{ getSummary(item.value).slaNotCompletedPercentage }}%</span>
                            <span class="stat-label">% невыполненных </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <DataTableGroupHeaderRepeat :columns="columns" :show="isGroupOpen(item)" />
                </template>
                <template v-slot:item.title="{ item }">
                    <a 
                        v-if="item.ufCrm_47_1701780020523"
                        :href="`https://ortonica.bitrix24.ru/company/personal/user/${currentUser}/tasks/task/view/${item.ufCrm_47_1701780020523}/`" 
                        target="_blank" 
                        class="task-link"
                    >
                        {{ item.title }}
                    </a>
                    <span v-else>
                        {{ item.title }}
                    </span>
                </template>
              </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Диалог отчета 2 (новый пустой) -->
  <v-dialog v-model="report2Dialog">
    <v-card>
      <v-card-title class="primary white--text d-flex success justify-space-between align-center">
        <div class="d-flex align-center">
          <v-btn icon @click="backToReportsMenu" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          Отчет по задачам
        </div>
        <div class="d-flex align-center">
          <div class="d-flex align-center">
            <v-btn 
              icon 
              @click="exportTasksToExcel(tasksTableDate, 'Отчет_по_задачам')"
              title="Экспорт в Excel"
              class="mr-2"
            >
              <v-icon>mdi-file-excel</v-icon>
            </v-btn>
          </div>
          <v-btn icon small @click="closeAllDialogs" class="ma-1">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-6 text-center">
        <TheForm @update-task-data="handleFilteredTasksData" @updateTaskData="handleTasksData" :users="taskUsers" reportType="tasks"></TheForm>
<div v-if="tasksLoading" class="table-loading">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <span>Загрузка данных...</span>
        </div>
        <v-data-table v-else
          :items="tasksTableDate" 
          :headers="tasksTableHeaders" 
          item-value="uniqueKey"
          :group-by="[
            { key: 'responsibleFullName', order: 'asc' },
            { key: 'recordCreatedDateGroup', order: 'desc' },
          ]" 
          items-per-page="-1" 
          hide-default-footer
          ref="tasksTable"
          @keydown="handleTableKeydown"
          tabindex="0"
          >
<template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
            <tr>
              <td :colspan="columns.length" :class="item.key === 'createdDateGroup' ? 'tasks-date-group-header' : 'summary-grid-container'">
                <div v-if="item.key === 'responsibleFullName'" class="summary-grid-compact">
                  <div class="grid-header">
                    <v-btn size="small" :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'" 
                          @click="toggleGroup(item)" class="toggle-btn"></v-btn>
                    <span class="executor-name">{{ item.value }}</span>
                  </div>
                  
                  <div class="grid-stats">
                    <div class="stat-item">
                      <span class="stat-number">{{ getTaskSummary(item.value).totalTasks }}</span>
                      <span class="stat-label">Всего задач</span>
                    </div>
                    
                    <div class="stat-item">
                      <span class="stat-number">{{ getTaskSummary(item.value).completedTasks }}</span>
                      <span class="stat-label">Завершено</span>
                    </div>
                    
                    <div class="stat-item">
                      <span class="stat-number">{{ getTaskSummary(item.value).inProgressTasks }}</span>
                      <span class="stat-label">В работе</span>
                    </div>
                    
                    <div class="stat-item">
                      <span class="stat-number">{{ getTaskSummary(item.value).newTasks }}</span>
                      <span class="stat-label">Новые</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ getTaskSummary(item.value).totalTimeSpent }}</span>
                      <span class="stat-label">Время затрачено:</span>
                    </div>
                  </div>
                </div>
                <div v-else class="tasks-date-subgroup d-flex align-center flex-wrap py-1">
                  <v-btn size="small" :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'" 
                        @click="toggleGroup(item)" class="toggle-btn"></v-btn>
                  <span class="text-body-2 font-weight-medium">{{ formatCreatedDateGroupHeader(item.value) }}</span>
                  <span class="text-caption text-medium-emphasis ml-2">
                    Записей: {{ getDateSubgroupTaskCount(item) }}, Время: {{ getDateSubgroupTimeSpent(item) }} ч
                  </span>
                </div>
              </td>
            </tr>
            <DataTableGroupHeaderRepeat :columns="columns" :show="isGroupOpen(item)" />
          </template>
          <template v-slot:item.title="{ item }">
                    <a :href="`https://ortonica.bitrix24.ru/company/personal/user/${currentUser}/tasks/task/view/${item.id}/`" target="_blank" class="task-link">
                      {{ item.title }}
                    </a>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog v-model="report3Dialog" scrollable>
  <v-card>
    <v-card-title class="primary white--text d-flex success justify-space-between align-center">
      <div class="d-flex align-center">
        <v-btn icon @click="backToReportsMenu" class="mr-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        Отчет по задачам для категории ИТ
      </div>
      <div class="d-flex align-center">
        <v-btn 
          icon 
          @click="exportTasksDetailedToExcel(tasksDetailedTableDate, 'Отчет_по_задачам_категрии_ИТ')"
          title="Экспорт в Excel"
          class="mr-2"
        >
          <v-icon>mdi-file-excel</v-icon>
        </v-btn>
        <v-btn icon small @click="report3Dialog = false" class="ma-1">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-card-title>
    
    <v-card-text>
      <TheForm 
        @update-task-data="handleDetailedTasksData" 
        :users="invoiceUsers" 
        reportType="tasksDetails"
      ></TheForm>
      
      <div v-if="tasksDetailedLoading" class="table-loading">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <span>Загрузка данных...</span>
      </div>
      
      <v-data-table 
        v-else
        :items="tasksDetailedTableDate" 
        :headers="tasksDetailedTableHeaders" 
        :group-by="[{ key: 'responsibleFullName', order: 'asc' }]" 
        items-per-page="-1" 
        hide-default-footer
        ref="tasksDetailedTable"
        @keydown="handleTableKeydown"
        tabindex="0"
      >
        <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
          <tr>
            <td :colspan="columns.length" class="summary-grid-container">
              <div class="summary-grid-compact">
                <div class="grid-header">
                  <v-btn size="small" :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'" 
                        @click="toggleGroup(item)" class="toggle-btn"></v-btn>
                  <span class="executor-name">{{ item.value }}</span>
                </div>
                
                <div class="grid-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ getDetailedTaskSummary(item.value).totalTasks }}</span>
                    <span class="stat-label">Всего задач</span>
                  </div>
                  
                  <div class="stat-item">
                    <span class="stat-number">{{ getDetailedTaskSummary(item.value).completedTasks }}</span>
                    <span class="stat-label">Завершено</span>
                  </div>
                  
                  <div class="stat-item">
                    <span class="stat-number">{{ getDetailedTaskSummary(item.value).inProgressTasks }}</span>
                    <span class="stat-label">В работе</span>
                  </div>
                  
                  <div class="stat-item">
                    <span class="stat-number">{{ getDetailedTaskSummary(item.value).newTasks }}</span>
                    <span class="stat-label">Новые</span>
                  </div>
                  
                  <div class="stat-item">
                    <span class="stat-number">{{ getDetailedTaskSummary(item.value).totalTimeSpent }}</span>
                    <span class="stat-label">Время затрачено:</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <DataTableGroupHeaderRepeat :columns="columns" :show="isGroupOpen(item)" />
        </template>
        
        <template v-slot:item.title="{ item }">
          <a 
            :href="`https://ortonica.bitrix24.ru/company/personal/user/${currentUser}/tasks/task/view/${item.id}/`" 
            target="_blank" 
            class="task-link"
          >
            {{ item.title }}
          </a>
        </template>
        
        <template v-slot:item.timeSpentInLogs="{ item }">
          <span class="time-spent">{{ item.timeSpentInLogs }}</span>
        </template>
        
        <template v-slot:item.statusLabel="{ item }">
          {{ item.statusLabel }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</v-dialog>

  <v-dialog v-model="newReportsDialog" max-width="1400" scrollable>
    <v-card>
      <v-card-title class="primary white--text d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-btn icon @click="backToReportsMenu" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          {{ newReportDialogTitle }}
        </div>
        <div class="d-flex align-center">
          <v-btn icon @click="exportNewReportToExcel" title="Экспорт в Excel" class="mr-2" :disabled="newReportsLoading">
            <v-icon>mdi-file-excel</v-icon>
          </v-btn>
          <v-btn icon small @click="newReportsDialog = false" class="ma-1">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-6 text-center">
        <NewReportsFilters
          v-model:selectedResponsibles="newReportSelectedResponsibles"
          v-model:selectedDirections="newReportSelectedDirections"
          :report-tab="newReportTab"
          :responsibles="newReportResponsibles"
          :directions="newReportDirections"
          :loading="newReportsLoading"
          :show-input="newReportDateShowInput"
          :selected-date-iso="newReportSelectedDateIso"
          @send-date="onNewReportDateSend"
          @submit="loadNewReport"
        />

        <div class="new-report-summary mt-4">
          <v-row v-if="newReportTab === '3'">
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="text-caption">Задач в отчёте</div>
                  <div class="text-h5">{{ newReportSummary.completed }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="text-caption">Суммарные трудозатраты</div>
                  <div class="text-h5">{{ newReportSummary.report3DurationLabel }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row v-else-if="newReportTab === '4'">
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="text-caption">Задач в отчёте</div>
                  <div class="text-h5">{{ newReportSummary.completed }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="text-caption">Среднее время принятия</div>
                  <div class="text-h5" :class="report4AvgAcceptClass(newReportSummary.report4AvgAcceptMs)">
                    {{ newReportSummary.report4AvgAcceptLabel }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="text-caption">Среднее время выполнения</div>
                  <div class="text-h5">{{ newReportSummary.report4AvgCompleteLabel }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="text-caption">{{ newReportLabels.completed }}</div>
                  <div class="text-h5">{{ newReportSummary.completed }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="text-caption">{{ newReportLabels.overdue }}</div>
                  <div class="text-h5">{{ newReportSummary.overdue }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="text-caption">{{ newReportLabels.onTime }}</div>
                  <div class="text-h5">{{ newReportSummary.onTimePercent }}%</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <div class="text-body-2 mt-2">{{ newReportSummary.text }}</div>
        </div>

        <div
          v-if="newReportTab === '4' && newReportSummary.report4AvgByTaskType.length"
          class="report4-task-type-cards text-left mt-2"
        >
          <div class="text-subtitle-2 mb-3">Группировка: тип задачи</div>
          <v-row dense>
            <v-col
              v-for="row in newReportSummary.report4AvgByTaskType"
              :key="'r4-tt-card-' + row.label"
              cols="12"
              sm="6"
              md="3"
            >
              <v-card variant="outlined" class="report4-type-card h-100">
                <v-card-title class="text-body-1 py-2">{{ row.label }}</v-card-title>
                <v-card-text class="pt-0">
                  <div class="text-caption text-medium-emphasis">Среднее время принятия</div>
                  <div class="text-h6" :class="report4AvgAcceptClass(row.avgAcceptMs)">{{ row.avgAcceptLabel }}</div>
                  <div class="text-caption text-medium-emphasis mt-3">Среднее время выполнения</div>
                  <div class="text-body-1">{{ row.avgCompleteLabel }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <v-data-table
          class="mt-4"
          :loading="newReportsLoading"
          :headers="newReportHeaders"
          :items="newReportRows"
          :group-by="newReportTableGroupBy"
          item-value="taskId"
          items-per-page="-1"
          hide-default-footer
        >
          <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
            <tr>
              <td
                v-if="newReportTab === '4'"
                :colspan="columns.length"
                :class="item.key === 'category' ? 'tasks-date-group-header' : 'summary-grid-container'"
              >
                <div v-if="item.key === 'taskType'" class="summary-grid-compact">
                  <div class="grid-header">
                    <v-btn
                      size="small"
                      :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'"
                      class="toggle-btn"
                      @click="toggleGroup(item)"
                    />
                    <span class="executor-name">{{ item.value }}</span>
                  </div>
                  <div class="grid-stats">
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport7TypeSummary(item.value).totalTasks }}</span>
                      <span class="stat-label">Всего задач</span>
                    </div>
                    <!--
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport7TypeSummary(item.value).completedTasks }}</span>
                      <span class="stat-label">Завершено</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport7TypeSummary(item.value).inProgressTasks }}</span>
                      <span class="stat-label">В работе</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport7TypeSummary(item.value).newTasks }}</span>
                      <span class="stat-label">Новые</span>
                    </div>
                    -->
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport7TypeSummary(item.value).totalAcceptHours }}</span>
                      <span class="stat-label">Σ срок принятия, ч</span>
                    </div>
                  </div>
                </div>
                <div v-else class="tasks-date-subgroup d-flex align-center flex-wrap py-1">
                  <v-btn
                    size="small"
                    :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'"
                    class="toggle-btn"
                    @click="toggleGroup(item)"
                  />
                  <span class="text-body-2 font-weight-medium">Категория: {{ item.value }}</span>
                  <span class="text-caption text-medium-emphasis ml-2">
                    задач: {{ countReport4GroupRows(item) }}, Σ срок принятия: {{ getReport7CategoryAcceptHours(item) }} ч
                  </span>
                </div>
              </td>
              <td
                v-else-if="newReportTab === '3'"
                :colspan="columns.length"
                :class="item.key === 'createdDateGroup' ? 'tasks-date-group-header' : 'summary-grid-container'"
              >
                <div v-if="item.key === 'responsibleName'" class="summary-grid-compact">
                  <div class="grid-header">
                    <v-btn
                      size="small"
                      :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'"
                      class="toggle-btn"
                      @click="toggleGroup(item)"
                    />
                    <span class="executor-name">{{ item.value }}</span>
                  </div>
                  <div class="grid-stats">
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport3PostanovshikSummary(item.value).totalTasks }}</span>
                      <span class="stat-label">Всего задач</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport3PostanovshikSummary(item.value).completedTasks }}</span>
                      <span class="stat-label">Завершено</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport3PostanovshikSummary(item.value).inProgressTasks }}</span>
                      <span class="stat-label">В работе</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport3PostanovshikSummary(item.value).newTasks }}</span>
                      <span class="stat-label">Новые</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ getReport3PostanovshikSummary(item.value).totalTimeSpent }}</span>
                      <span class="stat-label">Время затрачено:</span>
                    </div>
                  </div>
                </div>
                <div v-else class="tasks-date-subgroup d-flex align-center flex-wrap py-1">
                  <v-btn
                    size="small"
                    :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'"
                    class="toggle-btn"
                    @click="toggleGroup(item)"
                  />
                  <span class="text-body-2 font-weight-medium">Дата создания: {{ formatCreatedDateGroupHeader(item.value) }}</span>
                  <span class="text-caption text-medium-emphasis ml-2">
                    задач: {{ getDateSubgroupTaskCount(item) }}, время: {{ getReport3DateSubgroupDurationHours(item) }} ч
                  </span>
                </div>
              </td>
              <td v-else-if="newReportTab !== '4'" :colspan="columns.length" class="summary-grid-container">
                <div class="summary-grid-compact">
                  <div class="grid-header">
                    <v-btn size="small" :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'" @click="toggleGroup(item)" class="toggle-btn" />
                    <span class="executor-name">{{ item.value }}</span>
                  </div>
                  <div class="grid-stats">
                    <div class="stat-item">
                      <span class="stat-number">{{ getNewReportGroupSummary(item.value).completed }}</span>
                      <span class="stat-label">{{ newReportLabels.completed }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ getNewReportGroupSummary(item.value).overdue }}</span>
                      <span class="stat-label">{{ newReportLabels.overdue }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ getNewReportGroupSummary(item.value).onTimePercent }}%</span>
                      <span class="stat-label">{{ newReportLabels.onTime }}</span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <DataTableGroupHeaderRepeat :columns="columns" :show="isGroupOpen(item)" />
          </template>

          <template v-slot:item.title="{ item }">
            <a :href="item.taskUrl" target="_blank" class="task-link">{{ item.title }}</a>
          </template>
          <template v-slot:item.onTimeLabel="{ item }">
            <span
              v-if="newReportTab === '1'"
              class="font-weight-medium"
              :class="item.onTime ? 'text-success' : 'text-error'"
            >
              {{ item.onTimeLabel }}
            </span>
            <span v-else>{{ item.onTimeLabel }}</span>
          </template>
          <template v-slot:item.taskDescriptionDisplay="{ item }">
            <div v-if="newReportTab === '3' || newReportTab === '4'" class="report3-desc-cell">
              <a :href="item.taskUrl" target="_blank" class="task-link d-block">{{ item.title }}</a>
              <div v-if="item.taskDescriptionBody" class="text-body-2 text-medium-emphasis mt-1">{{ item.taskDescriptionBody }}</div>
            </div>
          </template>
        </v-data-table>

        <div
          v-if="newReportTab === '4' && newReportRows.length"
          class="report4-avg-breakdown text-left mt-6"
        >
          <div class="text-subtitle-2 mb-3">
            Средние значения по колонкам «Срок принятия задачи» и «Срок выполнения задачи» (часы и минуты)
          </div>

          <div class="mb-4">
            <div class="font-weight-medium mb-2">Группировка: категория</div>
            <v-table v-if="newReportSummary.report4AvgByCategory.length" density="compact" class="report4-avg-table border rounded">
              <thead>
                <tr>
                  <th class="text-left">Категория</th>
                  <th class="text-left">Среднее время принятия</th>
                  <th class="text-left">Среднее время выполнения</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in newReportSummary.report4AvgByCategory" :key="'r4-cat-' + row.label">
                  <td>{{ row.label }}</td>
                  <td>
                    <span :class="report4AvgAcceptClass(row.avgAcceptMs)">{{ row.avgAcceptLabel }}</span>
                  </td>
                  <td>{{ row.avgCompleteLabel }}</td>
                </tr>
              </tbody>
            </v-table>
            <div v-else class="text-body-2 text-medium-emphasis">Нет данных для расчёта по категориям.</div>
          </div>

          <div>
            <div class="font-weight-medium mb-2">Итоги</div>
            <ul class="pl-6 mb-0 text-body-2">
              <li>
                Среднее время принятия задачи:
                <span :class="report4AvgAcceptClass(newReportSummary.report4AvgAcceptMs)">{{
                  newReportSummary.report4AvgAcceptLabel
                }}</span>
              </li>
              <li>Среднее время выполнения задачи: {{ newReportSummary.report4AvgCompleteLabel }}</li>
            </ul>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import TheForm from '../components/TheForm/TheForm.vue';
import NewReportsFilters from '../components/TheForm/NewReportsFilters.vue';
import DataTableGroupHeaderRepeat from '../components/DataTableGroupHeaderRepeat.vue';
import moment from 'moment';
import { callApi, getTaskElapsedItems } from '../functions/callApi';
import * as XLSX from 'xlsx';

const errorDialog = ref(false);
const successDialog = ref(false);
const errorDisplay = ref('');
const isLoading = ref(true);
// Form data
const form = ref({
  direction: null,
  requestType: null,
  category: null,
  subcategory: null,
  title: '',
  description: '',
  links: [],
  files: [],
  isImportant: false,
});
const step = ref(1); // Начинаем сразу со 2 шага для демонстрации
const valid = ref(false);
const project = ref('');
const urgency = ref(null);
const importance = ref(null);
const threatsOpportunities = ref(null);
const incidentType = ref('Корреĸтировĸа данных / Консультация'); // Это значение должно приходить с 1 шага
const newLink = ref('');

const pivotTableDate = ref([]);
const itemsTableDate = ref([]);
const tasksTableDate = ref([]);
const search = ref([]);

const touchedFields = ref({
  direction: false,
  requestType: false,
  description: false,
  category: false,
  title: false,
  // Добавьте поля для дополнительных вопросов
  workStopped: false,
  errorText: false,
  workaround: false,
  currentSituation: false,
  expectedResult: false,
  businessGoal: false,
  location: false,
  criticality: false,
  desiredDate: false,
  desiredDateReason: false,
  subType: false,
  whatDataIsWrong: false,
  whereDataLocated: false,
  correctionReason: false,
  correctResult: false,
  consultationLocation: false,
  alreadyTried: false,
  accessRecipient: false,
  accessDatabase: false,
  accessLevel: false,
  accessObjects: false,
});

const validateFirstStep = () => {
  touchedFields.value.direction = true;
  touchedFields.value.description = true;
  
  if (form.value.direction === "1С") {
    touchedFields.value.requestType = true;
    return !!form.value.requestType && !!form.value.description;
  } else if (form.value.direction === "ИТ") {
    return !!form.value.description;
  } else {
    return !!form.value.description;
  }
};

// Функция для проверки и подсветки полей на втором шаге
const validateSecondStep = () => {
  let isValid = false;
  
  if (form.value.direction === "1С" && form.value.requestType) {
    // Отмечаем все поля соответствующего типа как "тронутые"
    if (form.value.requestType === 'Не работает / Сломалось') {
      touchedFields.value.workStopped = true;
      touchedFields.value.errorText = true;
      touchedFields.value.workaround = true;
      
      isValid = !!(questions.value.workStopped !== null && 
                   questions.value.errorText && 
                   questions.value.workaround);
    }
    
    else if (form.value.requestType === 'Нужно изменить или доработать') {
      touchedFields.value.currentSituation = true;
      touchedFields.value.expectedResult = true;
      touchedFields.value.businessGoal = true;
      touchedFields.value.location = true;
      touchedFields.value.criticality = true;
      touchedFields.value.desiredDateReason = true;
      
      isValid = !!(questions.value.currentSituation && 
                   questions.value.expectedResult && 
                   questions.value.businessGoal && 
                   questions.value.location && 
                   questions.value.criticality &&
                   questions.value.desiredDateReason);
    }
    
    else if (form.value.requestType === 'Корреĸтировĸа данных / Консультация') {
      touchedFields.value.subType = true;
      
      if (questions.value.subType === 'Очистĸа/ĸорреĸтировĸа данных') {
        touchedFields.value.whatDataIsWrong = true;
        touchedFields.value.whereDataLocated = true;
        touchedFields.value.correctionReason = true;
        touchedFields.value.correctResult = true;
        
        isValid = !!(questions.value.whatDataIsWrong && 
                     questions.value.whereDataLocated && 
                     questions.value.correctionReason && 
                     questions.value.correctResult);
      } else if (questions.value.subType === 'Консультация') {
        touchedFields.value.consultationLocation = true;
        touchedFields.value.alreadyTried = true;
        
        isValid = !!(questions.value.consultationLocation && 
                     questions.value.alreadyTried);
      } else {
        isValid = false;
      }
    }
    
    else if (form.value.requestType === 'Нужен доступ') {
      touchedFields.value.accessRecipient = true;
      touchedFields.value.accessDatabase = true;
      touchedFields.value.accessLevel = true;
      touchedFields.value.accessObjects = true;

      isValid = !!(questions.value.accessRecipient && 
                  questions.value.accessDatabase && 
                  questions.value.accessLevel &&
                  questions.value.accessObjects);
    }

  } else if (form.value.direction !== null && form.value.direction !== "1С") {
    isValid = true;
  }
  
  return isValid;
};
const pivotTableHeaders = ref([
        { title: 'Сотрудник', value: 'userName', sortable: true },
        { title: 'Кол-во тикетов', value: 'totalDeals', sortable: true },
        { title: 'Открытых', value: 'openCount', sortable: true },
        { title: 'Закртых', value: 'closedCount', sortable: true },
        { title: 'Время затрачено', value: 'totalTimeSpent', sortable: true },
        { title: 'SLA выполнено', value: 'slaCompletedCount', sortable: true },
        { title: 'SLA не выполнено', value: 'slaNotCompletedCount', sortable: true },
]);

const itemsTableHeaders = ref([
        { title: 'id', value: 'id', sortable: true },
        { title: 'Сотрудник', value: 'FULL_NAME', sortable: true },
        { title: 'Статус', value: 'stageId', sortable: true },
        { title: 'Название', value: 'title', sortable: true },
        { title: 'Дата начала', value: 'begindate', sortable: true },
        { title: 'Дата выполнения', value: 'closedate', sortable: true },
        { title: 'Время затрачено', value: 'duration', sortable: true },
        { title: 'Подкатегория', value: 'ufCrm_47_1752752059810', sortable: true },
        { title: 'Категория', value: 'ufCrm_47_1752822806', sortable: true },
        { title: 'SLA выполнен', value: 'ufCrm_47_1752010288013', sortable: true },
        { title: 'Дедлайн по SLA', value: 'ufCrm_47_1752010416', sortable: true },
]);

const buttonColor = computed(() => {
  if (form.value.direction === "1С") {
    return !!form.value.requestType && !!form.value.description ? 'green' : 'gray';
  } else if (form.value.direction === "ИТ") {
    return !!form.value.description ? 'green' : 'gray';
  } else {
    return !!form.value.description ? 'green' : 'gray';
  }
});
// Вычисляемое свойство для активности кнопки
const isNextStepAvailable = computed(() => {
  if (form.value.direction === "1С") {
    return !!form.value.requestType && !!form.value.description;
  } else if (form.value.direction === "ИТ") {
    return !!form.value.description;
  } else {
    return !!form.value.description;
  }
});

// Метод перехода на следующий шаг
const goNextStep = async () => {
  if (validateFirstStep()) {
    if (form.value.direction === "ИТ" || form.value.direction === "Б24") {
      // Для ИТ создаем заявку сразу
      await createItTicket();
    } else {
      // Для остальных направлений переходим на второй шаг
      step.value = 2;
    }
  }
};
const createItTicket = async () => {
  isLoading.value = true;
  let b64Files = [];
  let itemId = 0;

  if (form.value.files.length > 0) {
    b64Files = b64Files.concat(await codeFiles(form.value.files));
  }

  // Формируем описание заявки
  const descriptionText = [
    form.value.description,
    form.value.links.length > 0 ? `Ссылки: ${form.value.links.join(', ')}` : ''
  ].filter(Boolean).join('\n\n');

  const categoryId = form.value.direction === "ИТ" ? 103 : 105; // ID для направления ИТ

  try {
    // Создаем заявку
    await new Promise((resolve) => {
      BX24.callMethod(
        'crm.item.add', {
          entityTypeId: 172,
          fields: {
            "categoryId": categoryId,
            'ufCrm47_1706781047803': fields.value.ufCrm47_1706781047803.items.find(item => item.VALUE === form.value.direction).ID,
            'ufCrm_47_1700466732': form.value.title,
            'ufCrm47_1698839766': descriptionText,
            'ufCrm47_1698839820': b64Files,
            'ufCrm47_1770827080317': form.value.links.join(', '), //1706781277387
            '1752822542': form.value.category,
            'ufCrm47_1752752059810': form.value.subcategory ? fields.value.ufCrm47_1752752059810.items.find(item => item.VALUE === form.value.subcategory).ID : null,
            'ufCrm47_1770824397': `Направление: ${form.value.direction}\n${form.value.direction === "Б24" ? `Категория: ${form.value.category}\n` : ''}Тема: ${form.value.title}\nОписание: ${form.value.description}${form.value.links.length > 0 ? `\nСсылки: ${form.value.links.join(', ')}` : ''}`
          }
        }, (res) => {
          if (res.error()) {
            console.error(res.error());
            errorDisplay.value = res.error().description || 'Ошибка при создании заявки';
            errorDialog.value = true;
          } else {
            itemId = res.data().item.id;
          }
          resolve();
        }
      );
    });

    if (itemId) {
      // Добавляем комментарий в таймлайн
      await new Promise((resolve) => {
        BX24.callMethod(
          "crm.timeline.comment.add",
          {
            fields: {
              "ENTITY_ID": itemId,
              "ENTITY_TYPE": "DYNAMIC_172",
              "COMMENT": `Направление: ${form.value.direction}\n${form.value.direction === "Б24" ? `Категория: ${form.value.category}\n` : ''}${form.value.title ? `Тема: ${form.value.title}\n` : ''}'}\nОписание: ${form.value.description}${form.value.links.length > 0 ? `\nСсылки: ${form.value.links.join(', ')}` : ''}`,
            }
          }
        );
        resolve();
      });

      // Сбрасываем форму
          form.value = {
            direction: null,
            requestType: null,
            category: null,
            subcategory: null,
            description: '',
            links: [],
            files: [],
            isImportant: false,
          };
          
          step.value = 1;
      
      resetTouchedFields();
      newLink.value = '';
      successDialog.value = true;
    }
  } catch (error) {
    console.error('Ошибка при создании заявки для ИТ:', error);
    errorDisplay.value = 'Ошибка при создании заявки';
    errorDialog.value = true;
  } finally {
    isLoading.value = false;
  }
};

// Добавляем состояния загрузки для таблиц
const invoicesLoading = ref(false);
const tasksLoading = ref(false);

function findUserNameById(userId, usersArray) {
  const user = usersArray.find(user => user.ID == userId);
  return user ? user.FULL_NAME : 'Неизвестный';
}

function formatFullName(userData = {}) {
  const { LAST_NAME, NAME, SECOND_NAME } = userData;
  
  // Собираем все имеющиеся части имени
  const nameParts = [];
  if (LAST_NAME) nameParts.push(LAST_NAME);
  if (NAME) nameParts.push(NAME);
  if (SECOND_NAME) nameParts.push(SECOND_NAME);
  
  // Если нет ни одной части
  if (nameParts.length === 0) {
    return 'Неизвестный пользователь';
  }
  
  // Соединяем части через пробелы
  return nameParts.join(' ');
}

const fields = ref([]);
const stages = ref([]);

const handleInvoicesData = async(data) => {
  invoicesLoading.value = true;
  //pivotTableDate.value = data;
  try {
  fields.value = (await callApi("crm.item.fields", {}, [], 172)).fields;

  stages.value = await new Promise((resolve) => {
      // @ts-ignore
      BX24.callMethod("crm.status.list", {
        order: { SORT: "ASC" },
        filter: { ENTITY_ID: "DYNAMIC_172_STAGE_69" },
      }, (res) => {
        if (res.data()) {
          //stages = res.data();
          resolve(res.data());
        }
      });
    });
  calculateOverdueDeals(data);
  itemsTableDate.value = data;
  replaceIdsWithNames(data, fields.value);
    } catch (error) {
      console.error(error);
    } finally {
      invoicesLoading.value = false;
    }
}

function replaceIdsWithNames(data, fieldDefinitions) {
   data.map(item => {
    const newItem = {};

    // Проходим по всем свойствам объекта
    for (const key in item) {
      const keyMod = key.replace('_', '');

      if (keyMod.startsWith('ufCrm') && fieldDefinitions[keyMod] && fieldDefinitions[keyMod].items) {
        const fieldName = fieldDefinitions[keyMod].items.find(field => field.ID == item[key]);
        if(fieldName){
          item[key] = fieldName.VALUE;
        }
      } else if(key === "ufCrm_47_1700467583" || key === "closedate" || key === "begindate" || key === "ufCrm_47_1752010416") {
        item[key] = item[key] ? moment(item[key]).format('DD.MM.YYYY') : "";
      } else if(key === "stageId"){
        item.stageId = stages.value.find(stage => stage.STATUS_ID === item.stageId).NAME;
      } else if(key === "ufCrm_47_1700468491"){
        item.FULL_NAME = invoiceUsers.value.find(user => user.ID == item.ufCrm_47_1700468491).FULL_NAME;
      } else{
        // Оставляем другие поля как есть
        newItem[key] = item[key];
      }
    }
    
    return newItem;

  });

}
const getInvoiceTasksTime = async (invoicesData) => {

  try {
    // Собираем все ID задач из заявок
    const taskIds = invoicesData
      .map(invoice => invoice.ufCrm_47_1701780020523)
      .filter(taskId => taskId && taskId !== '' && taskId !== '0')
      .map(taskId => parseInt(taskId))
      .filter(taskId => !isNaN(taskId));

    if (taskIds.length === 0) {
      return {};
    }

    // Убираем дубликаты
    const uniqueTaskIds = [...new Set(taskIds)];

    // Получаем данные о затраченном времени для задач
    const taskTimeMap = {};
    
    // Обрабатываем задачи батчами по 50
    for (let i = 0; i < uniqueTaskIds.length; i += 50) {
      const chunk = uniqueTaskIds.slice(i, i + 50);

    const elapsedItems = await getTaskElapsedItems(
      {'TASK_ID': chunk},
      ['ID', 'TASK_ID', "SECONDS", "USER_ID", "CREATED_DATE"], 
      ''
    );

    // Создаем маппинг исполнителей заявок
    const invoiceResponsibleMap = {};
    invoicesData.forEach(invoice => {
      if (invoice.ufCrm_47_1701780020523 && invoice.ufCrm_47_1700468491) {
        invoiceResponsibleMap[invoice.ufCrm_47_1701780020523] = invoice.ufCrm_47_1700468491;
      }
    });

    // Группируем записи времени по задачам и пользователям
    const taskTimeByUser = {};
    
    elapsedItems.forEach(item => {
      const taskId = item.TASK_ID;
      const userId = item.USER_ID.toString();
      const seconds = parseInt(item.SECONDS) || 0;
      
      if (!taskTimeByUser[taskId]) {
        taskTimeByUser[taskId] = {};
      }
      
      if (!taskTimeByUser[taskId][userId]) {
        taskTimeByUser[taskId][userId] = 0;
      }
      
      taskTimeByUser[taskId][userId] += seconds;
    });

    // Рассчитываем общее время для каждой задачи (только для исполнителя заявки)
    Object.keys(taskTimeByUser).forEach(taskId => {
      const responsibleId = invoiceResponsibleMap[taskId];
      if (!responsibleId) return;

      const timeRecords = taskTimeByUser[taskId];
      
      // Суммируем время только для исполнителя заявки
      if (timeRecords[responsibleId]) {
        const totalSeconds = timeRecords[responsibleId];
        taskTimeMap[taskId] = Math.round((totalSeconds / 3600) * 100) / 100;
      } else {
        // Если у исполнителя нет записей времени, используем общее время всех пользователей
        const totalSeconds = Object.values(timeRecords).reduce((sum, sec) => sum + sec, 0);
        taskTimeMap[taskId] = Math.round((totalSeconds / 3600) * 100) / 100;
      }
    });
  }

    return taskTimeMap;
  } catch (error) {
    console.error('Ошибка при получении времени задач заявок:', error);
    return {};
  }
};
const calculateOverdueDeals = async (data) => {
  const userMap = {};
  
  // Получаем время затраченное на связанные задачи
  const taskTimeMap = await getInvoiceTasksTime(data);
  data.forEach((deal, i) => {
    const userId = deal.ufCrm_47_1700468491; // Исполнитель
    if (!userId) return;
    //deal.duration = taskTimeMap[deal.ufCrm_47_1701780020523];

    itemsTableDate.value[i].duration = taskTimeMap[deal.ufCrm_47_1701780020523] || 0;
    if (!userMap[userId]) {
      userMap[userId] = {
        userId,
        userName: findUserNameById(userId, invoiceUsers.value),
        totalDeals: 0,
        overdueCount: 0,
        closedCount: 0,
        openCount: 0,
        slaCompletedCount: 0,
        slaNotCompletedCount: 0,
        slaNotCompletedPercentage: 0,
        totalTimeSpent: 0, // В часах
        overdueTimeSpent: 0,
        overduePercentage: 0,
      };
    }
    
    userMap[userId].totalDeals++;
    
    const slaStatus = deal.ufCrm_47_1752010288013;
    if (slaStatus === 'Да') {
      userMap[userId].slaCompletedCount++;
    } else {
      userMap[userId].slaNotCompletedCount++;
    }
    
    // Проверяем статус сделки
    if (deal.stageId === "ЗАВЕРШЕНО") {
      userMap[userId].closedCount++;
    } else {
      userMap[userId].openCount++;
    }
    
    // РАСЧЕТ ВРЕМЕНИ: используем время из связанной задачи
    const taskId = deal.ufCrm_47_1701780020523;
    if (taskId && taskTimeMap[taskId]) {
      // Используем время из задачи
      userMap[userId].totalTimeSpent += taskTimeMap[taskId];
    }
    
    // Проверка на просрочку (оставляем без изменений)
    const deadline = moment(deal.ufCrm_47_1704813732503);
    const closeDate = deal.closedate ? moment(deal.closedate) : null;
    
    if (closeDate && closeDate.isAfter(deadline) && deal.stageId !== "DT172_69:SUCCESS") {
      userMap[userId].overdueCount++;
      userMap[userId].overdueTimeSpent += moment().diff(deadline) / (1000 * 60 * 60); // Конвертируем в часы
    }
  });
  
  // Преобразуем данные для вывода
  const result = Object.values(userMap).map(user => {
    const overduePercentage = user.totalDeals > 0 
      ? Math.round((user.overdueCount / user.totalDeals) * 100) 
      : 0;

    const slaNotCompletedPercentage = user.totalDeals > 0 
      ? Math.round((user.slaNotCompletedCount / user.totalDeals) * 100) 
      : 0;

    // Форматируем время в читаемый формат
    const totalTimeSpentFormatted = user.totalTimeSpent.toFixed(2);
    const overdueTimeSpentFormatted = user.overdueTimeSpent;

    return {
      ...user,
      overduePercentage,
      totalTimeSpent: totalTimeSpentFormatted,
      totalTimeSpentHours: user.totalTimeSpent, // Сохраняем числовое значение для сортировки
      overdueTimeSpent: overdueTimeSpentFormatted,
      slaNotCompletedPercentage,
    };
  });

  pivotTableDate.value = result;
};
// Options data
const directions = ref(['1С', 'Б24', 'ИТ']);

const requestTypes = ref([
  'Не работает / Сломалось',
  'Корреĸтировĸа данных / Консультация',
  'Нужен доступ',
  'Нужно изменить или доработать',
]);

const categoryOptions = ref({
  '1С': {
    'Не работает / Сломалось': [
      '[1С]: Исправление ошибок в существующем функционале',
      '[1С]: Правила обмена',
    ],
    'Корреĸтировĸа данных / Консультация': [
      '[1С]: Закрытие периода',
      '[1С]: Корректировка данных',
      '[1С]: Консультация',
      '[1С]: Обновление версий ПО',
    ],
    'Нужно изменить или доработать': [
      '[1С]: Создание или модификация отчета/расчета/справочника/документа',
      '[1С]: Печатная форма документа',
    ],
    'Нужен доступ': [
      '[1С]: Доступ к системе/разделам'
    ],
  },
  'Б24': [
    '[Б24]: CRM',
    '[Б24]: Бизнес-процессы',
    '[Б24]: Интеграции',
    '[Б24]: Другое',
  ],
  'ИТ': [
    '[ИТ]: Рабочее место',
    '[ИТ]: Печать',
    '[ИТ]: Электронная почта',
    '[ИТ]: Видеоконференцсвязь. Корпоративные чаты и мессенджеры',
    '[ИТ]: Специализированное складское и торговое оборудование',
    '[ИТ]: Удаленный рабочий стол RDP',
    '[ИТ]: Система контроля и управления доступом',
    '[ИТ]: Локальная сеть (ЛВС)',
    '[ИТ]: IT инфраструктура',
    '[ИТ]: Электронная цифровая подпись и МЧД',
    '[ИТ]: Телефония',
  ],
});
const subcategoryOptions = ref({});

// Функция для загрузки и преобразования данных подкатегорий
const loadSubcategoryOptions = async () => {
  try {
    fields.value = (await callApi("crm.item.fields", {}, [], 172)).fields;
    const subcategoryField = fields.value.ufCrm47_1752752059810;
    requestTypes.value = fields.value.ufCrm47_1772013890.items;
    categories.value = fields.value.ufCrm47_1752822542.items;

    if (!subcategoryField || !subcategoryField.items) {
      console.error('Поле подкатегорий не найдено или не содержит items');
      return;
    }

    const transformedOptions = {};
    let currentCategory = null;
    let currentOptions = [];

    subcategoryField.items.forEach(item => {
      const value = item.VALUE;
      
      // Проверяем, является ли значение категорией (содержит === ---)
      if (value.includes('=== ---')) {
        // Если у нас есть предыдущая категория, сохраняем её
        if (currentCategory && currentOptions.length > 0) {
          transformedOptions[currentCategory] = [...currentOptions];
        }
        
        // Извлекаем название категории
        currentCategory = value
          .replace(/=== ---/g, '')
          .replace(/--- ===/g, '')
          .trim();
        
        // Очищаем массив для новой категории
        currentOptions = [];
      } else if (currentCategory) {
        // Добавляем опцию к текущей категории
        currentOptions.push(value);
      }
    });

    // Добавляем последнюю категорию
    if (currentCategory && currentOptions.length > 0) {
      transformedOptions[currentCategory] = currentOptions;
    }

    subcategoryOptions.value = transformedOptions;
    
  } catch (error) {
    console.error('Ошибка при загрузке подкатегорий:', error);
    // Можно установить значения по умолчанию в случае ошибки
    subcategoryOptions.value = {
      'Рабочее место': [
        'Перемещение и переподключение',
        'Требуется помощь',
        'Установка/удаление программного обеспечения',
        // ... остальные значения по умолчанию
      ],
      // ... другие категории по умолчанию
    };
  }
};
const questions = ref({
  // Общие поля
  workStopped: null,
  errorScreenshot: [],
  errorText: '',
  workaround: '',
  
  // Для типа 2 (Нужно изменить или доработать)
  currentSituation: '',
  expectedResult: '',
  businessGoal: '',
  location: '',
  criticality: null,
  desiredDate: '',
  desiredDateReason: '',
  
  // Для типа 3 (Корректировка данных / Консультация)
  subType: null,
  whatDataIsWrong: '',
  whereDataLocated: '',
  correctionReason: '',
  correctResult: '',
  consultationLocation: '',
  alreadyTried: '',

// Для типа 4 (Нужен доступ) - новые поля
  accessRecipient: '',
  accessDatabase: '',
  accessLevel: null,
  accessObjects: '',
});

const accessLevelOptions = [
  'Просмотр',
  'Ввод',
  'Проведение',
  'Как у кого?'
];

// Опции для выбора критичности
const criticalityOptions = [
  'Блокирует',
  'Мешает',
  'Развитие функционала'
];

// Подтипы для корректировки данных
const correctionSubTypes = [
  'Очистĸа/ĸорреĸтировĸа данных',
  'Консультация'
];

// Метод для сброса подтипа при изменении
const onSubTypeChange = () => {
    resetTouchedFields();
  // Сбрасываем поля в зависимости от выбранного подтипа
  if (questions.value.subType === 'Очистĸа/ĸорреĸтировĸа данных') {
    questions.value.consultationLocation = '';
    questions.value.alreadyTried = '';
  } else if (questions.value.subType === 'Консультация') {
    questions.value.whatDataIsWrong = '';
    questions.value.whereDataLocated = '';
    questions.value.correctionReason = '';
    questions.value.correctResult = '';
  }
};

const isValid = computed(() => {
  if (form.value.direction === "1С") {
    // Проверяем обязательные поля в зависимости от типа заявки
    if (form.value.requestType === 'Не работает / Сломалось') {
      return !!(questions.value.workStopped !== null && 
               questions.value.errorText && 
               questions.value.workaround);
    }
    
    if (form.value.requestType === 'Нужно изменить или доработать') {
      return !!(questions.value.currentSituation && 
               questions.value.expectedResult && 
               questions.value.businessGoal && 
               questions.value.location && 
               questions.value.criticality &&
               questions.value.desiredDateReason);
    }
    
    if (form.value.requestType === 'Корреĸтировĸа данных / Консультация') {
      if (!questions.value.subType) return false;
      
      if (questions.value.subType === 'Очистĸа/ĸорреĸтировĸа данных') {
        return !!(questions.value.whatDataIsWrong && 
                 questions.value.whereDataLocated && 
                 questions.value.correctionReason && 
                 questions.value.correctResult);
      }
      
      if (questions.value.subType === 'Консультация') {
        return !!(questions.value.consultationLocation && 
                 questions.value.alreadyTried);
      }
      
      return false;
    }
    
    if (form.value.requestType === 'Нужен доступ') {
      return !!(questions.value.accessRecipient && 
              questions.value.accessDatabase && 
              questions.value.accessLevel &&
              questions.value.accessObjects);
    }
    
    return false;
  } else if (form.value.direction !== null && form.value.direction !== "1С") {
    return true;
  } else {
    return false;
  }
});
/*
// Computed properties
const categories = computed(() => {
  if (form.value.direction === '1С' && form.value.requestType) {
    return categoryOptions.value['1С'][form.value.requestType] || [];
  } else if (form.value.direction === '1С' && !form.value.requestType) {
    return [];
  } else {
    return categoryOptions.value[form.value.direction] || [];
  }
});
*/
const categories = ref([]);
const subcategories = computed(() => {
  if(form.value.category){
      return subcategoryOptions.value[form.value.category.replace("[ИТ]: ", "")] || [];
  }else{
    return [];
  }
});

const showContinueButton = ref(false);
const isItDirection = ref(false);

// Обновите метод onDirectionChange
const onDirectionChange = () => {
  resetTouchedFields();
  
  if (form.value.direction === "1С") {
    showContinueButton.value = true;
    isItDirection.value = false;
  } else if (form.value.direction === "ИТ") {
    showContinueButton.value = false;
    isItDirection.value = true;
  } else {
    showContinueButton.value = false;
    isItDirection.value = false;
  }

  form.value.requestType = null;
  form.value.category = null;
  form.value.subcategory = null;
};

const onRequestTypeChange = () => {
    resetTouchedFields();
  form.value.category = null;
  form.value.subcategory = null;

  if(form.value.direction === "1С" && form.value.requestType){
    showContinueButton.value = true;
  }else{
    showContinueButton.value = false;
  }
};

const onCategoryChange = () => {
  form.value.subcategory = null;
};

const addLink = () => {
  if (newLink.value) {
    form.value.links.push(newLink.value);
    newLink.value = '';
  }
};

const removeLink = (index) => {
  form.value.links.splice(index, 1);
};

//2



const urgencyOptions = [
  { title: '1 - не срочно', value: '1 - не срочно' },
  { title: '2 - срочно', value: '2 - срочно' }
];

const importanceOptions = [
  { title: '1 - менее важно', value: '1 - менее важно' },
  { title: '2 - более важно', value: '2 - более важно' }
];

const threatsOptions = [
  { title: '0 - устранение негативного влияния', value: '0 - устранение негативного влияния' },
  { title: '1 - улучшение влияет на процесс', value: '1 - улучшение влияет на процесс' },
  { title: '2 - улучшение влияет на компанию', value: '2 - улучшение влияет на компанию' }
];

//const b64Files = ref([]);

const codeFiles = async(files) => {
  let encodedFiles = [];

      try {
        for (const file of files) {
          const base64 = await fileToBase64(file);
          encodedFiles.push([file.name, base64.split(',')[1] || base64]);
        }

        return encodedFiles;
      } catch (error) {

      } finally {

      }
}

const fileToBase64 = async(file) => {
      return new Promise((resolve, reject) => {
        // Создаем Blob из данных файла
        const blob = new Blob([file], { type: file.type });
        const reader = new FileReader();
        
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        
        reader.readAsDataURL(blob);
      });
}

const resetTouchedFields = () => {
  Object.keys(touchedFields.value).forEach(key => {
    touchedFields.value[key] = false;
  });
};

const completeStepper = async() => {
  if (validateSecondStep()) {
    let itemId = 0;
    isLoading.value = true;
    let b64Files = [];

    if(form.value.files.length > 0){
      b64Files = b64Files.concat(await codeFiles(form.value.files));
    }
    if(questions.value.errorScreenshot.length > 0){
      b64Files = b64Files.concat(await codeFiles(questions.value.errorScreenshot));
    }

    // Формируем комментарий с учетом дополнительных вопросов
    const additionalQuestions = [];
    
    if (form.value.direction === '1С' && form.value.requestType) {
      additionalQuestions.push('--- ДОПОЛНИТЕЛЬНЫЕ ВОПРОСЫ ---');
      
      if (form.value.requestType === 'Не работает / Сломалось') {
        additionalQuestions.push(`Остановлена ли работа: ${questions.value.workStopped ? 'Да' : 'Нет'}`);
        if (questions.value.errorText) {
          additionalQuestions.push(`Текст ошибки: ${questions.value.errorText}`);
        }
        if (questions.value.workaround) {
          additionalQuestions.push(`Обходной путь: ${questions.value.workaround}`);
        }
      }
      
      if (form.value.requestType === 'Нужно изменить или доработать') {
        additionalQuestions.push(`Что сейчас происходит: ${questions.value.currentSituation}`);
        additionalQuestions.push(`Что должно происходить: ${questions.value.expectedResult}`);
        additionalQuestions.push(`Зачем нужно изменение: ${questions.value.businessGoal}`);
        additionalQuestions.push(`Где происходит: ${questions.value.location}`);
        additionalQuestions.push(`Критичность: ${questions.value.criticality}`);
        if (questions.value.desiredDateReason) {
          additionalQuestions.push(`Причина срока: ${questions.value.desiredDateReason}`);
        }
      }
      
      if (form.value.requestType === 'Корреĸтировĸа данных / Консультация') {
        additionalQuestions.push(`Подтип: ${questions.value.subType}`);
        
        if (questions.value.subType === 'Очистĸа/ĸорреĸтировĸа данных') {
          additionalQuestions.push(`Какие данные неверны: ${questions.value.whatDataIsWrong}`);
          additionalQuestions.push(`Где находятся данные: ${questions.value.whereDataLocated}`);
          additionalQuestions.push(`Причина корректировки: ${questions.value.correctionReason}`);
          additionalQuestions.push(`Правильный результат: ${questions.value.correctResult}`);
        }
        
        if (questions.value.subType === 'Консультация') {
          additionalQuestions.push(`Где возник вопрос: ${questions.value.consultationLocation}`);
          additionalQuestions.push(`Что уже пробовали: ${questions.value.alreadyTried}`);
        }
      }
      
      if (form.value.requestType === 'Нужен доступ') {
        additionalQuestions.push(`Кому требуется доступ: ${questions.value.accessRecipient}`);
        additionalQuestions.push(`База 1С: ${questions.value.accessDatabase}`);
        additionalQuestions.push(`Уровень доступа: ${questions.value.accessLevel}`);
        additionalQuestions.push(`Разделы/объекты: ${questions.value.accessObjects}`);
      }
    }

    const oldValues = [
      form.value.direction && `Направление: ${form.value.direction}`,
      form.value.isImportant !== undefined && `Важно[1С]: ${form.value.isImportant ? 'Да' : 'Нет'}`,
      form.value.requestType && `Тип заявки: ${fields.value.ufCrm47_1751371044498.items[fields.value.ufCrm47_1772013890.items.findIndex(item => item.VALUE === form.value.requestType)].VALUE}`,
      form.value.title && `Тема: ${form.value.title}`,
      form.value.category && `Категория: ${form.value.category}`,
      form.value.subcategory && `Подкатегория: ${form.value.subcategory}`,
      form.value.description && `Описание: ${form.value.description}`,
      form.value.links.length > 0 && `Ссылки: ${form.value.links.join(', ')}`,
      project.value && `Проект[1С]: ${project.value}`,
      urgency.value && `Срочность[1С]: ${urgency.value}`,
      importance.value && `Важность[1С]: ${importance.value}`,
      threatsOpportunities.value && `Угрозы/Возможности[1С]: ${threatsOpportunities.value}`,
      ...additionalQuestions
    ]
    .filter(Boolean)
    .join('\n');

    const categoryId = (() => {
      switch(form.value.direction) {
        case '1С':   return 101;
        case 'ИТ':   return 103;
        case 'Б24':  return 105;
        default:     return 69;
      }
    })();

    await new Promise((resolve) => {
      BX24.callMethod(
        'crm.item.add', {
          entityTypeId: 172,
          fields: {
            "categoryId": categoryId,
            'ufCrm_47_1700466732': form.value.title,
            'ufCrm47_1752822542': form.value.category ? form.value.category.indexOf("[Б24]: ") >= 0 ? fields.value.ufCrm47_1752822542.items.find(item => item.VALUE === form.value.category.replace("[Б24]: ", "")).ID : null : null,
            'ufCrm47_1752752059810': form.value.subcategory ? fields.value.ufCrm47_1752752059810.items.find(item => item.VALUE === form.value.subcategory).ID : null,
            'ufCrm47_1752822806': form.value.category ? form.value.category.indexOf("[ИТ]: ") >= 0 ? fields.value.ufCrm47_1752822806.items.find(item => item.VALUE === form.value.category.replace("[ИТ]: ", "")).ID : null : null,
            'ufCrm47_1752751229696': form.value.category ? form.value.category.indexOf("[1С]: ") >= 0 ? fields.value.ufCrm47_1752751229696.items.find(item => item.VALUE === form.value.category.replace("[1С]: ", "")).ID : null : null,
            "ufCrm47_1706781047803": form.value.direction ? fields.value.ufCrm47_1706781047803.items.find(item => item.VALUE === form.value.direction).ID : null,
            'ufCrm47_1698839820': b64Files,
            'ufCrm47_1751371044498': fields.value.ufCrm47_1751371044498.items[fields.value.ufCrm47_1772013890.items.findIndex(item => item.VALUE === form.value.requestType)].ID,
            'ufCrm47_1698839766': form.value.description,
            'ufCrm47_1772013890': form.value.requestType ? fields.value.ufCrm47_1772013890.items.find(item => item.VALUE === form.value.requestType).ID : null,
            'ufCrm47_1752218749933': importance.value ? fields.value.ufCrm47_1752218749933.items.find(item => item.VALUE === importance.value).ID : null,
            'ufCrm47_1752218774249': urgency.value ? fields.value.ufCrm47_1752218774249.items.find(item => item.VALUE === urgency.value).ID : null,
            'ufCrm47_1752218834398': threatsOpportunities.value ? fields.value.ufCrm47_1752218834398.items.find(item => item.VALUE === threatsOpportunities.value).ID : null,
            'ufCrm47_1752218606665': project.value,
            'ufCrm47_1770827080317': form.value.links.join(', '),
            'ufCrm47_1770824397': oldValues,
          }
        }, (res) => {
          form.value = {
            direction: null,
            requestType: null,
            category: null,
            subcategory: null,
            title: '',
            description: '',
            links: [],
            files: [],
            isImportant: false,
          };
          
          // Сбрасываем дополнительные вопросы
          questions.value = {
            workStopped: null,
            errorScreenshot: [],
            errorText: '',
            workaround: '',
            currentSituation: '',
            expectedResult: '',
            businessGoal: '',
            location: '',
            criticality: null,
            desiredDate: '',
            desiredDateReason: '',
            subType: null,
            whatDataIsWrong: '',
            whereDataLocated: '',
            correctionReason: '',
            correctResult: '',
            consultationLocation: '',
            alreadyTried: '',
            accessRecipient: '',
            accessDatabase: '',
            accessLevel: null,
            accessObjects: '',
          };
          
          step.value = 1;
          resetTouchedFields();
          newLink.value = '';
          project.value = '';
          urgency.value = null;
          importance.value = null;
          threatsOpportunities.value = null;
          itemId = res.data().item.id;
          resolve();
        }
      )
    });

    await new Promise((resolve) => {
      BX24.callMethod(
        "crm.timeline.comment.add",
        {
          fields: {
            "ENTITY_ID": itemId,
            "ENTITY_TYPE": "DYNAMIC_172",
            "COMMENT": oldValues,
          }
        }
      );
      resolve();
    });
    
    successDialog.value = true;
  }
  isLoading.value = false;
};

const showVideo = ref(false);
const videoPlayer = ref(null);
const videoSrc = ref('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
const videoPoster = ref('https://peach.blender.org/wp-content/uploads/bbb-splash.png');

// При закрытии диалога останавливаем видео
watch(showVideo, (newVal) => {
  if (!newVal && videoPlayer.value) {
    videoPlayer.value.pause();
  }
});
const users = ref([]);
const currentUser = ref(0);

onMounted(async() => {
  isLoading.value = true;
  try {
    await Promise.all([
      loadInvoiceUsers(),
      loadTaskUsers(),
      loadSubcategoryOptions(),
    ]);

BX24.init(function () {
    const domain = BX24.getDomain();
});
await new Promise((resolve) => {
BX24.callMethod(
    "user.current",
    {},
    function(result)
    {
        if(result.error())
            console.error(result.error());
        else
            currentUser.value = result.data().ID;
          resolve();
    }
);
});
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
  } finally {
    isLoading.value = false;
  }
});
const invoiceUsers = ref([]); // Пользователи для отчета по заявкам
const taskUsers = ref([]);    // Пользователи для отчета по задачам
const loadTaskUsers = async () => {
  try {
    const usersData = await callApi(
      "user.get",
      { "ID": [13063, 8951, 489, 9731, 320, 10051, 12031, 9097, 12181, 12603, 12993, 14087, 15401] },
      [],
      0,
      0,
      0
    );
    
    taskUsers.value = usersData.map(user => ({
      ID: user.ID,
      FULL_NAME: `${user.LAST_NAME || ''} ${user.NAME || ''} ${user.SECOND_NAME || ''}`.trim(),
      NAME: user.NAME,
      LAST_NAME: user.LAST_NAME,
      SECOND_NAME: user.SECOND_NAME,
      EMAIL: user.EMAIL,
      WORK_POSITION: user.WORK_POSITION
    }));
  } catch (error) {
    console.error('Ошибка загрузки пользователей для задач:', error);
    taskUsers.value = [];
  }
};
// Функция для загрузки пользователей для отчета по заявкам
const loadInvoiceUsers = async () => {
  try {
    const usersData = await new Promise((resolve, reject) => {
      BX24.callMethod(
        "user.get",
        {
          "ID": [10051, 11307, 12031, 12603, 12181],
        },
        function(result) {
          if (result.error()) {
            reject(result.error());
          } else {
            resolve(result.data());
          }
        }
      );
    });
    
    invoiceUsers.value = usersData.map(user => ({
      ...user,
      FULL_NAME: formatFullName(user)
    }));
  } catch (error) {
    console.error('Ошибка загрузки пользователей для заявок:', error);
    invoiceUsers.value = [];
  }
};

const getSummary = (userName) => pivotTableDate.value.find(u => u.userName === userName) || {
  openCount: 0,
  closedCount: 0,
  totalDeals: 0,
  slaCompletedCount: 0,    // Добавляем по умолчанию
  slaNotCompletedCount: 0, // Добавляем по умолчанию
  slaNotCompletedPercentage: 0, // Добавляем значение по умолчанию
  totalTimeSpent: '0 дней 0 часов 0 минут',
  overdueCount: 0,
  overduePercentage: 0,
  overdueTimeSpent: '0 дней 0 часов 0 минут'
};

// Добавляем новые переменные для управления отчетами
const reportsDialog = ref(false);
const report1Dialog = ref(false);
const report2Dialog = ref(false);
const selectedReport = ref(null);

const reports = ref([
  {
    id: 1,
    title: 'Отчет по заявкам категории ИТ',
    description: 'Детальная статистика по заявкам ИТ категории',
    icon: 'mdi-chart-pie'
  },
    {
    id: 3,
    title: '3. Отчет по задачам категории ИТ',
    description: 'Количество задач и затраченное время с фильтрами',
    icon: 'mdi-chart-bar'
  },
  {
    id: 4,
    title: '1. Отчет по просроченным задачам',
    description: 'Выполненные задачи с SLA и направлениями',
    icon: 'mdi-view-dashboard-outline'
  },
  {
    id: 5,
    title: '2. Отчет по приему задач-тиĸетов',
    description: 'Принятые тикеты с SLA по направлениям',
    icon: 'mdi-ticket-confirmation-outline'
  },
  {
    id: 2,
    title: '3. Отчет по затраченному времени',
    description: 'Затраченное время на задачи по ответственному',
    icon: 'mdi-clock-outline'
  },
  {
    id: 6,
    title: '4. Отчт по поставленным и выполненным задачам',
    description: 'Трудозатраты по постановщикам и типам',
    icon: 'mdi-chart-timeline-variant'
  },
  {
    id: 7,
    title: '5. Отчет по жизненному циĸлу задач',
    description: 'Тип, категория, сроки по задаче и элементу смарт-процесса',
    icon: 'mdi-timeline-clock-outline'
  }
]);

const canAccessReports4to7 = computed(() =>
  REPORTS_4_7_ALLOWED_USER_IDS.has(String(currentUser.value ?? ''))
);

/** Карточки отчётов 4–7 скрыты, если пользователь не в белом списке */
const visibleReports = computed(() => {
  const hiddenReportIds = new Set([1, 3]);
  const baseReports = reports.value.filter((r) => !hiddenReportIds.has(r.id));
  if (canAccessReports4to7.value) {
    return baseReports;
  }
  return baseReports.filter((r) => r.id <= 3);
});

const report3Dialog = ref(false);
const newReportsDialog = ref(false);
const tasksDetailedTableDate = ref([]);
const tasksDetailedLoading = ref(false);

/** Рабочая группа задач: фильтр `tasks.task.list` только в новых отчётах (пункты меню 4–7), не в отчётах через TheForm */
const NEW_REPORT_GROUP_ID = 517;
const NEW_REPORT_ENTITY_ID = 172;
const NEW_REPORT_TASK_LINK_FIELD = 'ufCrm47_1701780020523';
/** Отчёты 4–7 в меню: только эти пользователи (id из Bitrix24) */
const REPORTS_4_7_ALLOWED_USER_IDS = new Set(['9097', '8639', '320', '8951', '5726', '12031', '12993']);
const NEW_REPORT_RESPONSIBLE_IDS = ['9097', '12993', '14087', '489', '15401', '12181', '13063', '12031'];
const newReportTab = ref('1');
const newReportsLoading = ref(false);
const newReportResponsibles = ref([]);
const newReportDirections = ref(['1С', 'Б24', 'ИТ', 'Без направления']);
const newReportSelectedResponsibles = ref([]);
const newReportSelectedDirections = ref(['1С', 'Б24', 'ИТ', 'Без направления']);

const newReportRows = ref([]);
const newReportSummary = ref({
  completed: 0,
  overdue: 0,
  onTimePercent: 0,
  report3DurationLabel: '—',
  report4AvgAcceptLabel: '—',
  report4AvgAcceptMs: null,
  report4AvgCompleteLabel: '—',
  report4AvgByTaskType: [],
  report4AvgByCategory: [],
  text: ''
});

const newReportDateShowInput = ref([false, false, false, false, false, false, false]);

/** Как в Date.vue (пресет «Текущая неделя») — единый дефолт периода для новых отчётов */
const getIsoRangeForCurrentWeek = () => {
  const d0 = moment().startOf('week').add(1, 'days');
  const d1 = moment().endOf('week').add(36, 'hours');
  return [d0.clone().subtract(12, 'hours').toISOString(), d1.clone().add(12, 'hours').toISOString()];
};

const newReportSelectedDateIso = ref(getIsoRangeForCurrentWeek());

const onNewReportDateSend = (value) => {
  if (!Array.isArray(value)) {
    return;
  }
  newReportSelectedDateIso.value = value;
  if (value[0] != null && value[0] !== '' && value[1] != null && value[1] !== '') {
    sessionStorage.setItem('date', `${value[0]},${value[1]}`);
  }
};

const newReportLabels = computed(() => {
  if (newReportTab.value === '2') {
    return { completed: 'Принятые тикеты', overdue: 'Принятые невовремя', onTime: 'Принято вовремя' };
  }
  if (newReportTab.value === '3') {
    return { completed: 'Задач в отчёте', overdue: 'Суммарные трудозатраты', onTime: 'По полям группировки' };
  }
  return { completed: 'Выполненные задачи', overdue: 'Просроченные задачи', onTime: 'Выполнено вовремя' };
});

/** Заголовок диалога совпадает с названием в меню отчётов: вкладка «1» → пункт id 4 и т.д. */
const newReportDialogTitle = computed(() => {
  const menuId = Number(newReportTab.value) + 3;
  const r = reports.value.find((x) => x.id === menuId);
  return r?.title || 'Отчет';
});

const newReportHeaders = computed(() => {
  if (newReportTab.value === '3') {
    return [
      { title: 'Постановщик', value: 'responsibleName', sortable: true },
      { title: 'Дата создания', value: 'createdDateFormatted', sortable: true },
      { title: 'Подразделение постановщика', value: 'department', sortable: true },
      { title: 'Тип задачи', value: 'taskType', sortable: true },
      { title: 'Категория задачи', value: 'category', sortable: true },
      { title: 'Описание задачи', value: 'taskDescriptionDisplay', sortable: false },
      { title: 'Суммарные трудозатраты', value: 'durationLabel', sortable: true },
      { title: 'Направление', value: 'direction', sortable: true },
    ];
  }
  if (newReportTab.value === '4') {
    return [
      { title: 'Тип', value: 'taskType', sortable: true },
      { title: 'Категория', value: 'category', sortable: true },
      { title: 'Описание задачи', value: 'taskDescriptionDisplay', sortable: false },
      { title: 'Дата и время постановки задачи', value: 'crmPostanovkaLabel', sortable: true },
      { title: 'Дата и время принятия задачи', value: 'crmAcceptanceLabel', sortable: true },
      { title: 'Дата и время выполнения задачи', value: 'crmExecutionLabel', sortable: true },
      { title: 'Дата и время закрытия задачи', value: 'taskClosedAtLabel', sortable: true },
      { title: 'Срок принятия задачи', value: 'acceptDurationLabel', sortable: true },
      { title: 'Срок выполнения задачи', value: 'completeDurationLabel', sortable: true },
      { title: 'Направление', value: 'direction', sortable: true },
    ];
  }
  return [
    { title: newReportTab.value === '2' ? 'Аналитик' : 'Исполнитель', value: 'responsibleName', sortable: true },
    { title: newReportTab.value === '2' ? 'Тикет' : 'Описание', value: 'title', sortable: true },
    { title: newReportTab.value === '2' ? 'SLA выполнен' : 'Закрыта в срок', value: 'onTimeLabel', sortable: true },
    { title: newReportTab.value === '2' ? 'Дата/Время приемки' : 'Дата закрытия', value: 'closedDateLabel', sortable: true },
    { title: newReportTab.value === '2' ? 'Дата создания' : 'Крайний срок', value: 'deadlineLabel', sortable: true },
    { title: 'Направление', value: 'direction', sortable: true },
  ];
});

const newReportTableGroupBy = computed(() => {
  if (newReportTab.value === '3') {
    // Группировка по постановщику
    return [
      { key: 'responsibleName', order: 'asc' },
    ];
  }
  if (newReportTab.value === '4') {
    return [
      { key: 'taskType', order: 'asc' },
    ];
  }
  return [{ key: 'responsibleName', order: 'asc' }];
});

const normalizeCallApiList = (payload, key) => {
  if (Array.isArray(payload)) {
    const nested = payload.some((entry) => entry && Array.isArray(entry[key]));
    if (nested) {
      return payload.flatMap((entry) => (Array.isArray(entry?.[key]) ? entry[key] : []));
    }
    return payload;
  }
  if (payload && Array.isArray(payload[key])) {
    return payload[key];
  }
  return [];
};

const getNewReportDateRange = () => {
  const isoPair = newReportSelectedDateIso.value;
  if (Array.isArray(isoPair) && isoPair[0] && isoPair[1]) {
    const fromM = moment(isoPair[0]);
    const toM = moment(isoPair[1]);
    if (fromM.isValid() && toM.isValid()) {
      const dateFrom = fromM.format('YYYY-MM-DD');
      const dateTo = toM.format('YYYY-MM-DD');
      if (moment(dateFrom).isAfter(moment(dateTo))) {
        return { dateFrom: dateTo, dateTo: dateFrom };
      }
      return { dateFrom, dateTo };
    }
  }

  const rawRange = sessionStorage.getItem('date') || '';
  if (!rawRange) {
    const [a, b] = getIsoRangeForCurrentWeek();
    const fromM = moment(a);
    const toM = moment(b);
    return {
      dateFrom: fromM.format('YYYY-MM-DD'),
      dateTo: toM.format('YYYY-MM-DD'),
    };
  }

  const commaIdx = rawRange.indexOf(',');
  if (commaIdx === -1) {
    const [a, b] = getIsoRangeForCurrentWeek();
    const fromM = moment(a);
    const toM = moment(b);
    return {
      dateFrom: fromM.format('YYYY-MM-DD'),
      dateTo: toM.format('YYYY-MM-DD'),
    };
  }
  const rawFrom = rawRange.slice(0, commaIdx).trim();
  const rawTo = rawRange.slice(commaIdx + 1).trim();
  const from = rawFrom ? rawFrom.split('T')[0] : '';
  const to = rawTo ? rawTo.split('T')[0] : '';

  if (from && to) {
    if (moment(from).isAfter(moment(to))) {
      return { dateFrom: to, dateTo: from };
    }
    return { dateFrom: from, dateTo: to };
  }

  const [a, b] = getIsoRangeForCurrentWeek();
  const fromM = moment(a);
  const toM = moment(b);
  return {
    dateFrom: fromM.format('YYYY-MM-DD'),
    dateTo: toM.format('YYYY-MM-DD'),
  };
};

const normalizeDirectionFromCategory = (categoryId) => {
  if (String(categoryId) === '101') return '1С';
  if (String(categoryId) === '103') return 'ИТ';
  if (String(categoryId) === '105') return 'Б24';
  return 'Без направления';
};

const loadNewReportResponsibles = async () => {
  const usersData = await callApi('user.get', { ID: NEW_REPORT_RESPONSIBLE_IDS }, [], 0, 0, 0);
  const normalized = (Array.isArray(usersData) ? usersData : []).map((user) => ({
    id: String(user.ID),
    name: `${user.LAST_NAME || ''} ${user.NAME || ''} ${user.SECOND_NAME || ''}`.trim() || `ID ${user.ID}`,
  }));
  normalized.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  newReportResponsibles.value = normalized;
  newReportSelectedResponsibles.value = normalized.map((u) => u.id);
};

const loadLinkedItemsByTaskIds = async (taskIds, dateFilter = {}) => {
  const taskSet = new Set(taskIds.map((taskId) => String(taskId)));
  const linked = {};
  const rawItems = await callApi(
    'crm.item.list',
    dateFilter,
    ['id', 'categoryId', NEW_REPORT_TASK_LINK_FIELD],
    NEW_REPORT_ENTITY_ID,
    0,
    0
  );
  const items = normalizeCallApiList(rawItems, 'items');

  items.forEach((item) => {
    const raw = item?.[NEW_REPORT_TASK_LINK_FIELD];
    const linkedTaskIds = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    linkedTaskIds.forEach((taskId) => {
      const key = String(taskId);
      if (taskSet.has(key) && !linked[key]) {
        linked[key] = item;
      }
    });
  });

  taskSet.forEach((taskId) => {
    if (!linked[taskId]) {
      linked[taskId] = null;
    }
  });

  return linked;
};

/** CRM по задаче: один вызов crm.item.list — в filter все ID задач в поле связи. Ответ — массив или { items }. */
const loadLinkedCrmItemsByTaskIds = async (taskIds, extraSelect = []) => {
  const linked = {};
  const taskSet = new Set(taskIds.map((id) => String(id)));
  taskIds.forEach((id) => {
    linked[String(id)] = null;
  });
  const select = [...new Set(['id', 'categoryId', NEW_REPORT_TASK_LINK_FIELD, ...extraSelect])];
  const ids = [...taskSet];
  if (!ids.length) {
    return linked;
  }

  const mergeCrmBatch = (batch) => {
    const list = Array.isArray(batch) ? batch : [];
    list.forEach((item) => {
      const raw = item?.[NEW_REPORT_TASK_LINK_FIELD];
      const linkedTaskIds = Array.isArray(raw) ? raw : (raw != null && raw !== '' ? [raw] : []);
      linkedTaskIds.forEach((taskId) => {
        const key = String(taskId);
        if (taskSet.has(key) && !linked[key]) {
          linked[key] = item;
        }
      });
    });
  };

  const rawItems = await callApi(
    'crm.item.list',
    { [NEW_REPORT_TASK_LINK_FIELD]: ids.map((id) => (Number.isNaN(Number(id)) ? id : Number(id))) },
    select,
    NEW_REPORT_ENTITY_ID,
    0,
    0
  );
  mergeCrmBatch(normalizeCallApiList(rawItems, 'items'));

  return linked;
};

const loadNewReportTasks = async (filter, select) => {
  const raw = await callApi('tasks.task.list', filter, select, null, 0, 0);
  return normalizeCallApiList(raw, 'tasks');
};

const loadNewReportItems = async (filter, select) => {
  const raw = await callApi('crm.item.list', filter, select, NEW_REPORT_ENTITY_ID, 0, 0);
  return normalizeCallApiList(raw, 'items');
};

const handleNewReportsDateSelected = async () => {
  if (!newReportsDialog.value) {
    return;
  }
  await loadNewReport();
};

const getSlaEnumMap = () => {
  const items = fields.value?.ufCrm47_1752010288013?.items || [];
  return items.reduce((acc, item) => {
    acc[String(item.ID)] = item.VALUE;
    return acc;
  }, {});
};

/** Базовый URL портала Bitrix24; в приложении из BX24 — иначе origin окна */
const getPortalUrl = () => {
  try {
    if (typeof BX24 !== 'undefined' && typeof BX24.getDomain === 'function') {
      const domain = BX24.getDomain();
      const host = String(domain ?? '')
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/\/+$/, '');
      if (host) {
        return `https://${host}/`;
      }
    }
  } catch {
    /* BX24 недоступен (тесты / вне iframe) */
  }
  return `${window.location.origin}/`;
};

const buildReport1 = async () => {
  const { dateFrom, dateTo } = getNewReportDateRange();
  const selectedResponsibles = new Set(newReportSelectedResponsibles.value.map(String));
  const selectedDirections = new Set(newReportSelectedDirections.value);
  const responsibleIds = selectedResponsibles.size ? [...selectedResponsibles] : [null];
  const tasksById = {};

  for (const responsibleId of responsibleIds) {
    const filter = {
      GROUP_ID: NEW_REPORT_GROUP_ID,
      STATUS: 5,
      '>=CLOSED_DATE': `${dateFrom}T00:00:00+05:00`,
      '<=CLOSED_DATE': `${dateTo}T23:59:59+05:00`,
    };
    if (responsibleId) {
      filter.RESPONSIBLE_ID = responsibleId;
    }
    const tasks = await loadNewReportTasks(
      filter,
      ['id', 'title', 'responsibleId', 'responsibleName', 'responsibleLastName', 'responsibleSecondName', 'closedDate', 'deadline', 'groupId']
    );
    tasks.forEach((task) => {
      tasksById[String(task.id)] = task;
    });
  }

  const rawTasks = Object.values(tasksById);
  const usersById = {};
  newReportResponsibles.value.forEach((user) => {
    usersById[user.id] = user.name;
  });
  const linkedMap = await loadLinkedItemsByTaskIds(rawTasks.map((task) => task.id), {
    '>=createdTime': `${dateFrom}T00:00:00+05:00`,
    '<=createdTime': `${dateTo}T23:59:59+05:00`,
  });
  const rows = [];

  rawTasks.forEach((task) => {
    const taskId = String(task.id);
    const closedAt = task.closedDate ? moment(task.closedDate) : null;
    if (!closedAt || !closedAt.isValid()) {
      return;
    }

    const direction = normalizeDirectionFromCategory(linkedMap[taskId]?.categoryId);
    if (selectedDirections.size && !selectedDirections.has(direction)) {
      return;
    }

    const deadline = task.deadline ? moment(task.deadline) : null;
    const onTime = deadline && deadline.isValid() ? !closedAt.isAfter(deadline) : true;
    const responsibleId = String(task.responsibleId || '');
    const fallbackName = `${task.responsibleLastName || ''} ${task.responsibleName || ''} ${task.responsibleSecondName || ''}`.trim();
    const responsibleName = usersById[responsibleId] || fallbackName || `ID ${responsibleId}`;

    rows.push({
      taskId,
      title: String(task.title || ''),
      taskUrl: `${getPortalUrl()}workgroups/group/${task.groupId || NEW_REPORT_GROUP_ID}/tasks/task/view/${taskId}/`,
      responsibleName,
      closedDateLabel: closedAt.format('DD.MM.YYYY HH:mm'),
      deadlineLabel: deadline && deadline.isValid() ? deadline.format('DD.MM.YYYY HH:mm') : '—',
      onTime,
      onTimeLabel: onTime ? 'Да' : 'Нет',
      direction,
    });
  });

  rows.sort((a, b) => a.responsibleName.localeCompare(b.responsibleName, 'ru'));
  newReportRows.value = rows;

  const completed = rows.length;
  const overdue = rows.filter((row) => !row.onTime).length;
  const onTime = completed - overdue;
  const onTimePercent = completed ? Math.round((onTime / completed) * 1000) / 10 : 0;
  newReportSummary.value = {
    completed,
    overdue,
    onTimePercent,
    report3DurationLabel: '—',
    report4AvgAcceptLabel: '—',
    report4AvgAcceptMs: null,
    report4AvgCompleteLabel: '—',
    report4AvgByTaskType: [],
    report4AvgByCategory: [],
    text: `За период выполнено ${completed} задач, из них ${onTime} вовремя и ${overdue} с просрочкой.`,
  };
};

const buildReport2 = async () => {
  const { dateFrom, dateTo } = getNewReportDateRange();
  const selectedDirections = new Set(newReportSelectedDirections.value);
  const slaMap = getSlaEnumMap();
  const items = await loadNewReportItems(
    {
      '>=createdTime': `${dateFrom}T00:00:00+05:00`,
      '<=createdTime': `${dateTo}T23:59:59+05:00`,
    },
    ['id', 'title', 'createdTime', 'categoryId', 'ufCrm47_1698840090', 'ufCrm47_1752010288013', 'ufCrm47_1700467615', 'ufCrm47_1740575330', 'ufCrm47_1770827080317']
  );

  const analystIds = [...new Set(items.map((item) => String(item.ufCrm47_1698840090 || '')).filter(Boolean))];
  const users = await callApi('user.get', { ID: analystIds }, [], 0, 0, 0);
  const usersById = {};
  (Array.isArray(users) ? users : []).forEach((user) => {
    usersById[String(user.ID)] = `${user.LAST_NAME || ''} ${user.NAME || ''} ${user.SECOND_NAME || ''}`.trim() || `ID ${user.ID}`;
  });

  const rows = [];
  items.forEach((item) => {
    const direction = normalizeDirectionFromCategory(item.categoryId);
    if (selectedDirections.size && !selectedDirections.has(direction)) {
      return;
    }
    const createdAt = item.createdTime ? moment(item.createdTime) : null;
    if (!createdAt || !createdAt.isValid()) {
      return;
    }
    const acceptedAt = item.ufCrm47_1700467615 ? moment(item.ufCrm47_1700467615) : null;
    const analystId = String(item.ufCrm47_1698840090 || '');
    const analystName = usersById[analystId] || 'Без аналитика';
    const rawTitle = Array.isArray(item.ufCrm47_1770827080317) ? String(item.ufCrm47_1770827080317[0] || '') : String(item.ufCrm47_1770827080317 || '');
    const title = rawTitle && !rawTitle.startsWith('http') && !rawTitle.startsWith('[http') ? rawTitle : String(item.title || '');
    const taskUrl = String(item.ufCrm47_1740575330 || '') || `${getPortalUrl()}page/servicedesk_test/servis_desk_2/type/${NEW_REPORT_ENTITY_ID}/details/${item.id}/`;
    const slaLabel = slaMap[String(item.ufCrm47_1752010288013 || '')] || 'Нет';
    const onTime = slaLabel === 'Да';

    rows.push({
      taskId: String(item.id),
      title,
      taskUrl,
      responsibleName: analystName,
      closedDateLabel: acceptedAt && acceptedAt.isValid() ? acceptedAt.format('DD.MM.YYYY HH:mm') : '—',
      deadlineLabel: createdAt.format('DD.MM.YYYY HH:mm'),
      onTime,
      onTimeLabel: onTime ? 'Да' : 'Нет',
      direction,
    });
  });

  rows.sort((a, b) => a.responsibleName.localeCompare(b.responsibleName, 'ru'));
  newReportRows.value = rows;

  const completed = rows.length;
  const overdue = rows.filter((row) => !row.onTime).length;
  const onTime = completed - overdue;
  const onTimePercent = completed ? Math.round((onTime / completed) * 1000) / 10 : 0;
  newReportSummary.value = {
    completed,
    overdue,
    onTimePercent,
    report3DurationLabel: '—',
    report4AvgAcceptLabel: '—',
    report4AvgAcceptMs: null,
    report4AvgCompleteLabel: '—',
    report4AvgByTaskType: [],
    report4AvgByCategory: [],
    text: `За период принято ${completed} тикетов, из них ${onTime} вовремя и ${overdue} невовремя.`,
  };
};

const stripHtmlForReport = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const pickTaskUserField = (task, ...candidates) => {
  for (const key of candidates) {
    const v = task?.[key];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '—';
};

/** Справочник UF в tasks.task.* может прийти строкой или объектом перечисления */
const normalizeUfScalar = (v) => {
  if (v == null) {
    return null;
  }
  if (typeof v === 'object') {
    const inner = v.VALUE ?? v.value ?? v.NAME ?? v.name ?? v.text;
    if (inner != null && String(inner).trim() !== '') {
      return String(inner).trim();
    }
    return null;
  }
  const s = String(v).trim();
  return s !== '' ? s : null;
};

/**
 * Пользовательское поле задачи по числовому суффиксу Bitrix (929760312277 и т.д.).
 * В ответе REST ключи часто отличаются: UF_AUTO_*, ufAuto*, сканирование по ключам.
 */
const pickTaskUfByNumericId = (task, numericId) => {
  if (!task || typeof task !== 'object') {
    return null;
  }
  const id = String(numericId);
  const direct = [`UF_AUTO_${id}`, `ufAuto${id}`, `UfAuto${id}`, `uf_auto_${id}`];
  for (const k of direct) {
    const s = normalizeUfScalar(task[k]);
    if (s) {
      return s;
    }
  }
  for (const k of Object.keys(task)) {
    if (!k.includes(id)) {
      continue;
    }
    if (!/uf|UF|Uf/i.test(k)) {
      continue;
    }
    const s = normalizeUfScalar(task[k]);
    if (s) {
      return s;
    }
  }
  return null;
};

const taskUfDisplay = (task, numericId) => pickTaskUfByNumericId(task, numericId) ?? '—';

/** Bitrix отдаёт поля в разном регистре / алиасах */
const getTaskCreatedRaw = (task) =>
  task?.createdDate ?? task?.CREATED_DATE ?? task?.dateStart ?? null;

const getTaskClosedRaw = (task) => task?.closedDate ?? task?.CLOSED_DATE ?? null;

const getTaskTitleRaw = (task) => String(task?.title ?? task?.TITLE ?? '').trim();

const getTaskDescriptionRaw = (task) =>
  task?.description ?? task?.DESCRIPTION ?? '';

/** Поля смарт-процесса (элемент CRM), привязанного к задаче */
const LIFECYCLE_UF_POSTANOVKA = ['ufCrm47_1700467583', 'UF_CRM_47_1700467583', 'ufCrm_47_1700467583'];
const LIFECYCLE_UF_ACCEPT = ['ufCrm47_1700467615', 'UF_CRM_47_1700467615', 'ufCrm_47_1700467615'];
const LIFECYCLE_UF_EXEC = ['ufCrm47_1700467652', 'UF_CRM_47_1700467652', 'ufCrm_47_1700467652'];

const pickCrmRaw = (crmItem, keys, tailHint = null) => {
  if (!crmItem) return null;
  for (const k of keys) {
    const v = crmItem[k];
    if (v != null && String(v).trim() !== '') {
      return v;
    }
  }
  if (tailHint) {
    for (const k of Object.keys(crmItem)) {
      if (!k.includes(tailHint)) {
        continue;
      }
      const v = crmItem[k];
      if (v != null && String(v).trim() !== '') {
        return v;
      }
    }
  }
  return null;
};

const formatDurationFromMs = (ms) => {
  if (ms == null || !Number.isFinite(ms) || ms < 0) {
    return '—';
  }
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} ч ${m} мин`;
};

const averagePositiveMs = (values) => {
  const valid = values.filter((x) => x != null && Number.isFinite(x) && x >= 0);
  if (!valid.length) {
    return null;
  }
  return valid.reduce((a, b) => a + b, 0) / valid.length;
};

/** Порог для окраски «Среднее время принятия»: до 2 ч включ. — зелёный, иначе красный */
const REPORT4_ACCEPT_SLA_MS = 2 * 60 * 60 * 1000;

const report4AvgAcceptClass = (avgAcceptMs) => {
  if (avgAcceptMs == null || !Number.isFinite(avgAcceptMs)) {
    return '';
  }
  return avgAcceptMs <= REPORT4_ACCEPT_SLA_MS ? 'text-success' : 'text-error';
};

/** Средние по acceptDurationMs / completeDurationMs для отчёта «Жизненный цикл» (группировка в таблице — другая величина) */
const computeReport4AvgByField = (rows, field) => {
  const map = new Map();
  for (const row of rows) {
    const raw = row[field];
    const label = raw != null && String(raw).trim() !== '' ? String(raw).trim() : '—';
    if (!map.has(label)) {
      map.set(label, { acceptMs: [], completeMs: [] });
    }
    const b = map.get(label);
    if (row.acceptDurationMs != null && Number.isFinite(row.acceptDurationMs) && row.acceptDurationMs >= 0) {
      b.acceptMs.push(row.acceptDurationMs);
    }
    if (row.completeDurationMs != null && Number.isFinite(row.completeDurationMs) && row.completeDurationMs >= 0) {
      b.completeMs.push(row.completeDurationMs);
    }
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'ru'))
    .map(([label, { acceptMs, completeMs }]) => {
      const avgAcceptMs = averagePositiveMs(acceptMs);
      const avgCompleteMs = averagePositiveMs(completeMs);
      return {
        label,
        avgAcceptMs,
        avgAcceptLabel: formatDurationFromMs(avgAcceptMs),
        avgCompleteLabel: formatDurationFromMs(avgCompleteMs),
      };
    });
};

const countReport4GroupRows = (group) => {
  let n = 0;
  const walk = (g) => {
    if (!g?.items) {
      return;
    }
    for (const child of g.items) {
      if (child.type === 'group') {
        walk(child);
      } else if (child.raw) {
        n++;
      }
    }
  };
  walk(group);
  return n;
};

/** durationFact — минуты; timeSpentInLogs — секунды по журналу */
const getTaskDurationMinutes = (task) => {
  const df = Number(task?.durationFact);
  if (Number.isFinite(df) && df > 0) {
    return Math.round(df);
  }
  const sec = Number(task?.timeSpentInLogs);
  if (Number.isFinite(sec) && sec > 0) {
    return Math.round(sec / 60);
  }
  return 0;
};

const formatReport3CreatorName = (task) => {
  const fromFields = `${task?.createdByLastName || ''} ${task?.createdByName || ''} ${task?.createdBySecondName || ''}`.trim();
  if (fromFields) {
    return fromFields;
  }
  const id = task?.createdBy;
  if (id != null && id !== '') {
    return `ID ${id}`;
  }
  return 'Без постановщика';
};

/** Сводка по постановщику для нового отчёта 6 (те же показатели, что у группы исполнителя в «Отчет по задачам») */
const getReport3PostanovshikSummary = (responsibleName) => {
  const userRows = newReportRows.value.filter((r) => r.responsibleName === responsibleName);
  const totalTimeSpent = userRows.reduce((sum, r) => sum + (Number(r.durationMinutes || 0) / 60), 0);
  const completedTasks = userRows.filter((t) => t.status == 5).length;
  const inProgressTasks = userRows.filter((t) => t.status == 3).length;
  const newTasks = userRows.filter((t) => t.status == 1 || t.status == 2).length;
  return {
    totalTasks: userRows.length,
    completedTasks,
    inProgressTasks,
    newTasks,
    totalTimeSpent: totalTimeSpent.toFixed(2),
  };
};

/** Сводка по типу (отчёт 7): как блок показателей у постановщика в отчёте 3 */
const getReport7TypeSummary = (taskType) => {
  const userRows = newReportRows.value.filter((r) => r.taskType === taskType);
  const totalAcceptHours = userRows.reduce(
    (sum, r) => sum + Number(r.acceptDurationMs || 0) / 3600000,
    0
  );
  const completedTasks = userRows.filter((t) => t.status == 5).length;
  const inProgressTasks = userRows.filter((t) => t.status == 3).length;
  const newTasks = userRows.filter((t) => t.status == 1 || t.status == 2).length;
  return {
    totalTasks: userRows.length,
    completedTasks,
    inProgressTasks,
    newTasks,
    totalAcceptHours: totalAcceptHours.toFixed(2),
  };
};

/** Сумма трудозатрат в подгруппе по дате (часы, как в «Отчет по задачам») */
const getReport3DateSubgroupDurationHours = (group) => {
  const rows = [];
  const walk = (g) => {
    if (!g?.items) return;
    for (const child of g.items) {
      if (child.type === 'group') walk(child);
      else if (child.raw) rows.push(child.raw);
    }
  };
  walk(group);
  const sumMin = rows.reduce((acc, r) => acc + Number(r.durationMinutes || 0), 0);
  return (sumMin / 60).toFixed(2);
};

/** Сначала по периоду только id; полные поля — вторым запросом по ID (как в отчёте по задачам с UF) */
const REPORT3_TASK_ID_SELECT = ['id'];

const REPORT3_TASK_DETAIL_SELECT = [
  'id',
  'title',
  'description',
  'status',
  'groupId',
  'createdBy',
  'createdByName',
  'createdByLastName',
  'createdBySecondName',
  'createdDate',
  'closedDate',
  'durationFact',
  'timeSpentInLogs',
];

/** Второй запрос только id + UF (в одном select с остальными полями REST часто не отдаёт UF; в JSON приходит ufAuto…). См. getTimeRecordsForExcel. */
const REPORT_TASK_UF_SELECT = [
  'id',
  'UF_AUTO_256949663309',
  'UF_AUTO_929760312277',
  'UF_AUTO_207470266548',
];

const enrichTasksWithReportUserFields = async (tasks) => {
  const list = Array.isArray(tasks) ? tasks : [];
  if (!list.length) {
    return list;
  }
  const taskIds = [...new Set(list.map((t) => t?.id).filter((id) => id != null))];
  if (!taskIds.length) {
    return list;
  }
  const ufBatch = await loadNewReportTasks({ ID: taskIds }, REPORT_TASK_UF_SELECT);
  const ufRows = Array.isArray(ufBatch) ? ufBatch : [];
  const byId = {};
  ufRows.forEach((r) => {
    if (r && r.id != null) {
      byId[String(r.id)] = r;
    }
  });
  return list.map((t) => {
    const u = byId[String(t?.id)];
    if (!u) {
      return t;
    }
    return { ...t, ...u };
  });
};

const enrichTasksWithCreatorNames = async (tasks) => {
  const needIds = [
    ...new Set(
      tasks
        .filter((t) => t && t.createdBy && !`${t.createdByName || ''}`.trim())
        .map((t) => String(t.createdBy))
    ),
  ];
  if (!needIds.length) {
    return tasks;
  }
  let users = [];
  try {
    users = await callApi('user.get', { ID: needIds }, [], 0, 0, 0);
  } catch (e) {
    console.warn('user.get для постановщиков:', e);
    return tasks;
  }
  const list = Array.isArray(users) ? users : [];
  const byId = {};
  list.forEach((u) => {
    if (u && u.ID != null) {
      byId[String(u.ID)] = u;
    }
  });
  return tasks.map((t) => {
    if (!t || !t.createdBy || `${t.createdByName || ''}`.trim()) {
      return t;
    }
    const u = byId[String(t.createdBy)];
    if (!u) {
      return t;
    }
    return {
      ...t,
      createdByName: u.NAME || t.createdByName,
      createdByLastName: u.LAST_NAME || t.createdByLastName,
      createdBySecondName: u.SECOND_NAME || t.createdBySecondName,
    };
  });
};

const buildReport3 = async () => {
  const { dateFrom, dateTo } = getNewReportDateRange();
  const selectedDirections = new Set(newReportSelectedDirections.value);
  const dateStart = `${dateFrom}T00:00:00+05:00`;
  const dateEnd = `${dateTo}T23:59:59+05:00`;

  const baseFilter = { GROUP_ID: NEW_REPORT_GROUP_ID };
  const createdInPeriod = await loadNewReportTasks(
    {
      ...baseFilter,
      '>=CREATED_DATE': dateStart,
      '<=CREATED_DATE': dateEnd,
    },
    REPORT3_TASK_ID_SELECT
  );
  const closedInPeriod = await loadNewReportTasks(
    {
      ...baseFilter,
      '>=CLOSED_DATE': dateStart,
      '<=CLOSED_DATE': dateEnd,
    },
    REPORT3_TASK_ID_SELECT
  );

  const tasksById = new Map();
  [...createdInPeriod, ...closedInPeriod].forEach((task) => {
    if (task && task.id != null) {
      tasksById.set(String(task.id), task);
    }
  });
  const taskIdList = [...tasksById.keys()];
  if (!taskIdList.length) {
    newReportRows.value = [];
    newReportSummary.value = {
      completed: 0,
      overdue: 0,
      onTimePercent: 0,
      report3DurationLabel: '—',
      report4AvgAcceptLabel: '—',
      report4AvgAcceptMs: null,
      report4AvgCompleteLabel: '—',
      report4AvgByTaskType: [],
      report4AvgByCategory: [],
      text: 'За выбранный период задачи не найдены.',
    };
    return;
  }

  let tasksFull = await loadNewReportTasks({ ID: taskIdList }, REPORT3_TASK_DETAIL_SELECT);
  let tasks = Array.isArray(tasksFull) ? tasksFull : [];
  tasks = await enrichTasksWithReportUserFields(tasks);
  tasks = await enrichTasksWithCreatorNames(tasks);

  const linkedMap = await loadLinkedItemsByTaskIds(
    tasks.map((task) => task.id),
    {
      '>=createdTime': dateStart,
      '<=createdTime': dateEnd,
    }
  );

  const rows = [];
  let totalMinutes = 0;

  tasks.forEach((task) => {
    const direction = normalizeDirectionFromCategory(linkedMap[String(task.id)]?.categoryId);
    if (selectedDirections.size && !selectedDirections.has(direction)) {
      return;
    }

    const responsibleName = formatReport3CreatorName(task);
    const durationMinutes = getTaskDurationMinutes(task);
    totalMinutes += durationMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;

    const department = taskUfDisplay(task, '256949663309');
    const taskType = taskUfDisplay(task, '929760312277');
    const category = taskUfDisplay(task, '207470266548');
    const bodyText = stripHtmlForReport(getTaskDescriptionRaw(task));
    const titleText = getTaskTitleRaw(task);
    const taskDescriptionBody = bodyText
      ? (bodyText.length > 500 ? `${bodyText.slice(0, 500)}…` : bodyText)
      : '';
    const taskDescriptionDisplay = [titleText, taskDescriptionBody].filter(Boolean).join('\n') || '—';

    const createdRaw = getTaskCreatedRaw(task);
    const createdMoment = createdRaw ? moment(createdRaw) : null;
    const createdDateFormatted =
      createdMoment && createdMoment.isValid() ? createdMoment.format('DD.MM.YYYY HH:mm') : '—';
    const createdDateGroup =
      createdMoment && createdMoment.isValid() ? createdMoment.format('YYYY-MM-DD') : '—';

    rows.push({
      id: String(task.id),
      taskId: String(task.id),
      title: titleText || '—',
      taskDescriptionBody,
      taskDescriptionDisplay,
      taskUrl: `${getPortalUrl()}workgroups/group/${task.groupId || NEW_REPORT_GROUP_ID}/tasks/task/view/${task.id}/`,
      responsibleName,
      createdDateFormatted,
      department,
      taskType,
      category,
      status: task.status,
      createdDateGroup,
      durationMinutes,
      durationLabel: durationMinutes > 0 ? `${hours} ч ${mins} мин` : '—',
      direction,
    });
  });

  rows.sort((a, b) => {
    const nameCmp = String(a.responsibleName || '').localeCompare(String(b.responsibleName || ''), 'ru');
    if (nameCmp !== 0) return nameCmp;
    const dateCmp = String(b.createdDateGroup || '').localeCompare(String(a.createdDateGroup || ''));
    if (dateCmp !== 0) return dateCmp;
    return String(a.taskId).localeCompare(String(b.taskId), 'ru');
  });

  newReportRows.value = rows;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const durationLabelTotal = `${totalHours} ч ${totalMins} мин`;
  newReportSummary.value = {
    completed: rows.length,
    overdue: 0,
    onTimePercent: 0,
    report3DurationLabel: durationLabelTotal,
    report4AvgAcceptLabel: '—',
    report4AvgAcceptMs: null,
    report4AvgCompleteLabel: '—',
    report4AvgByTaskType: [],
    report4AvgByCategory: [],
    text: `Задач: ${rows.length}. Итого суммарные трудозатраты: ${durationLabelTotal} (поле durationFact). Учитываются задачи с датой создания или датой завершения в периоде; статусы не фильтруются. Группировка: постановщик → дата создания (как в «Отчет по задачам»).`,
  };
};

/** В select crm.item.list — только канонические имена полей */
const LIFECYCLE_CRM_SELECT = ['ufCrm47_1700467583', 'ufCrm47_1700467615', 'ufCrm47_1700467652'];

const buildReport4 = async () => {
  const { dateFrom, dateTo } = getNewReportDateRange();
  const selectedDirections = new Set(newReportSelectedDirections.value);
  const dateStart = `${dateFrom}T00:00:00+05:00`;
  const dateEnd = `${dateTo}T23:59:59+05:00`;

  const baseFilter = { GROUP_ID: NEW_REPORT_GROUP_ID };
  const createdInPeriod = await loadNewReportTasks(
    {
      ...baseFilter,
      '>=CREATED_DATE': dateStart,
      '<=CREATED_DATE': dateEnd,
    },
    REPORT3_TASK_ID_SELECT
  );
  const closedInPeriod = await loadNewReportTasks(
    {
      ...baseFilter,
      '>=CLOSED_DATE': dateStart,
      '<=CLOSED_DATE': dateEnd,
    },
    REPORT3_TASK_ID_SELECT
  );

  const tasksById = new Map();
  [...createdInPeriod, ...closedInPeriod].forEach((task) => {
    if (task && task.id != null) {
      tasksById.set(String(task.id), task);
    }
  });
  const taskIdList = [...tasksById.keys()];
  if (!taskIdList.length) {
    newReportRows.value = [];
    newReportSummary.value = {
      completed: 0,
      overdue: 0,
      onTimePercent: 0,
      report3DurationLabel: '—',
      report4AvgAcceptLabel: '—',
      report4AvgAcceptMs: null,
      report4AvgCompleteLabel: '—',
      report4AvgByTaskType: [],
      report4AvgByCategory: [],
      text: 'За выбранный период задачи не найдены.',
    };
    return;
  }

  let tasksFull = await loadNewReportTasks({ ID: taskIdList }, REPORT3_TASK_DETAIL_SELECT);
  let tasks = Array.isArray(tasksFull) ? tasksFull : [];
  tasks = await enrichTasksWithReportUserFields(tasks);

  const linkedMap = await loadLinkedCrmItemsByTaskIds(taskIdList, LIFECYCLE_CRM_SELECT);

  const rows = [];
  const acceptMsList = [];
  const completeMsList = [];

  tasks.forEach((task) => {
    const direction = normalizeDirectionFromCategory(linkedMap[String(task.id)]?.categoryId);
    if (selectedDirections.size && !selectedDirections.has(direction)) {
      return;
    }

    const taskType = taskUfDisplay(task, '929760312277');
    const category = taskUfDisplay(task, '207470266548');
    const bodyText = stripHtmlForReport(getTaskDescriptionRaw(task));
    const titleText = getTaskTitleRaw(task);
    const taskDescriptionBody = bodyText
      ? (bodyText.length > 500 ? `${bodyText.slice(0, 500)}…` : bodyText)
      : '';
    const taskDescriptionDisplay = [titleText, taskDescriptionBody].filter(Boolean).join('\n') || '—';

    const crmItem = linkedMap[String(task.id)];
    const postanovkaRaw = pickCrmRaw(crmItem, LIFECYCLE_UF_POSTANOVKA, '1700467583');
    const acceptRaw = pickCrmRaw(crmItem, LIFECYCLE_UF_ACCEPT, '1700467615');
    const execRaw = pickCrmRaw(crmItem, LIFECYCLE_UF_EXEC, '1700467652');

    const postanovkaM = postanovkaRaw ? moment(postanovkaRaw) : null;
    const acceptM = acceptRaw ? moment(acceptRaw) : null;
    const execM = execRaw ? moment(execRaw) : null;
    const closedRaw = getTaskClosedRaw(task);
    const closedM = closedRaw ? moment(closedRaw) : null;

    const crmPostanovkaLabel =
      postanovkaM && postanovkaM.isValid() ? postanovkaM.format('DD.MM.YYYY HH:mm') : '—';
    const crmAcceptanceLabel =
      acceptM && acceptM.isValid() ? acceptM.format('DD.MM.YYYY HH:mm') : '—';
    const crmExecutionLabel = execM && execM.isValid() ? execM.format('DD.MM.YYYY HH:mm') : '—';
    const taskClosedAtLabel =
      closedM && closedM.isValid() ? closedM.format('DD.MM.YYYY HH:mm') : '—';

    /** Срок принятия: дата/время принятия (CRM) − дата/время постановки (CRM), часы и минуты */
    let acceptDurationMs = null;
    if (
      acceptM &&
      postanovkaM &&
      acceptM.isValid() &&
      postanovkaM.isValid() &&
      acceptM.valueOf() >= postanovkaM.valueOf()
    ) {
      acceptDurationMs = acceptM.diff(postanovkaM);
      acceptMsList.push(acceptDurationMs);
    }

    /** Срок выполнения: CLOSED_DATE задачи − дата/время постановки (CRM), часы и минуты */
    let completeDurationMs = null;
    if (
      closedM &&
      postanovkaM &&
      closedM.isValid() &&
      postanovkaM.isValid() &&
      closedM.valueOf() >= postanovkaM.valueOf()
    ) {
      completeDurationMs = closedM.diff(postanovkaM);
      completeMsList.push(completeDurationMs);
    }

    rows.push({
      id: String(task.id),
      taskId: String(task.id),
      status: task.status != null ? Number(task.status) : null,
      title: titleText || '—',
      taskDescriptionBody,
      taskDescriptionDisplay,
      taskUrl: `${getPortalUrl()}workgroups/group/${task.groupId || NEW_REPORT_GROUP_ID}/tasks/task/view/${task.id}/`,
      taskType,
      category,
      crmPostanovkaLabel,
      crmAcceptanceLabel,
      crmExecutionLabel,
      taskClosedAtLabel,
      acceptDurationLabel: formatDurationFromMs(acceptDurationMs),
      completeDurationLabel: formatDurationFromMs(completeDurationMs),
      acceptDurationMs,
      completeDurationMs,
      direction,
    });
  });

  rows.sort((a, b) => {
    const t = String(a.taskType || '').localeCompare(String(b.taskType || ''), 'ru');
    if (t !== 0) return t;
    const c = String(a.category || '').localeCompare(String(b.category || ''), 'ru');
    if (c !== 0) return c;
    return String(a.taskId).localeCompare(String(b.taskId), 'ru');
  });

  newReportRows.value = rows;

  const avgAccept = averagePositiveMs(acceptMsList);
  const avgComplete = averagePositiveMs(completeMsList);
  const avgAcceptLabel = formatDurationFromMs(avgAccept);
  const avgCompleteLabel = formatDurationFromMs(avgComplete);
  const report4AvgByTaskType = computeReport4AvgByField(rows, 'taskType');
  const report4AvgByCategory = computeReport4AvgByField(rows, 'category');

  newReportSummary.value = {
    completed: rows.length,
    overdue: 0,
    onTimePercent: 0,
    report3DurationLabel: '—',
    report4AvgAcceptLabel: avgAcceptLabel,
    report4AvgAcceptMs: avgAccept,
    report4AvgCompleteLabel: avgCompleteLabel,
    report4AvgByTaskType,
    report4AvgByCategory,
    text:
      ``,
  };
};

const loadNewReport = async () => {
  try {
    newReportsLoading.value = true;
    if (newReportTab.value === '1') {
      await buildReport1();
    } else if (newReportTab.value === '2') {
      await buildReport2();
    } else if (newReportTab.value === '4') {
      await buildReport4();
    } else {
      await buildReport3();
    }
  } catch (error) {
    console.error('Ошибка загрузки нового отчета:', error);
    errorDisplay.value = 'Ошибка загрузки нового отчета';
    errorDialog.value = true;
  } finally {
    newReportsLoading.value = false;
  }
};

const getNewReportGroupSummary = (responsibleName) => {
  const userRows = newReportRows.value.filter((row) => row.responsibleName === responsibleName);
  const completed = userRows.length;
  const overdue = userRows.filter((row) => row.onTime === false).length;
  const onTime = completed - overdue;
  const onTimePercent = completed ? Math.round((onTime / completed) * 1000) / 10 : 0;
  const durationMinutes = userRows.reduce((acc, row) => acc + Number(row.durationMinutes || 0), 0);
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  return {
    completed,
    overdue,
    onTimePercent,
    durationLabel: `${hours} ч ${mins} мин`,
  };
};

const exportNewReportToExcel = () => {
  if (!newReportRows.value.length) {
    return;
  }

  const wb = XLSX.utils.book_new();
  let excelData = [];
  let sheetTitle = `Отчет_${newReportTab.value}`;

  if (newReportTab.value === '3') {
    sheetTitle = 'Отчет_задачи_группа';
    excelData = newReportRows.value.map((row) => ({
      'Постановщик': row.responsibleName,
      'Дата создания': row.createdDateFormatted,
      'Подразделение постановщика': row.department,
      'Тип задачи': row.taskType,
      'Категория задачи': row.category,
      'Описание задачи': row.taskDescriptionDisplay,
      'Суммарные трудозатраты': row.durationLabel,
      'Направление': row.direction,
    }));
  } else if (newReportTab.value === '4') {
    sheetTitle = 'Отчет_жизненный_цикл';
    excelData = newReportRows.value.map((row) => ({
      'Тип': row.taskType,
      'Категория': row.category,
      'Описание задачи': row.taskDescriptionDisplay,
      'Дата и время постановки задачи': row.crmPostanovkaLabel,
      'Дата и время принятия задачи': row.crmAcceptanceLabel,
      'Дата и время выполнения задачи': row.crmExecutionLabel,
      'Дата и время закрытия задачи': row.taskClosedAtLabel,
      'Срок принятия задачи': row.acceptDurationLabel,
      'Срок выполнения задачи': row.completeDurationLabel,
      'Направление': row.direction,
    }));
  } else {
    sheetTitle = newReportTab.value === '2' ? 'Новый_Отчет_2' : 'Новый_Отчет_1';
    excelData = newReportRows.value.map((row) => ({
      [newReportTab.value === '2' ? 'Аналитик' : 'Исполнитель']: row.responsibleName,
      [newReportTab.value === '2' ? 'Тикет' : 'Описание']: row.title,
      [newReportTab.value === '2' ? 'SLA выполнен' : 'Закрыта в срок']: row.onTimeLabel,
      [newReportTab.value === '2' ? 'Дата/Время приемки' : 'Дата закрытия']: row.closedDateLabel,
      [newReportTab.value === '2' ? 'Дата создания' : 'Крайний срок']: row.deadlineLabel,
      'Направление': row.direction,
    }));
  }

  const ws = XLSX.utils.json_to_sheet(excelData);
  // Колонка «Описание задачи»: отчёт 3 — индекс 5; отчёт 4 — индекс 2 (Тип, Категория, Описание)
  const firstDataColumn = newReportTab.value === '3' ? 5 : newReportTab.value === '4' ? 2 : 1;
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let rowIndex = range.s.r + 1; rowIndex <= range.e.r; rowIndex++) {
    const cellAddress = XLSX.utils.encode_cell({ c: firstDataColumn, r: rowIndex });
    if (!ws[cellAddress]) {
      continue;
    }
    const source = newReportRows.value[rowIndex - 1];
    if (!source?.taskUrl) {
      continue;
    }
    ws[cellAddress].l = { Target: source.taskUrl, Tooltip: 'Открыть в Bitrix24' };
    ws[cellAddress].s = { font: { color: { rgb: '0000FF' }, underline: true } };
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);

  const { dateFrom, dateTo } = getNewReportDateRange();
  const summaryRows =
    newReportTab.value === '3'
      ? [
          ['Отчет', 'Задачи по постановщикам (группировка: постановщик)'],
          ['Период', `${dateFrom} - ${dateTo}`],
          ['Направления', newReportSelectedDirections.value.length ? newReportSelectedDirections.value.join(', ') : 'Все'],
          ['Задач в отчёте', newReportSummary.value.completed],
          ['Суммарные трудозатраты', newReportSummary.value.report3DurationLabel || '—'],
          ['Комментарий', newReportSummary.value.text],
        ]
      : newReportTab.value === '4'
        ? [
            ['Отчет', 'Жизненный цикл задач (группировка: тип)'],
            ['Период', `${dateFrom} - ${dateTo}`],
            ['Направления', newReportSelectedDirections.value.length ? newReportSelectedDirections.value.join(', ') : 'Все'],
            ['Задач в отчёте', newReportSummary.value.completed],
            ['Итог: среднее время принятия задачи', newReportSummary.value.report4AvgAcceptLabel || '—'],
            ['Итог: среднее время выполнения задачи', newReportSummary.value.report4AvgCompleteLabel || '—'],
            ['Комментарий', newReportSummary.value.text],
            [],
            ['Группировка: тип задачи', '', ''],
            ['Тип задачи', 'Среднее время принятия', 'Среднее время выполнения'],
            ...(newReportSummary.value.report4AvgByTaskType || []).map((r) => [
              r.label,
              r.avgAcceptLabel,
              r.avgCompleteLabel,
            ]),
            [],
            ['Группировка: категория', '', ''],
            ['Категория', 'Среднее время принятия', 'Среднее время выполнения'],
            ...(newReportSummary.value.report4AvgByCategory || []).map((r) => [
              r.label,
              r.avgAcceptLabel,
              r.avgCompleteLabel,
            ]),
          ]
        : [
            ['Отчет', `Новый отчет ${newReportTab.value}`],
            ['Период', `${dateFrom} - ${dateTo}`],
            ['Направления', newReportSelectedDirections.value.length ? newReportSelectedDirections.value.join(', ') : 'Все'],
            ['Ответственные', newReportSelectedResponsibles.value.length ? newReportSelectedResponsibles.value.join(', ') : 'Все'],
            [newReportLabels.value.completed, newReportSummary.value.completed],
            [newReportLabels.value.overdue, newReportSummary.value.overdue],
            [newReportLabels.value.onTime, `${newReportSummary.value.onTimePercent}%`],
            ['Комментарий', newReportSummary.value.text],
          ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Сводка');

  XLSX.writeFile(wb, `Новые_отчеты_${newReportTab.value}_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
};

// Заголовки таблицы для детализированного отчета по задачам
const tasksDetailedTableHeaders = ref([
  { title: 'Наименование', value: 'title', sortable: true, width: '300px' },
  { title: 'Статус', value: 'statusLabel', sortable: true, width: '150px' },
  { title: 'Постановщик', value: 'creatorFullName', sortable: true, width: '200px' },
  { title: 'Время затрачено', value: 'timeSpentInLogs', sortable: true, width: '150px' },
  { title: 'Дата создания', value: 'createdDateFormatted', sortable: true, width: '150px' },
  { title: 'Дедлайн', value: 'deadlineFormatted', sortable: true, width: '150px' },
  //{ title: 'Приоритет', value: 'priorityLabel', sortable: true, width: '120px' },
]);
// Обновленная функция для получения записей времени для Excel с сортировкой по дате создания
const getTimeRecordsForExcel = async (taskIds, selectedUsers, dateRange) => {
  try {
    const timeFilter = {
      'TASK_ID': taskIds,
      'USER_ID': selectedUsers
    };

    // Добавляем фильтр по дате, если он есть
    if (dateRange && dateRange.length >= 2) {
      timeFilter['>=CREATED_DATE'] = dateRange[0].split("T")[0];
      timeFilter['<=CREATED_DATE'] = dateRange[1].split("T")[0];
    }

    const elapsedItems = await getTaskElapsedItems(
      timeFilter,
      ['ID', 'TASK_ID', "SECONDS", "USER_ID", "CREATED_DATE", "COMMENT_TEXT"], 
      ''
    );

    // Сортируем записи по дате создания (от старых к новым)
    elapsedItems.sort((a, b) => new Date(a.CREATED_DATE) - new Date(b.CREATED_DATE));

    // Получаем названия задач
    let tasksData = [];
    let tasksAdditionalData = [];
    if (taskIds.length > 0) {
      tasksData = await callApi(
        "tasks.task.list", 
        {"ID": taskIds},
        [            'id', 'title', 'description', 'status', 'responsibleId', 
            'createdDate', 'deadline', 'priority', 'groupId', 
            "timeSpentInLogs", "createdBy", "createdByName", "createdByLastName", 
            "createdBySecondName", "responsibleName", "responsibleLastName", 
            "responsibleSecondName"]
      );

      // Преобразуем структуру данных
      if (Array.isArray(tasksData)) {
        tasksData = tasksData.reduce((acc, current) => {
          return acc.concat(current.tasks || []);
        }, []);
      } else {
        tasksData = tasksData.tasks || [];
      }
      tasksAdditionalData = await callApi(
        "tasks.task.list", 
        {"ID": taskIds},
        ['ID', "UF_AUTO_929760312277"]
      );

      // Преобразуем структуру данных
      if (Array.isArray(tasksAdditionalData)) {
        tasksAdditionalData = tasksAdditionalData.reduce((acc, current) => {
          return acc.concat(current.tasks || []);
        }, []);
      } else {
        tasksAdditionalData = tasksAdditionalData.tasks || [];
      }
      const additionalFieldsMap = {};
      tasksAdditionalData.forEach(task => {
        if (task && task.id) {
          additionalFieldsMap[task.id] = {
            ufAuto: task.ufAuto929760312277 || ''
          };
        }
      });

      // Объединяем данные: добавляем UF_AUTO_929760312277 к основной информации о задачах
      tasksData = tasksData.map(task => {
        const additionalData = additionalFieldsMap[task.id] || {};
        return {
          ...task,
          UF_AUTO_929760312277: additionalData.ufAuto
        };
      });
    }

    // Создаем маппинг ID задачи -> полная информация о задаче
    const taskInfoMap = {};
    tasksData.forEach(task => {
      taskInfoMap[task.id] = {
        title: task.title || `Задача ${task.id}`,
        status: task.status || 0,
        createdDate: task.createdDate,
        deadline: task.deadline,
        priority: task.priority || 2,
        responsibleId: task.responsibleId,
        createdBy: task.createdBy,
        createdByName: task.createdByName,
        createdByLastName: task.createdByLastName,
        createdBySecondName: task.createdBySecondName,
        responsibleName: task.responsibleName,
        responsibleLastName: task.responsibleLastName,
        responsibleSecondName: task.responsibleSecondName,
        UF_AUTO_929760312277: task.UF_AUTO_929760312277,
      };
    });

    // Формируем массив записей с полной информацией
    const detailedRecords = elapsedItems.map(item => {
      const taskInfo = taskInfoMap[item.TASK_ID] || {
        title: `Задача ${item.TASK_ID}`,
        status: 0,
        createdDate: null,
        deadline: null,
        priority: 2,
        UF_AUTO_929760312277: 'Не указано'
      };
      
      let user = taskUsers.value.find(u => u.ID.toString() === item.USER_ID.toString());
      if(!user){
        user = invoiceUsers.value.find(u => u.ID.toString() === item.USER_ID.toString());
      }
      const userName = user ? formatTaskUserName(user.LAST_NAME, user.NAME, user.SECOND_NAME) : `Пользователь ${item.USER_ID}`;
      
      const hours = Math.round((parseInt(item.SECONDS) / 3600) * 100) / 100;
      
      // Форматируем статус задачи
      const statusLabel = TASK_STATUS_LABELS[taskInfo.status] || 'Неизвестный статус';
      
      // Форматируем имя постановщика
      const creatorFullName = taskInfo.createdByName ? 
        formatTaskUserName(
          taskInfo.createdByLastName,
          taskInfo.createdByName,
          taskInfo.createdBySecondName
        ) : 'Неизвестный постановщик';
      
      // Форматируем имя исполнителя
      const responsibleFullName = taskInfo.responsibleName ? 
        formatTaskUserName(
          taskInfo.responsibleLastName,
          taskInfo.responsibleName,
          taskInfo.responsibleSecondName
        ) : 'Не назначен';
      
      // Форматируем даты
      const taskCreatedDate = taskInfo.createdDate ? 
        moment(taskInfo.createdDate).format('DD.MM.YYYY HH:mm') : 'Не указана';
      const taskDeadline = taskInfo.deadline ? 
        moment(taskInfo.deadline).format('DD.MM.YYYY HH:mm') : 'Не указан';

      return {
        recordCreatedDate: item.CREATED_DATE ? moment(item.CREATED_DATE).format('DD.MM.YYYY HH:mm:ss') : 'Не указана',
        userName: userName,
        taskId: item.TASK_ID,
        taskTitle: taskInfo.title,
        seconds: parseInt(item.SECONDS),
        hours: hours,
        comment: item.COMMENT_TEXT || '',
        // Дополнительная информация о задаче для дублирования
        taskStatus: statusLabel,
        taskCreator: creatorFullName,
        taskResponsible: responsibleFullName,
        taskCreatedDate: taskCreatedDate,
        taskDeadline: taskDeadline,
        taskPriority: getPriorityLabel(taskInfo.priority),
        UF_AUTO_929760312277: taskInfo.UF_AUTO_929760312277,
      };
    });

    return detailedRecords;
  } catch (error) {
    console.error('Ошибка при получении записей времени для Excel:', error);
    return [];
  }
};

// Обновленная функция экспорта для отчета 2 (без страницы 2)
const exportTasksToExcel = async (data, fileName) => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Получаем записи времени
    const taskIds = [...new Set(data.map(item => item.id))];
    const selectedUsers = sessionStorage.getItem("selectedUsers")?.split(",") || [];
    const dateRange = sessionStorage.getItem("date")?.split(",") || [];
    
    const timeRecords = await getTimeRecordsForExcel(taskIds, selectedUsers, dateRange);
    
    // Создаем данные для Excel с дублированием задач по записям времени
    const excelData = timeRecords.map(record => ({
      'Наименование': record.taskTitle,
      'Статус': record.taskStatus,
      'Постановщик': record.taskCreator,
      'Исполнитель': record.taskResponsible,
      'Время создания записи': record.recordCreatedDate,
      'Затрачено времени (часы)': record.hours,
      'Комментарий': record.comment,
      'Дата создания задачи': record.taskCreatedDate,
      'Дедлайн': record.taskDeadline,
      'Приоритет': record.taskPriority,
      'Пользователь (запись)': record.userName,
      'Тип обращения': record.UF_AUTO_929760312277 || '',
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Добавляем гиперссылки на название задачи
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ c: 0, r: row }); // Столбец A (Наименование)
      
      if (ws[cellAddress]) {
        const recordIndex = row - 1;
        const taskId = timeRecords[recordIndex].taskId;
        const url = `https://ortonica.bitrix24.ru/company/personal/user/${currentUser.value}/tasks/task/view/${taskId}/`;
        
        if (!ws[cellAddress].l) {
          ws[cellAddress].l = {};
        }
        ws[cellAddress].l.Target = url;
        ws[cellAddress].l.Tooltip = 'Открыть задачу в Bitrix24';
        
        if (!ws[cellAddress].s) {
          ws[cellAddress].s = {};
        }
        ws[cellAddress].s.font = { color: { rgb: '0000FF' }, underline: true };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Отчет по задачам');
    XLSX.writeFile(wb, `${fileName}_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
  } catch (error) {
    console.error('Ошибка при экспорте задач в Excel:', error);
    errorDisplay.value = 'Ошибка при экспорте задач в Excel';
    errorDialog.value = true;
  }
};

// Обновленная функция экспорта для отчета 3 (без страницы 2)
const exportTasksDetailedToExcel = async (data, fileName) => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Получаем записи времени
    const taskIds = [...new Set(data.map(item => item.id))];
    const selectedUsers = sessionStorage.getItem("selectedUsers")?.split(",") || [];
    const dateRange = sessionStorage.getItem("date")?.split(",") || [];
    
    const timeRecords = await getTimeRecordsForExcel(taskIds, selectedUsers, dateRange);
    
    // Создаем данные для Excel с дублированием задач по записям времени
    const excelData = timeRecords.map(record => ({
      'Наименование': record.taskTitle,
      'Статус': record.taskStatus,
      'Постановщик': record.taskCreator,
      'Исполнитель': record.taskResponsible,
      'Время создания записи': record.recordCreatedDate,
      'Время затрачено (часы)': record.hours,
      'Комментарий': record.comment,
      'Дата создания задачи': record.taskCreatedDate,
      'Дедлайн': record.taskDeadline,
      'Приоритет': record.taskPriority,
      'Пользователь (запись)': record.userName
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Добавляем гиперссылки на название задачи
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ c: 0, r: row }); // Столбец A (Наименование)
      
      if (ws[cellAddress]) {
        const recordIndex = row - 1;
        const taskId = timeRecords[recordIndex].taskId;
        const url = `https://ortonica.bitrix24.ru/company/personal/user/${currentUser.value}/tasks/task/view/${taskId}/`;
        
        if (!ws[cellAddress].l) {
          ws[cellAddress].l = {};
        }
        ws[cellAddress].l.Target = url;
        ws[cellAddress].l.Tooltip = 'Открыть задачу в Bitrix24';
        
        if (!ws[cellAddress].s) {
          ws[cellAddress].s = {};
        }
        ws[cellAddress].s.font = { color: { rgb: '0000FF' }, underline: true };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Отчет по задачам');
    XLSX.writeFile(wb, `${fileName}_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
  } catch (error) {
    console.error('Ошибка при экспорте детализированных задач в Excel:', error);
    errorDisplay.value = 'Ошибка при экспорте детализированных задач в Excel';
    errorDialog.value = true;
  }
};
// Обработчик данных для детализированного отчета по задачам
const handleDetailedTasksData = async (tasks) => {
  try {
    tasksDetailedLoading.value = true;
    
    // Получаем все записи о затраченном времени
    const filteredDate = sessionStorage.getItem("date")?.split(",") || [];

    // Создаем фильтр для временных записей
    const timeFilter = {};
    let dateFromStr;
    let dateToStr;
    if (filteredDate.length >= 2 && filteredDate[0] && filteredDate[1]) {
      dateFromStr = filteredDate[0].split('T')[0];
      dateToStr = filteredDate[1].split('T')[0];
    } else {
      const [a, b] = getIsoRangeForCurrentWeek();
      dateFromStr = moment(a).format('YYYY-MM-DD');
      dateToStr = moment(b).format('YYYY-MM-DD');
    }
    timeFilter['>=CREATED_DATE'] = dateFromStr;
    timeFilter['<=CREATED_DATE'] = dateToStr;

    const selectedUsersRaw = sessionStorage.getItem('selectedUsers');
    const elapsedFilter = { ...timeFilter };
    if (selectedUsersRaw && selectedUsersRaw !== '') {
      elapsedFilter.USER_ID = selectedUsersRaw.split(',');
    }

    const elapsedItems = await getTaskElapsedItems(
      elapsedFilter,
      ['ID', 'TASK_ID', "SECONDS", "USER_ID", "CREATED_DATE"], 
      ''
    );

    // Получаем ID пользователей из taskUsers для фильтрации
    const taskUserIds = invoiceUsers.value.map(user => user.ID.toString());
    // Группируем записи времени по задачам и пользователям (только для taskUsers)
    const taskTimeByUser = {};
    const taskUserRecords = {}; // Для отслеживания пользователей, работавших над задачами
    
    elapsedItems.forEach(item => {
      const taskId = item.TASK_ID;
      const userId = item.USER_ID.toString();
      const seconds = parseInt(item.SECONDS) || 0;
      
      // Фильтруем только пользователей из taskUsers
      if (!taskUserIds.includes(userId)) {
        return;
      }
      
      if (!taskTimeByUser[taskId]) {
        taskTimeByUser[taskId] = {};
        taskUserRecords[taskId] = new Set(); // Для отслеживания уникальных пользователей
      }
      
      if (!taskTimeByUser[taskId][userId]) {
        taskTimeByUser[taskId][userId] = 0;
      }
      
      taskTimeByUser[taskId][userId] += seconds;
      taskUserRecords[taskId].add(userId);
    });

    // Получаем детальную информацию о задачах
    const uniqueTaskIds = [...new Set(elapsedItems.map(item => item.TASK_ID))];

    let tasksDetailedData = [];
    
    if (uniqueTaskIds.length > 0) {
      tasksDetailedData = await callApi(
        "tasks.task.list", 
        {"ID": uniqueTaskIds}, 
        ['id','title','description','status','responsibleId','createdDate','deadline','priority','groupId', "timeSpentInLogs", "createdBy", "createdByName", "createdByLastName", "createdBySecondName", "responsibleName", "responsibleLastName", "responsibleSecondName"]
      );

      // Преобразуем структуру данных
      if (Array.isArray(tasksDetailedData)) {
        tasksDetailedData = tasksDetailedData.reduce((acc, current) => {
          return acc.concat(current.tasks || []);
        }, []);
      } else {
        tasksDetailedData = tasksDetailedData.tasks || [];
      }
    }

    // Создаем массив для хранения финальных данных с дублированием задач по пользователям
    const detailedTasksWithUsers = [];

    // Обрабатываем каждую задачу, для которой есть записи времени
    Object.keys(taskTimeByUser).forEach(taskId => {
      const timeRecords = taskTimeByUser[taskId];
      const task = tasksDetailedData.find(t => t.id == taskId) || {
        id: taskId,
        title: `Задача ${taskId}`,
        status: 0,
        createdDate: null,
        deadline: null,
        priority: 2
      };

      // Создаем отдельную запись для каждого пользователя из taskUsers, который работал над задачей
      Object.entries(timeRecords).forEach(([userId, totalSeconds]) => {
        
        // Находим пользователя в taskUsers
        const workingUser = invoiceUsers.value.find(user => user.ID.toString() === userId);
        
        if (!workingUser) {
          return; // Пропускаем, если пользователь не найден
        }
        
        // Формируем полное имя постановщика
        const creatorFullName = task.createdByName ? 
          formatTaskUserName(
            task.createdByLastName,
            task.createdByName,
            task.createdBySecondName
          ) : 'Неизвестный постановщик';
        
        // Формируем полное имя пользователя, который работал над задачей
        const workingUserName = formatTaskUserName(
          workingUser.LAST_NAME,
          workingUser.NAME,
          workingUser.SECOND_NAME
        );
        
        // Формируем полное имя исполнителя (ответственного)
        const responsibleFullName = task.responsibleName ? 
          formatTaskUserName(
            task.responsibleLastName,
            task.responsibleName,
            task.responsibleSecondName
          ) : 'Не назначен';
        
        // Преобразуем статус в читаемый формат
        const statusLabel = TASK_STATUS_LABELS[task.status] || 'Неизвестный статус';
        
        // Преобразуем приоритет
        const priorityLabel = getPriorityLabel(task.priority);
        
        // Форматируем даты
        const createdDateFormatted = task.createdDate ? 
          moment(task.createdDate).format('DD.MM.YYYY HH:mm') : 'Не указана';
        const deadlineFormatted = task.deadline ? 
          moment(task.deadline).format('DD.MM.YYYY HH:mm') : 'Не указан';
        
        // Конвертируем секунды в часы
        const timeSpentHours = Math.round((totalSeconds / 3600) * 100) / 100;
        
        // Создаем уникальную запись для комбинации задача-пользователь
        detailedTasksWithUsers.push({
          ...task,
          // В качестве ответственного указываем пользователя, который вносил время
          responsibleFullName: workingUserName,
          responsibleId: parseInt(userId),
          creatorFullName,
          statusLabel,
          priorityLabel,
          createdDateFormatted,
          deadlineFormatted,
          timeSpentInLogs: timeSpentHours,
          timeSpentSeconds: totalSeconds,
          originalResponsibleFullName: responsibleFullName, // Сохраняем оригинального ответственного
          isTimeContributor: true, // Флаг, что это запись о времени пользователя
          workingUserId: parseInt(userId), // ID пользователя, который работал над задачей
          uniqueKey: `${task.id}_${userId}` // Уникальный ключ для идентификации
        });
      });
    });

    // Сортируем задачи по ID для удобства просмотра
    detailedTasksWithUsers.sort((a, b) => a.id - b.id);

    // Обновляем данные таблицы
    tasksDetailedTableDate.value = detailedTasksWithUsers;

  } catch (error) {
    console.error('Ошибка при получении затраченного времени для детализированного отчета:', error);
    errorDisplay.value = 'Ошибка при загрузке детализированных данных по задачам';
    errorDialog.value = true;
  } finally {
    tasksDetailedLoading.value = false;
  }
};
// Обновляем функцию getDetailedTaskSummary для работы с новой структурой данных
const getDetailedTaskSummary = (responsibleName) => {
  const userTasks = tasksDetailedTableDate.value.filter(task => 
    task.responsibleFullName === responsibleName
  );
  
  const totalTimeSpent = userTasks.reduce((sum, task) => sum + (task.timeSpentInLogs || 0), 0);
  
  // Подсчитываем уникальные задачи (исключая дубликаты по пользователям)
  const uniqueTaskIds = [...new Set(userTasks.map(task => task.id))];
  
  // Получаем статусы уникальных задач
  const uniqueTasks = uniqueTaskIds.map(taskId => {
    return tasksDetailedTableDate.value.find(task => task.id === taskId && task.responsibleFullName === responsibleName);
  }).filter(Boolean);

  // Подсчитываем задачи по статусам
  const completedTasks = uniqueTasks.filter(task => task.status == 5).length;
  const inProgressTasks = uniqueTasks.filter(task => task.status == 3).length;
  const newTasks = uniqueTasks.filter(task => task.status == 1 || task.status == 2).length;

  return {
    totalTasks: uniqueTaskIds.length, // Количество уникальных задач
    totalTimeRecords: userTasks.length, // Количество записей о времени (может быть больше чем задач)
    totalTimeSpent: totalTimeSpent.toFixed(2),
    completedTasks: completedTasks,
    inProgressTasks: inProgressTasks,
    newTasks: newTasks,
    avgTimePerTask: uniqueTaskIds.length > 0 ? (totalTimeSpent / uniqueTaskIds.length).toFixed(2) : 0
  };
};
// Функция для получения цвета статуса
const getStatusColor = (status) => {
  switch (status) {
    case TASK_STATUS.STATE_COMPLETED:
      return 'success';
    case TASK_STATUS.STATE_IN_PROGRESS:
      return 'primary';
    case TASK_STATUS.STATE_NEW:
      return 'warning';
    case TASK_STATUS.STATE_PENDING:
      return 'info';
    case TASK_STATUS.STATE_DECLINED:
      return 'error';
    default:
      return 'default';
  }
};

// Функция для преобразования приоритета в читаемый формат
const getPriorityLabel = (priority) => {
  const priorityMap = {
    1: 'Низкий',
    2: 'Средний', 
    3: 'Высокий'
  };
  return priorityMap[priority] || 'Не указан';
};

const selectReport = (reportId) => {
  selectedReport.value = reportId;
};

const openSelectedReport = () => {
  if (selectedReport.value === 1) {
    report1Dialog.value = true;
  } else if (selectedReport.value === 2) {
    report2Dialog.value = true;
  }
  reportsDialog.value = false;
};

const openReport = (reportId) => {
  if (
    (reportId === 4 || reportId === 5 || reportId === 6 || reportId === 7) &&
    !canAccessReports4to7.value
  ) {
    errorDisplay.value = 'Доступ к этому отчёту ограничен.';
    errorDialog.value = true;
    return;
  }

  reportsDialog.value = false;
  
  if (reportId === 1) {
    report1Dialog.value = true;
  } else if (reportId === 2) {
    report2Dialog.value = true;
  } else if (reportId === 3) {
    report3Dialog.value = true;
  } else if (reportId === 4 || reportId === 5 || reportId === 6 || reportId === 7) {
    newReportTab.value = String(reportId - 3);
    newReportsDialog.value = true;
  }
};

// Обновим функцию backToReportsMenu
const backToReportsMenu = () => {
  report1Dialog.value = false;
  report2Dialog.value = false;
  report3Dialog.value = false;
  newReportsDialog.value = false;
  reportsDialog.value = true;
};
const TASK_STATUS = {
  STATE_NEW: 1,
  STATE_PENDING: 2,
  STATE_IN_PROGRESS: 3,
  STATE_SUPPOSEDLY_COMPLETED: 4,
  STATE_COMPLETED: 5,
  STATE_DEFERRED: 6,
  STATE_DECLINED: 7
};

const TASK_STATUS_LABELS = {
  [TASK_STATUS.STATE_NEW]: 'Новая',
  [TASK_STATUS.STATE_PENDING]: 'Ждет выполнения',
  [TASK_STATUS.STATE_IN_PROGRESS]: 'Выполняется',
  [TASK_STATUS.STATE_SUPPOSEDLY_COMPLETED]: 'Предположительно завершена',
  [TASK_STATUS.STATE_COMPLETED]: 'Завершена',
  [TASK_STATUS.STATE_DEFERRED]: 'Отложена',
  [TASK_STATUS.STATE_DECLINED]: 'Отклонена'
};

// Заголовки таблицы задач (тот же порядок, что в exportTasksToExcel → excelData)
const tasksTableHeaders = ref([
  { title: 'Наименование', value: 'title', sortable: true },
  { title: 'Статус', value: 'statusLabel', sortable: true },
  { title: 'Постановщик', value: 'creatorFullName', sortable: true },
  { title: 'Исполнитель', value: 'originalResponsibleFullName', sortable: true },
  { title: 'Время создания записи', value: 'recordCreatedDisplay', sortable: true },
  { title: 'Затрачено времени (часы)', value: 'timeSpentInLogs', sortable: true },
  { title: 'Комментарий', value: 'commentDisplay', sortable: true },
  { title: 'Дата создания задачи', value: 'createdDateFormatted', sortable: true },
  { title: 'Дедлайн', value: 'deadlineFormatted', sortable: true },
  { title: 'Приоритет', value: 'priorityLabel', sortable: true },
  { title: 'Пользователь (запись)', value: 'timeLogUserFullName', sortable: true },
  { title: 'Тип обращения', value: 'taskTypeUfLabel', sortable: true },
]);
const handleTasksData = async (tasks) => {
 try {
    tasksLoading.value = true;
    
    // Получаем период из фильтра
    const filteredDate = sessionStorage.getItem("date")?.split(",") || [];

    // Создаем фильтр для временных записей за период
    const timeFilter = {};
    let dateFromStr;
    let dateToStr;
    if (filteredDate.length >= 2 && filteredDate[0] && filteredDate[1]) {
      dateFromStr = filteredDate[0].split('T')[0];
      dateToStr = filteredDate[1].split('T')[0];
    } else {
      const [a, b] = getIsoRangeForCurrentWeek();
      dateFromStr = moment(a).format('YYYY-MM-DD');
      dateToStr = moment(b).format('YYYY-MM-DD');
    }
    timeFilter['>=CREATED_DATE'] = dateFromStr;
    timeFilter['<=CREATED_DATE'] = dateToStr;

    // Получаем выбранных пользователей из фильтра
    const selectedUsers = sessionStorage.getItem("selectedUsers")?.split(",") || [];
    if (selectedUsers.length > 0 && selectedUsers[0] !== '') {
      timeFilter["USER_ID"] = selectedUsers;
    }

    // 1. Сначала получаем все записи о затраченном времени за период
    const elapsedItems = await getTaskElapsedItems(
      timeFilter,
      ['ID', 'TASK_ID', "SECONDS", "USER_ID", "CREATED_DATE"], 
      ''
    );

    if (elapsedItems.length === 0) {
      tasksTableDate.value = [];
      tasksLoading.value = false;
      return;
    }

    // 2. Извлекаем уникальные ID задач из записей времени
    const uniqueTaskIds = [...new Set(elapsedItems.map(item => item.TASK_ID))];

    // 3. Получаем детальную информацию о задачах по найденным ID
    let tasksDetailedData = [];
    
    if (uniqueTaskIds.length > 0) {
      // Разбиваем на батчи по 50 задач (ограничение Bitrix24)
      //for (let i = 0; i < uniqueTaskIds.length; i += 50) {
        //const chunk = uniqueTaskIds.slice(i, i + 50);
        
        const chunkData = await callApi(
          "tasks.task.list", 
          {"ID": uniqueTaskIds}, 
          [
                        'id', 'title', 'description', 'status', 'responsibleId', 
            'createdDate', 'deadline', 'priority', 'groupId', 
            "timeSpentInLogs", "createdBy", "createdByName", "createdByLastName", 
            "createdBySecondName", "responsibleName", "responsibleLastName", 
            "responsibleSecondName",
          ]
        );

        // Преобразуем структуру данных
        if (Array.isArray(chunkData)) {
          tasksDetailedData = tasksDetailedData.concat(chunkData.reduce((acc, current) => {
            return acc.concat(current.tasks || []);
          }, []));
        } else {
          tasksDetailedData = tasksDetailedData.concat(chunkData.tasks || []);
        }

      let tasksUfRaw = await callApi(
        'tasks.task.list',
        { ID: uniqueTaskIds },
        ['ID', 'UF_AUTO_929760312277']
      );
      let tasksUfList = [];
      if (Array.isArray(tasksUfRaw)) {
        tasksUfList = tasksUfRaw.reduce((acc, cur) => acc.concat(cur.tasks || []), []);
      } else {
        tasksUfList = tasksUfRaw.tasks || [];
      }
      tasksDetailedData = tasksDetailedData.map((t) => {
        const extra = tasksUfList.find((u) => u && u.id === t.id);
        return {
          ...t,
          taskTypeUfLabel: extra ? (extra.ufAuto929760312277 || extra.UF_AUTO_929760312277 || '') : '',
        };
      });
      }
    //}

    // 4. Группируем записи времени по задачам и пользователям (секунды + даты создания записей)
    const taskTimeByUser = {};

    elapsedItems.forEach((item) => {
      const taskId = item.TASK_ID;
      const userId = item.USER_ID.toString();
      const seconds = parseInt(item.SECONDS) || 0;

      if (!taskTimeByUser[taskId]) {
        taskTimeByUser[taskId] = {};
      }

      if (!taskTimeByUser[taskId][userId]) {
        taskTimeByUser[taskId][userId] = { totalSeconds: 0, recordDates: [] };
      }

      const bucket = taskTimeByUser[taskId][userId];
      bucket.totalSeconds += seconds;
      const createdRaw = item.CREATED_DATE ?? item.createdDate;
      if (createdRaw) {
        bucket.recordDates.push(createdRaw);
      }
    });

    // 5. Формируем финальный массив данных для таблицы
    const finalTasksData = [];

    // Обрабатываем каждую задачу, для которой есть записи времени
    Object.keys(taskTimeByUser).forEach(taskId => {
      const timeRecords = taskTimeByUser[taskId];
      const task = tasksDetailedData.find(t => t.id == taskId) || {
        id: taskId,
        title: `Задача ${taskId}`,
        status: 0,
        createdDate: null,
        deadline: null,
        priority: 2,
        taskTypeUfLabel: '',
      };

      // Создаем отдельную запись для каждого пользователя, который работал над задачей
      Object.entries(timeRecords).forEach(([userId, agg]) => {
        const totalSeconds = agg.totalSeconds;
        const recordDates = agg.recordDates || [];
        const validRecordDates = recordDates
          .map((d) => moment(d))
          .filter((m) => m.isValid())
          .sort((a, b) => a.valueOf() - b.valueOf());

        const formatRecordCreatedDisplay = () => {
          if (!recordDates.length) {
            return 'Не указана';
          }
          const fmt = (d) => moment(d).format('DD.MM.YYYY HH:mm:ss');
          if (recordDates.length === 1) {
            return fmt(recordDates[0]);
          }
          if (!validRecordDates.length) {
            return 'Не указана';
          }
          const first = validRecordDates[0];
          const last = validRecordDates[validRecordDates.length - 1];
          if (first.isSame(last)) {
            return first.format('DD.MM.YYYY HH:mm:ss');
          }
          return `${first.format('DD.MM.YYYY HH:mm:ss')} — ${last.format('DD.MM.YYYY HH:mm:ss')}`;
        };

        // Находим пользователя
        const workingUser = taskUsers.value.find(user => user.ID.toString() === userId);

        // Формируем полное имя постановщика
        const creatorFullName = task.createdByName ? 
          formatTaskUserName(
            task.createdByLastName,
            task.createdByName,
            task.createdBySecondName
          ) : 'Неизвестный постановщик';

        // Формируем полное имя пользователя, который работал над задачей
        const workingUserName = workingUser ? 
          formatTaskUserName(
            workingUser.LAST_NAME,
            workingUser.NAME,
            workingUser.SECOND_NAME
          ) : `Пользователь ${userId}`;
        
        // Формируем полное имя исполнителя (ответственного)
        const responsibleFullName = task.responsibleName ? 
          formatTaskUserName(
            task.responsibleLastName,
            task.responsibleName,
            task.responsibleSecondName
          ) : 'Не назначен';
        
        // Преобразуем статус в читаемый формат
        const statusLabel = TASK_STATUS_LABELS[task.status] || 'Неизвестный статус';
        
        // Преобразуем приоритет
        const priorityLabel = getPriorityLabel(task.priority);
        
        // Форматируем даты
        const createdDateFormatted = task.createdDate ? 
          moment(task.createdDate).format('DD.MM.YYYY HH:mm') : 'Не указана';
        const recordCreatedDateGroup = validRecordDates.length
          ? validRecordDates[0].format('YYYY-MM-DD')
          : '—';
        const deadlineFormatted = task.deadline ? moment(task.deadline).format('DD.MM.YYYY HH:mm') : 'Не указан';
        
        // Конвертируем секунды в часы
        const timeSpentHours = Math.round((totalSeconds / 3600) * 100) / 100;
        
        // Создаем запись для таблицы
        finalTasksData.push({
          ...task,
          // В качестве ответственного указываем пользователя, который вносил время
          responsibleFullName: workingUserName,
          responsibleId: parseInt(userId),
          creatorFullName,
          statusLabel,
          priorityLabel,
          createdDateFormatted,
          recordCreatedDateGroup,
          deadlineFormatted,
          timeSpentInLogs: timeSpentHours,
          timeSpentSeconds: totalSeconds,
          originalResponsibleFullName: responsibleFullName,
          timeLogUserFullName: workingUserName,
          recordCreatedDisplay: formatRecordCreatedDisplay(),
          commentDisplay: '—',
          taskTypeUfLabel: task.taskTypeUfLabel ?? '',
          isTimeContributor: true, // Флаг, что это запись о времени пользователя
          workingUserId: parseInt(userId), // ID пользователя, который работал над задачей
          uniqueKey: `${task.id}_${userId}` // Уникальный ключ для идентификации
        });
      });
    });

    // Сортировка: исполнитель → дата создания записи (новые сверху) → id
    finalTasksData.sort((a, b) => {
      const nameCmp = String(a.responsibleFullName || '').localeCompare(String(b.responsibleFullName || ''), 'ru');
      if (nameCmp !== 0) return nameCmp;
      const dateCmp = String(b.recordCreatedDateGroup || '').localeCompare(String(a.recordCreatedDateGroup || ''));
      if (dateCmp !== 0) return dateCmp;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    });

    // Обновляем данные таблицы
    tasksTableDate.value = finalTasksData;

  } catch (error) {
    console.error('Ошибка при получении данных для второго отчета:', error);
    errorDisplay.value = 'Ошибка при загрузке данных для отчета по задачам';
    errorDialog.value = true;
  } finally {
    tasksLoading.value = false;
  }
};

// Функция для экспорта детализированных данных по заявкам
const exportDetailedInvoicesToExcel = () => {
  try {
    const wb = XLSX.utils.book_new();
    
    const excelData = itemsTableDate.value.map(item => ({
      'Название': item.title,
      'Исполнитель': item.FULL_NAME,
      'Статус': item.stageId,
      'Дата начала': item.begindate,
      'Дата выполнения': item.closedate,
      'Время затрачено': item.duration,
      'Подкатегория': item.ufCrm_47_1752752059810,
      'Категория': item.ufCrm_47_1752822806,
      'SLA выполнен': item.ufCrm_47_1752010288013,
      'Дедлайн по SLA': item.ufCrm_47_1752010416
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Добавляем гиперссылки на название заявки (четвертый столбец)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ c: 0, r: row }); // Столбец F (Название)
      if (ws[cellAddress]) {
        const itemIndex = row - 1;
        const itemId = itemsTableDate.value[itemIndex].id;
        const url = `https://ortonica.bitrix24.ru/page/servicedesk_test/servis_desk_2/type/172/details/${itemId}/`;
        
        ws[cellAddress].l = { Target: url, Tooltip: 'Открыть заявку в Bitrix24' };
        ws[cellAddress].s = { font: { color: { rgb: '0000FF' }, underline: true } };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Заявки');
    XLSX.writeFile(wb, `Отчет_по_заявкам_категории_ИТ_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
  } catch (error) {
    console.error('Ошибка при экспорте детализированных данных:', error);
    errorDisplay.value = 'Ошибка при экспорте детализированных данных';
    errorDialog.value = true;
  }
};

function formatSecondsToReadable(seconds) {
  if (!seconds) return '0 минут';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  } else {
    return `${minutes} мин`;
  }
}
// Функция для форматирования имени пользователя задачи
function formatTaskUserName(lastName, name, secondName) {
  const nameParts = [];
  if (lastName) nameParts.push(lastName);
  if (name) nameParts.push(name);
  if (secondName) nameParts.push(secondName);
  
  return nameParts.length > 0 ? nameParts.join(' ') : 'Неизвестный пользователь';
}

/** Подпись для строки группы по дате (ключ YYYY-MM-DD) */
const formatCreatedDateGroupHeader = (value) => {
  if (value === undefined || value === null || value === '—') {
    return 'не указана';
  }
  const m = moment(value, 'YYYY-MM-DD', true);
  return m.isValid() ? m.format('DD.MM.YYYY') : String(value);
};

const collectTaskRowsFromDataTableGroup = (group) => {
  const rows = [];
  const walk = (g) => {
    if (!g?.items) return;
    for (const child of g.items) {
      if (child.type === 'group') {
        walk(child);
      } else if (child.raw) {
        rows.push(child.raw);
      }
    }
  };
  walk(group);
  return rows;
};

const getDateSubgroupTaskCount = (group) => {
  const rows = collectTaskRowsFromDataTableGroup(group);
  return new Set(rows.map((r) => r.id)).size;
};

/** Подгруппа «категория» в отчёте 7: сумма сроков принятия (часы) */
const getReport7CategoryAcceptHours = (group) => {
  const rows = collectTaskRowsFromDataTableGroup(group);
  const sumMs = rows.reduce((acc, r) => acc + Number(r.acceptDurationMs || 0), 0);
  return (sumMs / 3600000).toFixed(2);
};

const getDateSubgroupTimeSpent = (group) => {
  const rows = collectTaskRowsFromDataTableGroup(group);
  const sum = rows.reduce((acc, r) => acc + (Number(r.timeSpentInLogs) || 0), 0);
  return sum.toFixed(2);
};

// Функция для получения сводки по задачам исполнителя
const getTaskSummary = (responsibleName) => {
  const userTasks = tasksTableDate.value.filter(task => 
    task.responsibleFullName === responsibleName
  );
  
  const totalTimeSpent = userTasks.reduce((sum, task) => sum + (task.timeSpentInLogs || 0), 0);
  
  // Подсчитываем уникальные задачи (исключая дубликаты по пользователям)
  const uniqueTaskIds = [...new Set(userTasks.map(task => task.id))];
  
  // Получаем статусы уникальных задач
  const uniqueTasks = uniqueTaskIds.map(taskId => {
    return tasksTableDate.value.find(task => task.id === taskId && task.responsibleFullName === responsibleName);
  }).filter(Boolean);

  // Подсчитываем задачи по статусам
  const completedTasks = uniqueTasks.filter(task => task.status == 5).length;
  const inProgressTasks = uniqueTasks.filter(task => task.status == 3).length;
  const newTasks = uniqueTasks.filter(task => task.status == 1 || task.status == 2).length;

  return {
    totalTasks: uniqueTaskIds.length, // Количество уникальных задач
    totalTimeRecords: userTasks.length, // Количество записей о времени
    totalTimeSpent: totalTimeSpent.toFixed(2),
    completedTasks: completedTasks,
    inProgressTasks: inProgressTasks,
    newTasks: newTasks,
    avgTimePerTask: uniqueTaskIds.length > 0 ? (totalTimeSpent / uniqueTaskIds.length).toFixed(2) : 0
  };
};

const invoicesTable = ref(null);
const tasksTable = ref(null);
const tasksDetailedTable = ref(null);
// Функция для обработки нажатий клавиш
const handleTableKeydown = (event) => {
  const tableElement = event.currentTarget;
  const scrollStep = 50; // Шаг скролла в пикселях

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      tableElement.scrollTop -= scrollStep;
      break;
    case 'ArrowDown':
      event.preventDefault();
      tableElement.scrollTop += scrollStep;
      break;
    case 'ArrowLeft':
      event.preventDefault();
      tableElement.scrollLeft -= scrollStep;
      break;
    case 'ArrowRight':
      event.preventDefault();
      tableElement.scrollLeft += scrollStep;
      break;
    case 'Home':
      event.preventDefault();
      tableElement.scrollTop = 0;
      break;
    case 'End':
      event.preventDefault();
      tableElement.scrollTop = tableElement.scrollHeight;
      break;
    case 'PageUp':
      event.preventDefault();
      tableElement.scrollTop -= tableElement.clientHeight;
      break;
    case 'PageDown':
      event.preventDefault();
      tableElement.scrollTop += tableElement.clientHeight;
      break;
  }
};

const closeAllDialogs = () => {
  report1Dialog.value = false;
  report2Dialog.value = false;
  report3Dialog.value = false;
  newReportsDialog.value = false;
  reportsDialog.value = false;
};

watch(report1Dialog, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (invoicesTable.value) {
        invoicesTable.value.$el.focus();
      }
    });
  }
});

watch(report2Dialog, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (tasksTable.value) {
        tasksTable.value.$el.focus();
      }
    });
  }
});
watch(report3Dialog, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (tasksDetailedTable.value) {
        tasksDetailedTable.value.$el.focus();
      }
    });
  }
});
watch(newReportsDialog, async (newVal) => {
  if (newVal && !newReportResponsibles.value.length) {
    try {
      await loadNewReportResponsibles();
    } catch (error) {
      console.error('Ошибка загрузки фильтров новых отчетов:', error);
    }
  }
});
watch(newReportTab, () => {
  newReportRows.value = [];
  newReportSummary.value = {
    completed: 0,
    overdue: 0,
    onTimePercent: 0,
    report3DurationLabel: '—',
    report4AvgAcceptLabel: '—',
    report4AvgAcceptMs: null,
    report4AvgCompleteLabel: '—',
    report4AvgByTaskType: [],
    report4AvgByCategory: [],
    text: ''
  };
});
// Сбрасываем выбор при закрытии диалога
watch(reportsDialog, (newVal) => {
  if (!newVal) {
    selectedReport.value = null;
  }
});
</script>

<style lang="sass">

  .v-list-item__content
    display: flex
    align-items: center
    justify-content: space-between

  .v-stepper-actions
    display: none !important

  .v-stepper-window
    margin: 0.6rem !important

  .buttons
    display: flex
    justify-content: space-between
    padding: 0 1.5rem 1.5rem 1.5rem

  .v-messages, .v-input__details
    display: none

  .links
    padding: 0

  .links .v-list-item
    padding: 0

  .links .v-list-item__content
    border-bottom: 1px rgba(var(--v-border-color), 0.5) solid
    padding: 0.5rem
    padding-bottom: 1rem

  .v-card-text
    display: flex
    flex-direction: column
    gap: 1.5rem

  .success.white--text
      background: #4cb050
      display: flex
      align-items: center
      justify-content: center
      padding: 0 1rem
      height: 4rem
      color: white
      font-size: 1.25rem

  .error.white--text
      background: #e30f0f
      display: flex
      align-items: center
      justify-content: center
      padding: 0 1rem
      height: 4rem
      color: white
      font-size: 1.25rem

  .successDialog .v-card-actions, .errorDialog .v-card-actions
      border-top: 1px solid #dddddd

  .loading 
        width: 100%
        height: 100%
        display: flex
        flex-direction: column
        align-items: center
        justify-content: center
        gap: 1rem
        font-size: 2rem
        font-weight: 500

  .reports-button
    width: 100%
    margin-top: 1rem

  .close-report
    margin-left: auto !important

  .summary-grid-container
    padding: 16px !important
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)
    border-bottom: 2px solid #dee2e6

  .summary-grid-compact
    display: grid
    grid-template-columns: 1fr 2fr 1fr
    gap: 16px
    align-items: center

  .grid-header
    display: flex
    align-items: center
    gap: 12px

  .executor-name
    font-weight: 700
    color: #2c3e50
    font-size: 16px

  .grid-stats
    display: flex
    gap: 8px

  .stat-item
    display: flex
    flex-direction: column
    align-items: center
    padding: 8px
    background: white
    border-radius: 8px
    box-shadow: 0 2px 4px rgba(0,0,0,0.1)
    flex: 1 1 0
    height: fit-content
    text-wrap: nowrap

  .stat-number
    font-weight: 800
    font-size: 18px
    color: #3498db

  .stat-label
    font-size: 11px
    color: #7f8c8d
    text-align: center

  tr td:nth-child(5)
    min-width: 17rem

  td
    padding-top: 0.5rem !important
    padding-bottom: 0.5rem !important

  .task-link
    color: black

  .reports-menu
    display: grid
    grid-template-columns: 1fr 1fr
    column-gap: 1rem

  .reports-menu
    .report-card
      border: 2px solid #e0e0e0
      border-radius: 12px
      transition: all 0.3s ease
      cursor: pointer
      
      &:hover
        border-color: #2196f3
        transform: translateY(-2px)
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15)
      
      &.report-card-active
        border-color: #2196f3
        background-color: #f5fbff
        
        .report-title
          color: #2196f3

    .report-title
      font-size: 1.1rem
      font-weight: 600
      margin-bottom: 4px
      color: #333
      transition: color 0.3s ease

    .report-description
      font-size: 0.9rem
      color: #666
      margin: 0

  .report4-task-type-cards .v-card-text
    gap: 0


  // Адаптивность для мобильных устройств
  @media (max-width: 600px)
    .reports-menu
      .report-card
        .v-icon
          font-size: 28px !important
          
      .report-title
        font-size: 1rem
        
      .report-description
        font-size: 0.85rem

</style>
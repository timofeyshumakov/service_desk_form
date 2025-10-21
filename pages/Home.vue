
<template>
  <v-app>
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <v-main v-else>
      <v-container class="pa-8">
        <v-stepper
          v-model="step"
          :items="['Основные данные', 'Дополнительные поля']"
        >
          <template v-slot:item.1>
                <v-card title="Дополнительные поля">
                  <v-card-text>
        <v-autocomplete
          v-model="form.direction"
          :items="directions"
          label="Направление"
          @update:modelValue="onDirectionChange"
          required
          variant="outlined"
          :rules="[v => !!v || 'Поле обязательно']"
        ></v-autocomplete>
        <v-autocomplete
          v-if="form.direction === '1С'"
          v-model="form.requestType"
          :items="requestTypes"
          label="Тип заявки"
          @update:modelValue="onRequestTypeChange"
          required
          variant="outlined"
        ></v-autocomplete>
        <v-autocomplete
          v-if="(form.direction === '1С' && form.requestType) || (form.direction !== '1С')"
          v-model="form.category"
          :items="categories"
          label="Категория"
          @update:modelValue="onCategoryChange"
          required
          variant="outlined"
        ></v-autocomplete>
        <v-autocomplete
          v-if="(form.direction === 'ИТ' && subcategories.length > 0)"
          v-model="form.subcategory"
          :items="subcategories"
          label="Подкатегория"
          required
          variant="outlined"
        ></v-autocomplete>

        <v-textarea
          v-model="form.description"
          label="Подробное описание"
          required
          variant="outlined"
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
                <v-card title="Дополнительные поля">
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

                      <v-autocomplete
                        v-model="threatsOpportunities"
                        :items="threatsOptions"
                        label="Угрозы/Возможности"
                        v-show="form.requestType === 'Запрос на обслуживание' || form.requestType === 'Запрос на изменение'"
                        required
                        :rules="[v => !!v || 'Поле обязательно']"
                        variant="outlined"
                      ></v-autocomplete>
                  </v-card-text>
                </v-card>
    </template>
      <div class="buttons">
        <v-btn v-if="step > 1" @click="step--">назад</v-btn>
        <v-btn color="primary" prepend-icon="mdi-play" @click="showVideo = true">Видеоинструкция</v-btn>
        <v-btn v-if="step < 2 && showContinueButton" color="secondary" @click="step = 2">Продолжить</v-btn>
        <v-btn v-if="step === 2 || !showContinueButton && step === 1"  :color="isValid ? 'success' : null" @click="completeStepper">создать заявку</v-btn>
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
            <span>Просмотр видео</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="showVideo = false"
            ></v-btn>
          </v-card-title>
          <v-card-text>
            <video
              ref="videoPlayer"
              class="video-player"
              :src="videoSrc"
              controls
            >
                <source :src="videoSrc" type="video/mp4">
                Ваш браузер не поддерживает HTML5 видео.
            </video>
          </v-card-text>
        </v-card>
      </v-dialog>
  <!-- Диалог выбора отчетов -->
  <v-dialog v-model="reportsDialog" max-width="600">
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
            v-for="report in reports" 
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
          :group-by="[{ key: 'responsibleFullName', order: 'asc' }]" 
          items-per-page="-1" 
          hide-default-footer
          ref="tasksTable"
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
              </td>
            </tr>
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
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import TheForm from '../components/TheForm/TheForm.vue';
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
  description: '',
  links: [],
  files: [],
});
const step = ref(1); // Начинаем сразу со 2 шага для демонстрации
const valid = ref(false);
const project = ref('');
const urgency = ref(null);
const importance = ref(null);
const threatsOpportunities = ref(null);
const incidentType = ref('Запрос на обслуживание'); // Это значение должно приходить с 1 шага
const newLink = ref('');

const pivotTableDate = ref([]);
const itemsTableDate = ref([]);
const tasksTableDate = ref([]);
const search = ref([]);

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
  fields.value = await callApi("crm.item.fields", {}, [], 172);
  fields.value = fields.value.fields;
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
    console.log("Получено записей времени для задач заявок:", elapsedItems.length);

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
    console.log("Рассчитано время для задач:", Object.keys(taskTimeMap).length);

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
const directions = ref(['1С', 'Битрикс24', 'ИТ']);

const requestTypes = ref([
  'Инцидент',
  'Запрос на обслуживание',
  'Запрос на доступ',
  'Запрос на изменение',
]);

const categoryOptions = ref({
  '1С': {
    'Инцидент': [
      '[1С]: Исправление ошибок в существующем функционале',
      '[1С]: Правила обмена',
    ],
    'Запрос на обслуживание': [
      '[1С]: Закрытие периода',
      '[1С]: Корректировка данных',
      '[1С]: Консультация',
      '[1С]: Обновление версий ПО',
    ],
    'Запрос на изменение': [
      '[1С]: Создание или модификация отчета/расчета/справочника/документа',
      '[1С]: Печатная форма документа',
    ],
    'Запрос на доступ': [
      '[1С]: Доступ к системе/разделам'
    ],
  },
  'Битрикс24': [
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

const subcategoryOptions = ref({
  'Рабочее место': [
    'Перемещение и переподключение',
    'Требуется помощь',
    'Установка/удаление программного обеспечения',
    'Подключение и настройка периферийных устройств',
    'Комплексная подготовка согласно чек листу',
    'Провести оценку технического состояния оборудования',
    'Не работает периферийное устройство (мышь/клавиатура)',
    'Ошибки в работе программного обеспечения',
    'ПК или ноутбук не включается, перезагружается, медленно работает',
    'Установка и настройка оборудования',
    'Создание учетных записей',
  ],
  'Печать': [
    'Подключить к принтеру / МФУ',
    'Предоставить запасной картридж',
    'Принтер/МФУ не печатает',
    'Принтер/МФУ печатает с дефектами',
    'Сканер не включается или работает с ошибками',
    'Устранение замятия бумаги на принтере/МФУ',
  ],
  'Электронная почта': [
    'Настройка переадресации почты',
    'Настройка почтовой программы',
    'Письма не принимаются или не отправляются',
    'Не удается авторизоваться',
  ],
  'Видеоконференцсвязь. Корпоративные чаты и мессенджеры': [
    'Установка и настройка',
    'Ошибки при работе',
  ],
  'Специализированное складское и торговое оборудование': [
    'Настройка оборудования (тсд, сканеры шк, кассы...)',
    'Не работает оборудование',
  ],
  'Удаленный рабочий стол RDP': [
    'Консультации по работе и настройка',
    'Ошибки при работе',
    'Ошибки при работе (более 5 человек)',
  ],
  'Система контроля и управления доступом': [
    'Предоставление прав к сетевым дискам',
    'Предоставление прав и видеонаблюдение',
    'Регистрация на эл. площадках',
    'Тех. поддержка соисполнителей',
    'Удаленное подключение к сети компании (VPN)',
    'Система контроля и управления доступом (СКУД)',
  ],
  'Локальная сеть (ЛВС)': [
    'Монтаж ЛВС и WiFi точек',
    'Поддержание и продление доменных имен в сети Интернет',
    'Сбои в ЛВС/WiFi',
  ],
  'IT инфраструктура': [
    'Изменение мониторинга',
    'Создание виртуальной машины/изменение ресурсов',
    'Резервная копия информационного ресурса',
    'Восстановление информационного ресурса из резервной копии',
  ],
  'Электронная цифровая подпись и МЧД': [
    'Выпуск ЭЦП',
    'Выпуск МЧД',
    'Проблемы с ЭЦП и МЧД',
  ],
  'Телефония': [
    'Подготовка и настройка телефона',
    'Заказ сим-карт',
    'Настройка маршрутов обзвона',
    'Настройка прав для входа в личный кабинет и прослушивания звонков',
    'Не могут дозвониться',
    'Не работает телефон',
    'Недостаточно средств',
  ],
});

const isValid = computed(() => {
  if(form.value.direction === "1С" && urgency.value && importance.value){
    
    if((form.value.requestType === 'Запрос на обслуживание' || form.value.requestType === 'Запрос на изменение') && !!threatsOpportunities.value) {
      return true;
    }else if(form.value.requestType !== 'Запрос на обслуживание' && form.value.requestType !== 'Запрос на изменение'){
      return true;
    }else{
      return false;
    }
    return true;
  }else if(form.value.direction !== null && form.value.direction !== "1С"){
    return true;
  }else{
    return false;
  }
});

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

const subcategories = computed(() => {
  if(form.value.category){
      return subcategoryOptions.value[form.value.category.replace("[ИТ]: ", "")] || [];
  }else{
    return [];
  }
});

const showContinueButton = ref(false);
// Methods
const onDirectionChange = () => {
  if(form.value.direction === "1С" && form.value.requestType){
    showContinueButton.value = true;
  }else{
    showContinueButton.value = false;
  }

  form.value.requestType = null;
  form.value.category = null;
  form.value.subcategory = null;
};

const onRequestTypeChange = () => {
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

const completeStepper = async() => {
  //try {
    if(isValid.value){
      let itemId = 0;
      isLoading.value = true;
      const b64Files = await codeFiles(form.value.files);
      let fields = [];
      await new Promise((resolve) => {
        BX24.callMethod(
        'crm.item.fields', {
            entityTypeId: 172
        }, (res) => {
            fields = res.data().fields;
            resolve();
          }
        )
      });

const oldValues = [
  form.value.direction && `Направление: ${form.value.direction}`,
  form.value.requestType && `Тип заявки: ${form.value.requestType}`,
  form.value.category && `Категория: ${form.value.category}`,
  form.value.subcategory && `Подкатегория: ${form.value.subcategory}`,
  form.value.description && `Описание: ${form.value.description}`,
  form.value.links.length > 0 && `Ссылки: ${form.value.links.join(', ')}`,
  project.value && `Проект[1С]: ${project.value}`,
  urgency.value && `Срочность[1С]: ${urgency.value}`,
  importance.value && `Важность[1С]: ${importance.value}`,
  threatsOpportunities.value && `Угрозы/Возможности[1С]: ${threatsOpportunities.value}`
]
  .filter(Boolean) // Удаляем все пустые (false) значения
  .join('\n'); // Объединяем оставшиеся значения с переносом строки

    await new Promise((resolve) => {
      BX24.callMethod(
        'crm.item.add', {
            entityTypeId: 172,
            fields: 
            {
              'title': 'test',
              'comments': '123',
              "categoryId": 69,
              'ufCrm47_1752822542': form.value.category ? form.value.category.indexOf("[Б24]: ") >= 0 ? fields.ufCrm47_1752822542.items.find(item => item.VALUE === form.value.category.replace("[Б24]: ", "")).ID : null : null, //б24
              'ufCrm47_1752752059810': form.value.subcategory ? fields.ufCrm47_1752752059810.items.find(item => item.VALUE === form.value.subcategory).ID : null,// под ит
              'ufCrm47_1752822806': form.value.category ? form.value.category.indexOf("[ИТ]: ") >= 0 ? fields.ufCrm47_1752822806.items.find(item => item.VALUE === form.value.category.replace("[ИТ]: ", "")).ID : null : null,// ит
              'ufCrm47_1752751229696': form.value.category ? form.value.category.indexOf("[1С]: ") >= 0 ? fields.ufCrm47_1752751229696.items.find(item => item.VALUE === form.value.category.replace("[1С]: ", "")).ID : null : null,// 1с
              "ufCrm47_1706781047803": form.value.direction ? fields.ufCrm47_1706781047803.items.find(item => item.VALUE === form.value.direction).ID : null, //направление
              'ufCrm47_1698839820': b64Files, //Файлы / скрины
              'ufCrm47_1706781202419': form.value.description,
              'ufCrm47_1751371044498': form.value.requestType ? fields.ufCrm47_1751371044498.items.find(item => item.VALUE === form.value.requestType).ID : null,
              'ufCrm47_1752218749933': importance.value ? fields.ufCrm47_1752218749933.items.find(item => item.VALUE === importance.value).ID : null, //Важность [1С]
              'ufCrm47_1752218774249': urgency.value ? fields.ufCrm47_1752218774249.items.find(item => item.VALUE === urgency.value).ID : null, //Срочность [1С]
              'ufCrm47_1752218834398': threatsOpportunities.value ? fields.ufCrm47_1752218834398.items.find(item => item.VALUE === threatsOpportunities.value).ID : null, //Угрозы/Возможности [1С]
              'ufCrm47_1752218606665': project.value, //Проект [1C]
              //'ufCrm47_1743432030': threatsOpportunities.value ? fields.ufCrm47_1743432030.items.find(item => item.VALUE === threatsOpportunities.value).ID : null, //ПРИОРИТЕТ
              'ufCrm47_1706781277387': form.value.links.join(', '), //Ссылка для уточнения (А)*/
            }
        }, (res) => {
            form.value = {
              direction: null,
              requestType: null,
              category: null,
              subcategory: null,
              description: '',
              links: [],
              files: [],
            };
            step.value = 1;
            newLink.value = '';
            project.value = '';
            urgency.value = null;
            importance.value = null;
            threatsOpportunities.value = null;
            isValid.value = false;
            itemId = res.data().item.id;
            resolve();
          }
        )
    });

    await new Promise((resolve) => {
          BX24.callMethod(
        "crm.timeline.comment.add",
        {
            fields:
            {
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
 // } catch (error) {
 //   errorDisplay.value = error;
 //   errorDialog.value = true;
 // } finally {
    isLoading.value = false;
 // }
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
      loadTaskUsers()
    ]);
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
      { "ID": [13063, 489, 9735, 9731, 320] },
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
          "ID": [10051, 11307, 12031, 9989, 12603, 12181],
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
    id: 2,
    title: 'Затраченное время по задачам',
    description: 'Затраченное время на задачи по ответственному',
    icon: 'mdi-clock-outline'
  },
  {
    id: 3,
    title: 'Отчет по задачам категории ИТ',
    description: 'Количество задач и затраченное время с фильтрами',
    icon: 'mdi-chart-bar'
  }
]);
const report3Dialog = ref(false);
const tasksDetailedTableDate = ref([]);
const tasksDetailedLoading = ref(false);

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
    if (taskIds.length > 0) {
      tasksData = await callApi(
        "tasks.task.list", 
        {"ID": taskIds},
        ['id', 'title', 'status', 'createdDate', 'deadline', 'priority', 'responsibleId', 'createdBy', 'createdByName', 'createdByLastName', 'createdBySecondName', 'responsibleName', 'responsibleLastName', 'responsibleSecondName']
      );

      // Преобразуем структуру данных
      if (Array.isArray(tasksData)) {
        tasksData = tasksData.reduce((acc, current) => {
          return acc.concat(current.tasks || []);
        }, []);
      } else {
        tasksData = tasksData.tasks || [];
      }
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
        responsibleSecondName: task.responsibleSecondName
      };
    });

    // Формируем массив записей с полной информацией
    const detailedRecords = elapsedItems.map(item => {
      const taskInfo = taskInfoMap[item.TASK_ID] || {
        title: `Задача ${item.TASK_ID}`,
        status: 0,
        createdDate: null,
        deadline: null,
        priority: 2
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
        taskPriority: getPriorityLabel(taskInfo.priority)
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
    console.log("Фильтр даты:", filteredDate);
    
    // Создаем фильтр для временных записей
    const timeFilter = {};
    if (filteredDate.length >= 2) {
      timeFilter['>=CREATED_DATE'] = filteredDate[0].split("T")[0];
      timeFilter['<=CREATED_DATE'] = filteredDate[1].split("T")[0];
    } else {
      // Значения по умолчанию, если даты не установлены
      timeFilter['>=CREATED_DATE'] = "2025-08-01";
      timeFilter['<=CREATED_DATE'] = "2025-09-01";
    }
console.log(sessionStorage.getItem("selectedUsers"));

    const elapsedItems = await getTaskElapsedItems(
      {'>=CREATED_DATE': filteredDate[0].split("T")[0], '<=CREATED_DATE': filteredDate[1].split("T")[0], "USER_ID": sessionStorage.getItem("selectedUsers").split(",")},
      ['ID', 'TASK_ID', "SECONDS", "USER_ID", "CREATED_DATE"], 
      ''
    );

    console.log("Получено записей времени:", elapsedItems.length);

    // Получаем ID пользователей из taskUsers для фильтрации
    const taskUserIds = invoiceUsers.value.map(user => user.ID.toString());
    console.log("Пользователи для учета:", taskUserIds);
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

    console.log("Задачи с временем:", Object.keys(taskTimeByUser).length);

    // Получаем детальную информацию о задачах
    const uniqueTaskIds = [...new Set(elapsedItems.map(item => item.TASK_ID))];
    console.log("Уникальных задач:", uniqueTaskIds.length);

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

    console.log("Получено детальных данных задач:", tasksDetailedData.length);

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

    console.log("Финальный набор данных:", detailedTasksWithUsers.length, "записей");

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
  reportsDialog.value = false;
  
  if (reportId === 1) {
    report1Dialog.value = true;
  } else if (reportId === 2) {
    report2Dialog.value = true;
  } else if (reportId === 3) {
    report3Dialog.value = true;
  }
};

// Обновим функцию backToReportsMenu
const backToReportsMenu = () => {
  report1Dialog.value = false;
  report2Dialog.value = false;
  report3Dialog.value = false;
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

// Заголовки таблицы задач
const tasksTableHeaders = ref([
  { title: 'Наименование', value: 'title', sortable: true },
  { title: 'Статус', value: 'statusLabel', sortable: true },
  { title: 'Постановщик', value: 'creatorFullName', sortable: true },
  { title: 'Исполнитель', value: 'responsibleFullName', sortable: true },
  { title: 'Время', value: 'timeSpentInLogs', sortable: true },
]);
const handleTasksData = async (tasks) => {
 try {
    tasksLoading.value = true;
    
    // Получаем период из фильтра
    const filteredDate = sessionStorage.getItem("date")?.split(",") || [];
    console.log("Фильтр даты для второго отчета:", filteredDate);
    
    // Создаем фильтр для временных записей за период
    const timeFilter = {};
    if (filteredDate.length >= 2) {
      timeFilter['>=CREATED_DATE'] = filteredDate[0].split("T")[0];
      timeFilter['<=CREATED_DATE'] = filteredDate[1].split("T")[0];
    } else {
      // Значения по умолчанию, если даты не установлены
      timeFilter['>=CREATED_DATE'] = "2025-08-01";
      timeFilter['<=CREATED_DATE'] = "2025-09-01";
    }

    // Получаем выбранных пользователей из фильтра
    const selectedUsers = sessionStorage.getItem("selectedUsers")?.split(",") || [];
    if (selectedUsers.length > 0 && selectedUsers[0] !== '') {
      timeFilter["USER_ID"] = selectedUsers;
    }

    console.log("Фильтр для временных записей:", timeFilter);

    // 1. Сначала получаем все записи о затраченном времени за период
    const elapsedItems = await getTaskElapsedItems(
      timeFilter,
      ['ID', 'TASK_ID', "SECONDS", "USER_ID", "CREATED_DATE"], 
      ''
    );

    console.log("Найдено записей времени за период:", elapsedItems.length);

    if (elapsedItems.length === 0) {
      tasksTableDate.value = [];
      tasksLoading.value = false;
      return;
    }

    // 2. Извлекаем уникальные ID задач из записей времени
    const uniqueTaskIds = [...new Set(elapsedItems.map(item => item.TASK_ID))];
    console.log("Уникальных задач за период:", uniqueTaskIds.length);

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
            "responsibleSecondName"
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
      }
    //}

    console.log("Получено детальных данных задач:", tasksDetailedData.length);

    // 4. Группируем записи времени по задачам и пользователям
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
        priority: 2
      };

      // Создаем отдельную запись для каждого пользователя, который работал над задачей
      Object.entries(timeRecords).forEach(([userId, totalSeconds]) => {
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
    finalTasksData.sort((a, b) => a.id - b.id);

    console.log("Финальный набор данных для второго отчета:", finalTasksData.length, "записей");

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
    display: none

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
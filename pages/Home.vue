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
  <v-dialog v-model="report1Dialog" max-width="1200" scrollable>
    <v-card>
      <v-card-title class="success white--text d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-btn icon @click="backToReportsMenu" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          Отчет по заявкам категории ИТ
        </div>
        <v-btn icon small @click="report1Dialog = false" class="ma-1">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
<TheForm @update-data="handleInvoicesData" :users="users"></TheForm>
            <v-data-table :items="itemsTableDate" :headers="itemsTableHeaders" :group-by="[{ key: 'FULL_NAME', order: 'asc' }]" items-per-page="-1" hide-default-footer>
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
                            <span class="stat-number">{{ getSummary(item.value).openCount }}</span>
                            <span class="stat-label">Открыто</span>
                          </div>
                          
                          <div class="stat-item">
                            <span class="stat-number">{{ getSummary(item.value).closedCount }}</span>
                            <span class="stat-label">Закрыто</span>
                          </div>
                          
                          <div class="stat-item">
                            <span class="stat-number">{{ getSummary(item.value).totalDeals }}</span>
                            <span class="stat-label">Всего</span>
                          </div>
                          
                          <div class="stat-item">
                            <span class="stat-number">{{ getSummary(item.value).overdueCount }}</span>
                            <span class="stat-label">Просрочено</span>
                          </div>
                          
                          <div class="stat-item">
                            <span class="stat-number">{{ getSummary(item.value).overduePercentage }}%</span>
                            <span class="stat-label">Просрочено %</span>
                          </div>
                          <div class="stat-item">
                              <span class="stat-number">{{ getSummary(item.value).totalTimeSpent }}</span>
                              <span class="stat-label">Затрачено времени:</span>
                          </div>
                          <div class="stat-item">
                              <span class="stat-number">{{ getSummary(item.value).overdueTimeSpent }}</span>
                              <span class="stat-label">Время просрочки:</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Диалог отчета 2 (новый пустой) -->
  <v-dialog v-model="report2Dialog" max-width="800">
    <v-card>
      <v-card-title class="primary white--text d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-btn icon @click="backToReportsMenu" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          Отчет по задачам
        </div>
        <v-btn icon small @click="closeAllDialogs" class="ma-1">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text class="pa-6 text-center">
        <TheForm @updateTaskData="handleTasksData" :users="users" reportType="tasks"></TheForm>
        <v-data-table :items="tasksTableDate" :headers="tasksTableHeaders" items-per-page="-1" hide-default-footer></v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import TheForm from '../components/TheForm/TheForm.vue';
import moment from 'moment';
import { callApi } from '../functions/callApi';

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
        { title: 'Исполнитель', value: 'userName', sortable: true },
        { title: 'Открыто', value: 'openCount', sortable: true },
        { title: 'Закрто', value: 'closedCount', sortable: true },
        { title: 'Всего', value: 'totalDeals', sortable: true },
        { title: 'Времени затрачено', value: 'totalTimeSpent', sortable: true },
        { title: 'Просрочено', value: 'overdueCount', sortable: true },
        { title: 'Просрочено %', value: 'overduePercentage', sortable: true },
        { title: 'Время просрочки', value: 'overdueTimeSpent', sortable: true },
]);

const itemsTableHeaders = ref([
        { title: 'id', value: 'id', sortable: true },
        { title: 'Исполнитель', value: 'FULL_NAME', sortable: true },
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

const tasksTableHeaders = ref([
        { title: 'id', value: 'id', sortable: true },
        { title: 'Исполнитель', value: 'FULL_NAME', sortable: true },
]);

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
  //pivotTableDate.value = data;
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
}

const handleTasksData = (data) => {
  const tasks = data.reduce((acc, current) => {
    return acc.concat(current.tasks);
}, []);
tasksTableDate.value = tasks;
}

function formatMillisecondsToDHM(ms, d) {
  const duration = moment.duration(ms);
  
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  if(d){
    return `${days} дней`;
  }else{
    return `${days} дней ${hours} часов ${minutes} минут`;
  }
}

function replaceIdsWithNames(data, fieldDefinitions) {
   data.map(item => {
    console.log(item);
    const newItem = {};
    if(item.closedate){
      item.duration = item.closedate ? formatMillisecondsToDHM(-moment(item.begindate).diff(moment(item.closedate)), true) : "";
    }

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
        item.FULL_NAME = users.value.find(user => user.ID == item.ufCrm_47_1700468491).FULL_NAME;
      } else{
        // Оставляем другие поля как есть
        newItem[key] = item[key];
      }
    }
    
    return newItem;

  });

}

const calculateOverdueDeals = (data) => {
  const userMap = {};
  
  data.forEach(deal => {
    const userId = deal.ufCrm_47_1700468491; // Исполнитель
    if (!userId) return;
    
    if (!userMap[userId]) {
      userMap[userId] = {
        userId,
        userName: findUserNameById(userId, users.value),
        totalDeals: 0,
        overdueCount: 0,
        closedCount: 0,
        openCount: 0,
        totalTimeSpent: 0,
        overdueTimeSpent: 0,
        overduePercentage: 0,
      };
    }
    
    userMap[userId].totalDeals++;
    
    // Проверяем, была ли сделка просрочена
    const deadline = moment(deal.ufCrm_47_1704813732503); // Планируемая дата завершения
    const closeDate = deal.closedate ? moment(deal.closedate) : null; // Фактическая дата завершения
    const createDate = moment(deal.begindate); // Дата создания сделки
    
    // Расчет времени, затраченного на сделку (в миллисекундах)
    if (deal.stageId === "DT172_69:SUCCESS" && closeDate) {
      userMap[userId].totalTimeSpent += closeDate.diff(createDate);
      userMap[userId].closedCount++;
    } else if (deal.stageId !== "DT172_69:SUCCESS") {
      // Для открытых сделок считаем время от создания до текущего момента
      userMap[userId].totalTimeSpent += moment().diff(createDate);
      userMap[userId].openCount++;
    }
    
    // Проверка на просрочку
    if (closeDate && closeDate.isAfter(deadline) && deal.stageId !== "DT172_69:SUCCESS") {
      userMap[userId].overdueCount++;
      userMap[userId].overdueTimeSpent += moment().diff(deadline);
    }
  });
  
  // Преобразуем данные для вывода
  const result = Object.values(userMap).map(user => {
    // Рассчитываем процент просроченных сделок
    const overduePercentage = user.totalDeals > 0 
      ? Math.round((user.overdueCount / user.totalDeals) * 100) 
      : 0;

    const totalTimeSpent = user.totalDeals > 0
    ? formatMillisecondsToDHM(user.totalTimeSpent)
    : '0 дней 0 часов 0 минут';

    const overdueTimeSpent = user.totalDeals > 0
    ? formatMillisecondsToDHM(user.overdueTimeSpent)
    : '0 дней 0 часов 0 минут';

    return {
      ...user,
      overduePercentage,
      totalTimeSpent,
      overdueTimeSpent,
      // Можно добавить другие вычисляемые поля
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
      console.log(1);
      return true;
    }else if(form.value.requestType !== 'Запрос на обслуживание' && form.value.requestType !== 'Запрос на изменение'){
      console.log(form.value.requestType);
      return true;
    }else{
      console.log(3);
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

console.log(fields);
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

onMounted(async() => {
  BX24.callMethod(
    'tasks.task.get',
    {taskId:475437},
    function(res){console.log(res.answer.result);}
);
  BX24.callMethod(
    "user.get",
    {
        "ID": [10051, 11307, 12031, 9989, 12603, 12181],
    },
    function(result)
    {
        if(result.error())
            console.error(result.error());
        else
          users.value = result.data();
          users.value.forEach(user => user.FULL_NAME = formatFullName(user));
    }
);
  isLoading.value = false;
});

const getSummary = (userName) => pivotTableDate.value.find(u => u.userName === userName) || {
  openCount: 0,
  closedCount: 0,
  totalDeals: 0,
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
    description: 'Зачтаченное время на задачи по ответственному',
    icon: 'mdi-clock-outline'
  }
]);

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
const backToReportsMenu = () => {
  report1Dialog.value = false;
  report2Dialog.value = false;
  reportsDialog.value = true;
};
const openReport = (reportId) => {
  reportsDialog.value = false;
  
  if (reportId === 1) {
    report1Dialog.value = true;
  } else if (reportId === 2) {
    report2Dialog.value = true;
  }
};
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
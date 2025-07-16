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
          label="Ссылка"
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
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

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
  return subcategoryOptions.value[form.value.category] || [];
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
  { title: '1 – не срочно', value: 1 },
  { title: '2 – срочно', value: 2 }
];

const importanceOptions = [
  { title: '1 – менее важно', value: 1 },
  { title: '2 – более важно', value: 2 }
];

const threatsOptions = [
  { title: '0 – устранение негативного влияния', value: 1 },
  { title: '1 – улучшение влияет на процесс', value: 2 },
  { title: '2 – улучшение влияет на компанию', value: 3 }
];

//const b64Files = ref([]);

const codeFiles = async(files) => {
  let encodedFiles = [];

      try {
        for (const file of files) {
          const base64 = await fileToBase64(file);
          encodedFiles.push({
            name: file.name,
            base64: base64.split(',')[1] || base64 // Удаляем префикс data URL если есть
          });
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
  try {
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

    await new Promise((resolve) => {
      BX24.callMethod(
        'crm.item.add', {
            entityTypeId: 172,
            fields: 
            {
              'title': 'test',
              'comments': '123',
              "categoryId": 69,
              "ufCrm47_1706781047803": "" //направление
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
            project.value = '';
            urgency.value = null;
            importance.value = null;
            threatsOpportunities.value = null;
            incidentType.value = null;
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
                "COMMENT": "Подтвердить закупку по почте!",
            }
        }
      );
      resolve();
    });

  }
  } catch (error) {
    errorDisplay.value = error;
    errorDialog.value = true;
  } finally {
    isLoading.value = false;
    successDialog.value = true;
  }
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

onMounted(() => {
  isLoading.value = false;
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
</style>
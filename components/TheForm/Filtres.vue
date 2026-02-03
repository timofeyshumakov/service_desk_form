<template lang="pug">
Date(
    :showInput="showInput"
    :selectedDateIso="selectedDateIso"
    :reportType="reportType"
)

//- Поле выбора типа задачи (только для задач)
v-autocomplete(
    v-if="reportType === 'tasks'"
    v-model="selectedTaskTypes"
    :items="taskTypes"
    label="Тип задачи"
    single-line
    hide-details
    variant="outlined"
    multiple
    chips
    clearable
)
    template(v-slot:prepend-item)
        v-list-item
            v-list-item-content
                v-list-item-title
                    v-checkbox(
                        label="Выбрать все типы"
                        :modelValue="selectAllTaskTypes"
                        @change="toggleSelectAllTaskTypes()"
                    )

//- Поле выбора сотрудников
v-autocomplete(
    v-model="selectedUsers"
    :items="filterUsers"
    item-title="FULL_NAME"
    item-value="ID"
    single-line
    variant="outlined"
    multiple
    chips
    clearable
    :loading="loadingUsers"
    :label="userLabel"
)
    template(v-slot:prepend-item)
        v-list-item
            v-list-item-content
                v-list-item-title
                    v-checkbox(
                        :label="selectAllLabel"
                        :modelValue="selectedAllUsers"
                        @change="toggleSelectAllUsers()"
                    )
</template>

<script lang="js">
import Date from './Date/Date.vue';
import { useParseStore } from '../../stores/store.js';
import { useMyStore } from '../../stores/store.js';
import { callApi } from '../../functions/callApi.ts';

// Сервис конфигурации пользователей
class UserConfigService {
  static getDefaultSelectedUsers(userIds, reportType, options = {}) {
    const config = {
      // ID пользователей, которые НЕ должны быть выбраны по умолчанию
      excludedByDefault: options.excludedByDefault || [],
      // ID пользователей, которые всегда должны быть выбраны
      alwaysSelected: options.alwaysSelected || [],
      // Тип отчета
      reportType: reportType
    };
    
    // Для отчета по задачам исключаем некоторых пользователей по умолчанию
    if (reportType === 'tasks') {
      // Здесь можно задать логику исключения
      // Например, исключаем пользователей с определенными ID
      const defaultExcluded = ['9097', '12993', '12603', '10051', '12181', '12031', '320']; // Пример: ID пользователей, которые не выбираются по умолчанию
      console.log(userIds.filter(userId => 
        ![...defaultExcluded, ...config.excludedByDefault].includes(userId)
      ));
      return userIds.filter(userId => 
        ![...defaultExcluded, ...config.excludedByDefault].includes(userId)
      );
    }
    
    // Для других отчетов выбираем всех пользователей
    return [...userIds];
  }
}

// Сервис для работы с пользователями (обновленный)
class UserService {
  constructor(users = [], options = {}) {
    this.users = users;
    this.userIds = users.map(u => u.ID);
    this.options = options;
  }

  setUsers(users) {
    this.users = users;
    this.userIds = users.map(u => u.ID);
    return this;
  }

  getAllUserIds() {
    return [...this.userIds];
  }

  getDefaultSelectedUsers(reportType) {
    return UserConfigService.getDefaultSelectedUsers(
      this.userIds, 
      reportType, 
      this.options
    );
  }

  formatUser(user) {
    return {
      ID: user.ID,
      FULL_NAME: `${user.LAST_NAME || ''} ${user.NAME || ''} ${user.SECOND_NAME || ''}`.trim(),
      NAME: user.NAME,
      LAST_NAME: user.LAST_NAME,
      SECOND_NAME: user.SECOND_NAME,
      EMAIL: user.EMAIL,
      WORK_POSITION: user.WORK_POSITION
    };
  }

  formatUsers(users) {
    return users.map(user => this.formatUser(user));
  }
}

// Остальные сервисы остаются без изменений...
class FilterService {
  constructor(parseStore) {
    this.parseStore = parseStore;
  }

  resetFilters() {
    this.parseStore.resetFilters();
    return this;
  }

  setDateFilters(dateField, dateRange) {
    if (dateRange[0]) {
      this.parseStore.setFilter(`>${dateField}`, dateRange[0]);
    }
    if (dateRange[1]) {
      this.parseStore.setFilter(`<${dateField}`, dateRange[1]);
    }
    return this;
  }

  setUserFilter(fieldName, userIds) {
    if (userIds && userIds.length > 0) {
      this.parseStore.setFilter(fieldName, userIds);
    }
    return this;
  }

  setSingleFilter(fieldName, value) {
    if (value !== undefined && value !== null) {
      this.parseStore.setFilter(fieldName, value);
    }
    return this;
  }
}

class FilterStrategyFactory {
  static createStrategy(reportType) {
    const strategies = {
      'invoices': new InvoiceFilterStrategy(),
      'tasks': new TaskFilterStrategy()
    };
    
    return strategies[reportType] || strategies['invoices'];
  }
}

class BaseFilterStrategy {
  constructor() {
    if (this.constructor === BaseFilterStrategy) {
      throw new Error("Cannot instantiate abstract class");
    }
  }

  getDateField() {
    throw new Error("Method 'getDateField()' must be implemented");
  }

  getDefaultFilters(selectedTaskTypes) {
    throw new Error("Method 'getDefaultFilters()' must be implemented");
  }

  getDefaultUserFilter() {
    throw new Error("Method 'getDefaultUserFilter()' must be implemented");
  }
}

class InvoiceFilterStrategy extends BaseFilterStrategy {
  getDateField() {
    return 'closedate';
  }

  getDefaultFilters() {
    return [
      { field: "categoryId", value: "69" },
      { field: "!ufCrm_47_1752752059810", value: null }
    ];
  }

  getDefaultUserFilter() {
    return { field: "ufCrm_47_1700468491", value: [] };
  }
}

class TaskFilterStrategy extends BaseFilterStrategy {
  getDateField() {
    return 'CREATED_DATE';
  }

  getDefaultFilters() {
    return [
      { field: "GROUP_ID", value: 517 }
    ];
  }

  getDefaultUserFilter() {
    return { field: "RESPONSIBLE_ID", value: [] };
  }
}

class StorageService {
  static saveState(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Ошибка сохранения в sessionStorage (${key}):`, error);
    }
  }

  static loadState(key) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Ошибка загрузки из sessionStorage (${key}):`, error);
      return null;
    }
  }
}

class TaskUserLoader {
  static async loadTaskUsers() {
    const userIds = [13063, 8951, 489, 9731, 320, 10051, 12031, 9097, 12181, 12603, 12993, 14087];
    
    try {
      const usersData = await callApi(
        "user.get",
        { "ID": userIds },
        [],
        0,
        0,
        0
      );
      return usersData;
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      throw error;
    }
  }
}

export default {
  components: { Date },
  props: {
    branchInfo: {},
    selectedPaymentMethods: {},
    paymentMethods: {},
    selectedDateIso: {},
    users: {},
    reportType: {
      type: String,
      default: 'invoices'
    },
    // Новый пропс для конфигурации исключений пользователей
    userExclusions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const myStore = useMyStore();
    const parseStore = useParseStore();
    
    return {
      showInput: [false, false, false, false, false, false],
      selectedDateIso: [null, null],
      parseStore,
      myStore,
      invoices: myStore,
      
      // Сервисы с конфигурацией
      userService: new UserService(this.users, {
        excludedByDefault: this.userExclusions
      }),
      filterService: new FilterService(parseStore),
      filterStrategy: FilterStrategyFactory.createStrategy(this.reportType),
      
      // Состояние компонента
      filterUsers: this.users,
      selectedAllUsers: false, // Теперь по умолчанию false, т.к. не все выбраны
      selectedUsers: [],
      loadingUsers: false,
      
      // Типы задач
      taskTypes: ['1С', 'Б24'],
      selectedTaskTypes: ['1С'],
      selectAllTaskTypes: true
    }
  },
  computed: {
    userLabel() {
      return this.reportType === 'invoices' ? 'Исполнитель' : 'Ответственный';
    },
    selectAllLabel() {
      return this.reportType === 'invoices' ? 'Выбрать всех исполнителей' : 'Выбрать всех ответственных';
    },
    // Проверяем, выбраны ли все пользователи
    areAllUsersSelected() {
      return this.selectedUsers.length === this.userService.getAllUserIds().length;
    }
  },
  methods: {
    async submit() {
      this.filterStrategy = FilterStrategyFactory.createStrategy(this.reportType);
      
      // Сбрасываем фильтры
      this.filterService.resetFilters();
      
      // Устанавливаем фильтры даты
      this.filterService.setDateFilters(
        this.filterStrategy.getDateField(),
        this.selectedDateIso
      );
      
      // Устанавливаем фильтры пользователей
      const userFilter = this.filterStrategy.getDefaultUserFilter();
      this.filterService.setUserFilter(userFilter.field, this.selectedUsers);
      
      // Устанавливаем остальные фильтры по умолчанию
      const defaultFilters = this.filterStrategy.getDefaultFilters(this.selectedTaskTypes);
      defaultFilters.forEach(filter => {
        this.filterService.setSingleFilter(filter.field, filter.value);
      });
      
      // Для задач добавляем типы задач
      if (this.reportType === 'tasks') {
        this.$emit('update:selected-task-types', this.selectedTaskTypes);
      }
      
      // Сохраняем состояние
      this.saveState();
      
      console.log('Выбранные пользователи:', this.selectedUsers);
    },
    
    // Загрузка сотрудников для задач из API
    async loadTaskUsers() {
      this.loadingUsers = true;
      try {
        const usersData = await TaskUserLoader.loadTaskUsers();
        const formattedUsers = this.userService.formatUsers(usersData);
        
        this.userService.setUsers(formattedUsers);
        this.filterUsers = formattedUsers;
        
        // Получаем пользователей, выбранных по умолчанию с учетом исключений
        const defaultSelectedUsers = this.userService.getDefaultSelectedUsers(this.reportType);
        this.selectedUsers = defaultSelectedUsers;
        
        // Обновляем состояние "Выбрать всех"
        this.selectedAllUsers = this.selectedUsers.length === this.userService.getAllUserIds().length;
        
        this.$emit('update:users', formattedUsers);
        
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        this.useFallbackUsers();
      } finally {
        this.loadingUsers = false;
      }
    },
    
    useFallbackUsers() {
      this.userService.setUsers(this.users);
      this.filterUsers = this.users;
      
      // Получаем пользователей, выбранных по умолчанию с учетом исключений
      const defaultSelectedUsers = this.userService.getDefaultSelectedUsers(this.reportType);
      this.selectedUsers = defaultSelectedUsers;
      
      // Обновляем состояние "Выбрать всех"
      this.selectedAllUsers = this.selectedUsers.length === this.userService.getAllUserIds().length;
    },
    
    toggleSelectAllUsers() {
      if (this.selectedAllUsers) {
        this.selectedAllUsers = false;
        this.selectedUsers = [];
      } else {
        this.selectedUsers = this.userService.getAllUserIds();
        this.selectedAllUsers = true;
      }
    },
    
    toggleSelectAllTaskTypes() {
      if (this.selectAllTaskTypes) {
        this.selectAllTaskTypes = false;
        this.selectedTaskTypes = [];
      } else {
        this.selectedTaskTypes = [...this.taskTypes];
        this.selectAllTaskTypes = true;
      }
    },
    
    saveState() {
      StorageService.saveState("date", this.selectedDateIso);
      StorageService.saveState("selectedUsers", this.selectedUsers);
    },
    
    initializeForReportType() {
      this.filterStrategy = FilterStrategyFactory.createStrategy(this.reportType);
      
      if (this.reportType === 'tasks') {
        this.loadTaskUsers();
      } else {
        this.useFallbackUsers();
      }
      
      // Инициализируем типы задач
      this.selectedTaskTypes = ['1С'];
      this.selectAllTaskTypes = true;
    }
  },
  watch: {
    users(newUsers) {
      this.userService.setUsers(newUsers);
      this.filterUsers = newUsers;
      
      // Обновляем выбранных пользователей
      const defaultSelectedUsers = this.userService.getDefaultSelectedUsers(this.reportType);
      this.selectedUsers = defaultSelectedUsers;
      
      // Обновляем состояние "Выбрать всех"
      this.selectedAllUsers = this.selectedUsers.length === this.userService.getAllUserIds().length;
    },
    
    selectedUsers(newSelectedUsers) {
      // Обновляем состояние "Выбрать всех" при изменении выбранных пользователей
      this.selectedAllUsers = newSelectedUsers.length === this.userService.getAllUserIds().length;
    },
    
    reportType(newType) {
      this.initializeForReportType();
    },
    
    selectedTaskTypes(value) {
      this.selectAllTaskTypes = value.length === this.taskTypes.length;
    }
  },
  async created() {
    this.initializeForReportType();
  }
}
</script>

<style lang="sass">
form .v-field__field
    max-height: 7rem
    overflow: hidden
    
.v-autocomplete
    margin-bottom: 1rem
</style>
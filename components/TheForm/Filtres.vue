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
        item-title="name"
        item-value="id"
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
        :items="users"
        item-title="FULL_NAME"
        item-value="ID"
        single-line
        variant="outlined"
        multiple
        chips
        clearable
        :loading="loadingUsers"
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
        }
    },
    data() {
        const myStore = useMyStore();
        const parseStore = useParseStore();
        return {
            showInput: [false, false, false, false, false, false],
            selectedBranches: [],
            selectedPaymentMethods: [],
            selectAllBranches: false,
            branchInfo: this.branchInfo,
            branchIds: [],
            selectAllPaymentMethods: false,
            paymentMethods: this.paymentMethods,
            selectedDateIso: [null, null],
            parseStore,
            myStore,
            invoices: myStore,
            
            // Данные для задач
            selectedAllUsers: true,
            userIds: [],
            selectedUsers: [],
            loadingUsers: false,
            
            // Типы задач
            taskTypes: [
                { id: '1c', name: '1С' },
                { id: 'b24', name: 'Битрикс24' }
            ],
            selectedTaskTypes: ['1c', 'b24'],
            selectAllTaskTypes: true
        }
    },
    computed: {
        userLabel() {
            return this.reportType === 'invoices' ? 'Исполнитель' : 'Ответственный';
        },
        selectAllLabel() {
            return this.reportType === 'invoices' ? 'Выбрать всех исполнителей' : 'Выбрать всех ответственных';
        }
    },
    methods: {
        async submit(){
            console.log(this.selectedDateIso[0]);
            
            // Устанавливаем фильтры в зависимости от типа отчета
            if (this.reportType === 'invoices') {
                this.parseStore.resetFilters();
                this.parseStore.setFilter(">closedate", this.selectedDateIso[0]);
                this.parseStore.setFilter("<closedate", this.selectedDateIso[1]);
                this.parseStore.setFilter("categoryId", "69");
                this.parseStore.setFilter("ufCrm_47_1700468491", this.selectedUsers);
                this.parseStore.setFilter("!ufCrm_47_1752752059810", null);
            } else {
                this.parseStore.resetFilters();
                // Фильтры для задач
                const dateField = this.selectedDateField || 'CREATED_DATE';
                this.parseStore.setFilter(`>${dateField}`, this.selectedDateIso[0]);
                this.parseStore.setFilter(`<${dateField}`, this.selectedDateIso[1]);
                this.parseStore.setFilter("RESPONSIBLE_ID", this.selectedUsers);
                this.parseStore.setFilter("GROUP_ID", 517);
                
                // Фильтр по типу задачи
                if (this.selectedTaskTypes.length > 0) {
                    if (this.selectedTaskTypes.includes('1c') && this.selectedTaskTypes.includes('b24')) {
                        // Выбраны оба типа - без фильтрации
                    } else if (this.selectedTaskTypes.includes('1c')) {
                        this.parseStore.setFilter("%=TAGS", "1С");
                    } else if (this.selectedTaskTypes.includes('b24')) {
                        this.parseStore.setFilter("!%=TAGS", "1С");
                    }
                }
            }
        },
        
        // Загрузка сотрудников для задач из API
        async loadTaskUsers() {
            this.loadingUsers = true;
            try {
                const usersData = await callApi(
                    "user.get",
                    { "ID": [13063, 489, 9735, 9731, 320] },
                    [],
                    0,
                    0,
                    0
                );
                
                // Форматируем пользователей
                const formattedUsers = usersData.map(user => ({
                    ID: user.ID,
                    FULL_NAME: `${user.LAST_NAME || ''} ${user.NAME || ''} ${user.SECOND_NAME || ''}`.trim(),
                    NAME: user.NAME,
                    LAST_NAME: user.LAST_NAME,
                    SECOND_NAME: user.SECOND_NAME,
                    EMAIL: user.EMAIL,
                    WORK_POSITION: user.WORK_POSITION
                }));
                
                this.userIds = formattedUsers.map(u => u.ID);
                this.selectedUsers = [...this.userIds];
                this.$emit('update:users', formattedUsers);
                
            } catch (error) {
                console.error('Ошибка загрузки пользователей:', error);
                // Используем переданных пользователей как fallback
                this.userIds = this.users.map(u => u.ID);
                this.selectedUsers = [...this.userIds];
            } finally {
                this.loadingUsers = false;
            }
        },
        
        toggleSelectAllUsers() {
            console.log(this.selectedAllUsers);
            if(this.selectedAllUsers){
                this.selectedAllUsers = false;
                this.selectedUsers = [];
            }else{
                this.selectedUsers = this.userIds;
                this.selectedAllUsers = true;
                console.log(this.selectedAllUsers);
            }
        },
        
        toggleSelectAllTaskTypes() {
            if(this.selectAllTaskTypes){
                this.selectAllTaskTypes = false;
                this.selectedTaskTypes = [];
            }else{
                this.selectedTaskTypes = this.taskTypes.map(type => type.id);
                this.selectAllTaskTypes = true;
            }
        },
        
        clearUsers() {
            this.selectedAllUsers = false;
        },
        
        toggleSelectAllBranches() {
            if(this.selectAllBranches){
                this.selectAllBranches = false;
                this.selectedBranches = [];
            }else{
                this.selectAllBranches = true;
                this.selectedBranches = this.branchIds;
            }
        },
        
        clearBranches() {
            this.selectAllBranches = false;
        },
        
    },
    watch: {
        selectedBranches(value){
            console.log(value);
            this.$emit('update:selectedBranches', value);
        },
        selectedPaymentMethods(value){
            this.$emit('update:selectedPaymentMethods', value);
        },
        reportType(newType) {
            // При смене типа отчета сбрасываем фильтры
            this.parseStore.clearFilters();
            
            if (newType === 'tasks') {
                // Для задач загружаем пользователей из API
                this.loadTaskUsers();
                this.selectedTaskTypes = ['1c', 'b24'];
                this.selectAllTaskTypes = true;
            } else {
                // Для заявок используем переданных пользователей
                this.userIds = this.users.map(u => u.ID);
                this.selectedUsers = [...this.userIds];
                this.selectedAllUsers = true;
            }
        },
        selectedTaskTypes(value) {
            // Автоматически управляем чекбоксом "Выбрать все"
            this.selectAllTaskTypes = value.length === this.taskTypes.length;
        }
    },
    async created() {
        if (this.reportType === 'tasks') {
            // Для задач загружаем пользователей из API
            await this.loadTaskUsers();
        } else {
            // Для заявок используем переданных пользователей
            this.userIds = this.users.map(u => u.ID);
            this.selectedUsers = [...this.userIds];
            this.selectedAllUsers = true;
        }
        
        // Инициализируем типы задач
        this.selectedTaskTypes = ['1c', 'b24'];
        this.selectAllTaskTypes = true;
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
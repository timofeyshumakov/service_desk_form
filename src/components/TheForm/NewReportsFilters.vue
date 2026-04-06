<template>
  <v-form>
      <ReportDateFilter
        :showInput="showInput"
        :selectedDateIso="selectedDateIso"
        @sendValue="emit('send-date', $event)"
      />
      <v-autocomplete
        v-if="reportTab === '1'"
        v-model="selectedResponsibles"
        :items="responsibles"
        item-title="name"
        item-value="id"
        single-line
        label="Ответственные"
        variant="outlined"
        density="compact"
        multiple
        chips
        clearable
      >
        <template v-slot:prepend-item>
          <v-list-item @click="toggleAllResponsibles">
            <template v-slot:prepend>
              <v-checkbox
                :model-value="isAllResponsiblesSelected"
                :indeterminate="isResponsiblesIndeterminate"
                hide-details
                density="compact"
                @click.stop
              />
            </template>
            <v-list-item-title>Выбрать всех ответственных</v-list-item-title>
          </v-list-item>
          <v-divider class="mb-1" />
        </template>
      </v-autocomplete>
      <v-autocomplete
        v-model="selectedDirections"
        :items="directions"
        single-line
        label="Направления"
        variant="outlined"
        density="compact"
        multiple
        chips
        clearable
      >
        <template v-slot:prepend-item>
          <v-list-item @click="toggleAllDirections">
            <template v-slot:prepend>
              <v-checkbox
                :model-value="isAllDirectionsSelected"
                :indeterminate="isDirectionsIndeterminate"
                hide-details
                density="compact"
                @click.stop
              />
            </template>
            <v-list-item-title>Выбрать все направления</v-list-item-title>
          </v-list-item>
          <v-divider class="mb-1" />
        </template>
      </v-autocomplete>
  </v-form>
  <v-btn color="primary" block :loading="loading" @click="emit('submit')">
    Показать отчет
  </v-btn>
</template>

<script setup>
import { computed } from 'vue';
import ReportDateFilter from './Date/Date.vue';

const props = defineProps({
  reportTab: {
    type: String,
    required: true,
  },
  responsibles: {
    type: Array,
    default: () => [],
  },
  directions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showInput: {
    type: Array,
    required: true,
  },
  selectedDateIso: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['send-date', 'submit']);

const selectedResponsibles = defineModel('selectedResponsibles', { default: () => [] });
const selectedDirections = defineModel('selectedDirections', { default: () => [] });

const responsiblesIds = computed(() => props.responsibles.map((u) => u.id));

const isAllResponsiblesSelected = computed(() => {
  const ids = responsiblesIds.value;
  if (!ids.length) return false;
  const sel = new Set(selectedResponsibles.value.map(String));
  return ids.every((id) => sel.has(String(id)));
});

const isResponsiblesIndeterminate = computed(() => {
  const n = selectedResponsibles.value.length;
  const t = props.responsibles.length;
  return t > 0 && n > 0 && n < t;
});

const toggleAllResponsibles = () => {
  if (isAllResponsiblesSelected.value) {
    selectedResponsibles.value = [];
  } else {
    selectedResponsibles.value = [...responsiblesIds.value];
  }
};

const isAllDirectionsSelected = computed(() => {
  const all = props.directions;
  if (!all.length) return false;
  const sel = new Set(selectedDirections.value);
  return all.every((d) => sel.has(d));
});

const isDirectionsIndeterminate = computed(() => {
  const n = selectedDirections.value.length;
  const t = props.directions.length;
  return t > 0 && n > 0 && n < t;
});

const toggleAllDirections = () => {
  if (isAllDirectionsSelected.value) {
    selectedDirections.value = [];
  } else {
    selectedDirections.value = [...props.directions];
  }
};
</script>

<style lang="sass" scoped>
// Как в TheForm.vue: поля в сетке 2 колонки, кнопка снаружи v-form
.v-form
  width: 100%
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 0.75rem

</style>

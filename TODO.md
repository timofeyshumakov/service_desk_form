# TODO: Add "Важно" checkbox for 1C direction in Home.vue

## Plan Steps:
- [x] Step 1: Add `isImportant: false` to form reactive data in script setup
- [x] Step 2: Add v-checkbox "Важно" in template after 1C requestType autocomplete (v-if="form.direction === '1С'", v-model="form.isImportant")
- [ ] Step 3: Update oldValues array in completeStepper() to append `form.isImportant !== undefined && \`Важно[1С]: ${form.isImportant ? 'Да' : 'Нет'}\``
- [ ] Step 4: Add `form.isImportant = false;` to form reset in completeStepper()
- [ ] Step 5: Test form → verify comment includes "Важно[1С]: Да/Нет"
- [ ] Complete task with attempt_completion

**Current progress: 0/6**

<template>
  <Teleport to="body">
    <img
      v-if="hoveredImage"
      :src="hoveredImage"
      class="book-thumb-floating"
      :style="{ top: hoverY + 'px', left: hoverX + 'px' }"
    />
  </Teleport>
  <div>

    <DataTable
      :value="processedBooks"
      sortMode="multiple"
      v-model:filters="filters"
      filterDisplay="row"
      :globalFilterFields="['title','author','publisher','myTags','communityTags']"
      paginator
      :rows="15"
      v-model:first="firstRow"
      :paginatorTemplate="'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown'"
      :currentPageReportTemplate="pageReport"
      sortable
      removableSort
      :multiSortMeta="multiSortMeta"
      stripedRows
      responsiveLayout="scroll"
      resizableColumns
      columnResizeMode="fit"
      size="small"
      rowHover
    >
      <!-- Title Column -->
      <Column field="title" header="Title" sortable filter>
        <template #body="{ data }">
          <div
            class="img-wrapper"
            @mousemove="onThumbMove($event, data.shortImageUrl)"
            @mouseleave="onThumbLeave"
          >
            <img
              v-if="data.shortImageUrl"
              :src="data.shortImageUrl"
              alt="Book Cover"
              class="book-thumb"
            />
          </div>
          {{ data.sample ? "(Sample) " : "" }}
          {{ data.title?.length > 100 ? data.title.slice(0, 100) + '...' : data.title }}
          {{ data.series }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            placeholder="Filter Title..."
            @input="filterCallback()"
          />
        </template>
      </Column>

      <!-- Page Count Column -->
      <Column
        field="pageCount"
        header="Page Count"
        sortable
        filter
        :filterFunction="pageCountFilter"
        dataType="numeric"
      >
        <template #body="{ data }">
          {{ data.pageCount ?? 'N/A' }} 
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            type="text"
            v-model="filterModel.value"
            @input="filterCallback()"
            style="max-width: 5rem;"
          />
        </template>
      </Column>

      <!-- Author Column -->
      <Column field="author" header="Author" sortable filter style="min-width: 15rem">
        <template #body="{ data }">{{ data.author }}</template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            placeholder="Filter Author..."
            @input="filterCallback()"
          />
        </template>
      </Column>

      <Column
        field="read"
        header="Read"
        filter
        :filterFunction="readFilter"
        class="p-column-read"
        :showFilterMenu="false"
      >
        <template #body="{ data }">{{ data.read ? 'Yes' : 'No' }}</template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="statuses"
            optionLabel="label"
            optionValue="value"
            style="padding:0; max-width: 7rem;"
            :showClear="true"
          />
        </template>
      </Column>

      <!-- Dates Column -->
      <Column field="dates" header="Dates">
        <template #body="{ data }">{{ data.dates }}</template>
      </Column>

      <!-- Sources Column -->
      <Column field="sources" header="Sources">
        <template #body="{ data }">
          <Kindle v-if="data.__sources?.includes('AmazonKindleBooks.json')" />
          <Logos v-if="data.__sources?.includes('logosBooks.json')" />
          <Audible v-if="data.__sources?.includes('audible.json')" />
          <AmazonDocs v-if="data.__sources?.includes('amazonDocs.json')" />
        </template>
      </Column>

      <!-- Resource Type Column -->
      <Column field="resourceType" header="Resource Type" sortable filter>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            placeholder="Filter Type..."
            @input="filterCallback()"
          />
        </template>
      </Column>

      <!-- My Tags Column -->
      <Column field="myTags" header="My Tags" filter>
        <template #body="{ data }">{{ data.myTags }}</template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            placeholder="Filter My Tags..."
            @input="filterCallback()"
          />
        </template>
      </Column>

      <!-- Community Tags Column -->
      <Column field="communityTags" header="Community Tags" filter>
        <template #body="{ data }">{{ data.communityTags }}</template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            placeholder="Filter Community Tags..."
            @input="filterCallback()"
          />
        </template>
      </Column>

      <!-- Rating Column -->
      <Column field="communityRating" header="Rating" sortable />

      <!-- Publisher Column -->
      <Column field="publisher" header="Publisher" sortable filter>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            placeholder="Filter Publisher..."
            @input="filterCallback()"
          />
        </template>
      </Column>

      <!-- Acquired Column -->
      <Column field="acquired" header="Acquired" sortable />

      <!-- Series Column -->
      <Column field="Series" header="Series" />
      
    </DataTable>
      
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'

import Audible from '../assets/icons/Audible.vue'
import Kindle from '../assets/icons/Kindle.vue'
import Logos from '../assets/icons/Logos.vue'
import { Select } from 'primevue'
import AmazonDocs from '../assets/icons/AmazonDocs.vue'

export default {
  name: 'BookTable',
  components: { DataTable, Column, InputText, Select, Kindle, Logos, Audible, AmazonDocs },
  props: { books: { type: Array, required: true } },

  data() {
    return {
      filters: {
        global: { value: null, matchMode: 'contains' },
        title: { value: null, matchMode: 'contains' },
        pageCount: { value: null },
        author: { value: null, matchMode: 'contains' },
        publisher: { value: null, matchMode: 'contains' },
        resourceType: { value: null, matchMode: 'contains' },
        myTags: { value: null, matchMode: 'contains' },
        communityTags: { value: null, matchMode: 'contains' },
        read: { value: false, matchMode: 'equals' }
      },
      statuses: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ],
      hoveredImage: null,
      hoverX: 0,
      hoverY: 0,
      firstRow: 0,
      rows: 20,
      multiSortMeta: [
        { field: 'pageCount', order: 1 }
      ],
      processedBooks: this.books.map(b => ({
        ...b,
        author: Array.isArray(b.author) ? b.author.join('; ') : b.author ?? '',
        myTags: Array.isArray(b.myTags) ? b.myTags.join(', ') : b.myTags ?? '',
        communityTags: Array.isArray(b.communityTags) ? b.communityTags.join(', ') : b.communityTags ?? '',
        dates: Array.isArray(b.dates) ? b.dates.join(', ') : b.dates ?? '',
        read: b.read === true ? true : false,
        pageCount: b.pageCount != null ? Number(b.pageCount) : 100000
      }))
    }
  },

  methods: {
    pageCountFilter(value, filterValue) {
      if (!filterValue) return true
      if (filterValue.toLowerCase() === 'null') return value === null
      const num = Number(filterValue)
      if (!isNaN(num)) return value === num
      return false
    },
    readFilter(value, filterValue) {
      if (filterValue === null || filterValue === undefined) return true; // no filter

      if (filterValue === true) return value === true;
      if (filterValue === false) return value === false || value === null;

      return false;
    },
    onThumbMove(event, url) {
      if (!url) return
      this.hoveredImage = url
      this.hoverX = event.clientX + 16
      this.hoverY = event.clientY - 60
    },
    onThumbLeave() {
      this.hoveredImage = null
    },
  },

  computed: {
    pageReport() {
      const first = this.firstRow + 1
      const last = Math.min(this.firstRow + this.rows, this.processedBooks.length)
      const total = this.processedBooks.length
      const readCount = this.processedBooks
        .filter(b => b.read === true).length

      return `Showing ${first} to ${last} of ${total} books (${readCount} read)`
    }

  },
  watch: {
    books: {
      handler(newBooks) {
        this.processedBooks = newBooks.map(b => ({
          ...b,
        author: Array.isArray(b.author) ? b.author.join('; ') : b.author ?? '',
        myTags: Array.isArray(b.myTags) ? b.myTags.join(', ') : b.myTags ?? '',
        communityTags: Array.isArray(b.communityTags) ? b.communityTags.join(', ') : b.communityTags ?? '',
        dates: Array.isArray(b.dates) ? b.dates.join(', ') : b.dates ?? '',
        read: b.read === true ? true : false,
        pageCount: b.pageCount != null ? Number(b.pageCount) : 100000
        }))
      },
      deep: true,
      immediate: true
    }
  }

}
</script>

<style scoped>
.table-controls {
  margin-bottom: 1rem;
}
img {
  margin-right: 6px;
  vertical-align: middle;
}
td {
  vertical-align: top;
  padding: 0;
}

.img-wrapper {
  display: inline-block;
  cursor: zoom-in;
}

.book-thumb {
  width: 16px;
  height: 20px;
  vertical-align: middle;
}

.book-thumb-floating {
  position: fixed;
  width: 120px;
  height: auto;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
}

.p-column-filter-row .p-column-filter.p-column-read .p-column-filter-icon {
  display: none !important;
}
</style>
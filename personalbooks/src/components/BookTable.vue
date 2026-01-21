<template>
  <table class="table">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column">
          {{ column }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(book, index) in books" :key="index">
        <td>{{ book.title }}</td>
        <td>{{ formatAuthorValue(book.author) }}</td>
        <td>{{ formatValue(book.dates) }}</td>
        <td>
          <Kindle v-if="book.__sources?.includes('AmazonKindleBooks.json')" />
          <Logos v-if="book.__sources?.includes('logosBooks.json')" />
          <Audible v-if="book.__sources?.includes('audible.json')" />
        </td>
        <td>{{ book.resourceType }}</td>
        <td>{{ formatValue(book.myTags) }}</td>
        <td>{{ formatValue(book.communityTags) }}</td>
        <td>{{ book.communityRating }}</td>
        <td>{{ book.publisher }}</td>
        <td>{{ book.acquired }}</td>
        <td>{{ book.Series }}</td>
        <td>{{ book.read }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import Audible from '../assets/icons/Audible.vue';
import Kindle from '../assets/icons/Kindle.vue';
import Logos from '../assets/icons/Logos.vue';

export default {
  name: 'BookTable',
  components: {
    Kindle,
    Logos,
    Audible
  },
  props: {
    books: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      columns: [
        'title',
        'author',
        'dates',
        'Sources',
        'resourceType',
        'myTags',
        'communityTags',
        'communityRating',
        'publisher',
        'acquired',
        'Series',
        'read',
      ]
    }
  },
  methods: {
    formatValue(value) {
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      return value ?? ''
    },
    formatAuthorValue(value) {
      if (Array.isArray(value)) {
        return value.join('; ')
      }
      return value ?? ''
    }
  }
}
</script>

<style scoped>
 .table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

.table th,
.table td {
  border: 1px solid #ccc;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}

.table th {
  background: #f0f0f0;
  font-weight: 600;
  white-space: nowrap;
}

.table td {
  word-break: break-word;
}
.icon {
  margin: 0.25rem;
}
</style>

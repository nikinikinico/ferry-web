<template>
  <div class="rank">
    <h4 class="title">
      {{ title }}
      <el-tooltip
        slot="action"
        class="item"
        effect="dark"
        :content="
          $t('按照工单处理节点进行统计，一个工单可能会有多个处理节点。')
        "
        placement="top-end"
      >
        <i class="el-icon-warning-outline" style="float: right" />
      </el-tooltip>
    </h4>
    <ul class="list">
      <li v-for="(item, index) in list" :key="index">
        <span :class="index < 3 ? 'active' : null">{{ index + 1 }}</span>
        <span>{{ item.nickname }} ({{ item.username }})</span>
        <span>{{ item.count }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HandleRank',
  props: {
    title: {
      type: String,
      default: ''
    },
    list: {
      type: Array,
      default: null
    }
  }
}
</script>

<style lang="scss" scoped>
.rank {
  padding: 0 32px 20px 30px;
  .list {
    margin: 25px 0 0;
    padding: 0;
    list-style: none;
    li {
      margin-top: 16px;
      span {
        color: rgba(0, 0, 0, 0.65);
        font-size: 14px;
        line-height: 22px;
        &:first-child {
          background-color: #f5f5f5;
          border-radius: 20px;
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          margin-right: 24px;
          height: 20px;
          line-height: 20px;
          width: 20px;
          text-align: center;
        }
        &.active {
          background-color: #314659;
          color: #fff;
        }
        &:last-child {
          float: right;
        }
      }
    }
  }
}
.mobile .rank {
  padding: 0 32px 32px 32px;
}
</style>

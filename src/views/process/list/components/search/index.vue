<template>
  <div>
    <el-form-item :label="$t('工单标题') + ':'">
      <el-input
        v-model="listQuery.title"
        :placeholder="$t('请输入工单标题')"
        clearable
        size="small"
        style="width: 180px"
        @keyup.enter.native="getList"
      />
    </el-form-item>
    <el-form-item :label="$t('模版数据') + ':'">
      <el-input
        v-model="listQuery.formData"
        :placeholder="$t('请输入模版数据')"
        clearable
        size="small"
        style="width: 180px"
        @keyup.enter.native="getList"
      />
    </el-form-item>
    <el-form-item :label="$t('流程') + ':'">
      <el-select
        v-model="listQuery.process"
        :placeholder="$t('请选择流程')"
        size="small"
        filterable
        clearable
        style="width: 150px"
        @change="getList"
      >
        <el-option
          v-for="item in processValueList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="genre !== 'my-create'" :label="$t('申请人') + ':'">
      <el-select
        v-model="listQuery.creator"
        filterable
        clearable
        remote
        size="small"
        reserve-keyword
        :placeholder="$t('请输入当前处理人')"
        :remote-method="remoteUserList"
        :loading="loading"
        style="width: 210px"
        @change="getList"
      >
        <el-option
          v-for="item in UserOptions"
          :key="item.userId"
          :label="item.nickName"
          :value="item.userId"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="genre !== 'upcoming'" :label="$t('当前处理人')">
      <el-select
        v-model="listQuery.processor"
        filterable
        clearable
        remote
        size="small"
        reserve-keyword
        :placeholder="$t('请输入当前处理人')"
        :remote-method="remoteUserList"
        :loading="loading"
        style="width: 200px"
        @change="getList"
      >
        <el-option
          v-for="item in UserOptions"
          :key="item.userId"
          :label="item.nickName"
          :value="item.userId"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('优先级') + ':'">
      <el-select
        v-model="listQuery.priority"
        :placeholder="$t('请选择优先级')"
        size="small"
        clearable
        style="width: 140px"
        @change="getList"
      >
        <el-option :label="$t('一般')" :value="1" />
        <el-option :label="$t('紧急')" :value="2" />
        <el-option :label="$t('非常紧急')" :value="3" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="genre !== 'upcoming'" :label="$t('是否结束')">
      <el-select
        v-model="listQuery.isEnd"
        :placeholder="$t('请选择状态')"
        size="small"
        clearable
        style="width: 130px"
        @change="getList"
      >
        <el-option :label="$t('是')" :value="1" />
        <el-option :label="$t('否')" :value="0" />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('创建时间') + ':'">
      <el-date-picker
        v-model="timeValue"
        clearable
        size="small"
        type="datetimerange"
        :picker-options="pickerOptions"
        :range-separator="$t('至')"
        :start-placeholder="$t('开始日期')"
        :end-placeholder="$t('结束日期')"
        align="right"
        @change="getList"
        style="width: 380px"
      />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        icon="el-icon-search"
        size="small"
        @click="getList"
        >{{ $t('搜索') }}</el-button
      >
    </el-form-item>
  </div>
</template>

<script>
import { listUser } from '@/api/system/sysuser'

import { parseTime } from '@/utils'
import { processList } from '@/api/process/admin/process'
export default {
  name: 'WorkOrderSearch',
  // eslint-disable-next-line vue/require-prop-types
  props: ['genre'],
  data() {
    return {
      processValueList: [],
      loading: false,
      timeValue: '',
      listQuery: {},
      UserOptions: [],
      pickerOptions: {
        shortcuts: [
          {
            text: this.$t('最近一周'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: this.$t('最近一个月'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: this.$t('最近三个月'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  created() {
    this.getProcessList()
  },
  methods: {
    getList() {
      if (
        this.timeValue === null ||
        this.timeValue === undefined ||
        this.timeValue === ''
      ) {
        this.listQuery.startTime = ''
        this.listQuery.endTime = ''
      } else {
        this.listQuery.startTime = parseTime(this.timeValue[0])
        this.listQuery.endTime = parseTime(this.timeValue[1])
      }
      this.$emit('handleSearch', this.listQuery)
    },
    remoteUserList(query) {
      listUser({
        pageSize: 999999,
        nickName: query
      }).then(res => {
        this.UserOptions = res.data.list
      })
    },
    getProcessList() {
      processList({
        per_page: 999999
      }).then(response => {
        this.processValueList = response.data.data
      })
    }
  }
}
</script>

<style scoped></style>

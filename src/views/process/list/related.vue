<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form ref="listQuery" :model="listQuery" :inline="true">
        <el-form ref="listQuery" :model="listQuery" :inline="true">
          <WorkOrderSearch :genre="'related'" @handleSearch="handleSearch" />
        </el-form>
      </el-form>

      <el-table
        v-loading="loading"
        border
        :data="ticketList"
        @selection-change="handleSelectionChange"
      >
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="ID" prop="id" width="120" />
        <el-table-column
          :label="$t('标题')"
          prop="title"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          :label="$t('流程')"
          prop="process_name"
          :show-overflow-tooltip="true"
        />
        <el-table-column :label="$t('当前状态')" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>
              {{ scope.row.state_name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('当前处理人')"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.is_end === 0">{{
              scope.row.principals
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('优先级')"
          :show-overflow-tooltip="true"
          width="120"
          align="left"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.priority === 2">
              <el-tag type="warning">{{ $t('紧急') }}</el-tag>
            </span>
            <span v-else-if="scope.row.priority === 3">
              <el-tag type="danger">{{ $t('非常紧急') }}</el-tag>
            </span>
            <span v-else>
              <el-tag type="success">{{ $t('一般') }}</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('是否结束')"
          :show-overflow-tooltip="true"
          width="110"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_end === 0" size="mini" type="success">{{
              $t('否')
            }}</el-tag>
            <el-tag v-else size="mini" type="danger">{{ $t('是') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('创建时间')"
          align="center"
          prop="create_time"
          width="180"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.create_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('操作')"
          align="center"
          class-name="small-padding fixed-width"
          width="180"
        >
          <template slot-scope="scope">
            <el-button
              v-permisaction="['process:list:related:select']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleView(scope.row)"
              >{{ $t('查看') }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        :title="$t('转交工单')"
        :visible.sync="dialogVisible"
        width="30%"
      >
        <el-form
          ref="ruleForm"
          :model="ruleForm"
          :rules="rules"
          label-width="60px"
          class="demo-ruleForm"
        >
          <el-form-item :label="$t('节点')" prop="node_id">
            <el-select
              v-model="ruleForm.node_id"
              :placeholder="$t('选择节点')"
              size="small"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in nodeList"
                :key="index"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('用户')" prop="user_id">
            <el-select
              v-model="ruleForm.user_id"
              filterable
              :placeholder="$t('选择用户')"
              size="small"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in users"
                :key="index"
                :label="item.nickName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('备注')">
            <el-input v-model="ruleForm.remarks" type="textarea" size="small" />
          </el-form-item>
          <el-form-item style="text-align: right">
            <el-button type="primary" @click="submitForm('ruleForm')">{{
              $t('提交')
            }}</el-button>
            <el-button @click="dialogVisible = false">{{
              $t('关闭')
            }}</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageIndex"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import { workOrderList } from '@/api/process/work-order'

// 搜索
import WorkOrderSearch from './components/search/index'

export default {
  components: { WorkOrderSearch },
  data() {
    return {
      users: [],
      nodeList: [],
      dialogVisible: false,
      queryParams: {},
      total: 0,
      loading: false,
      ticketList: [],
      listQuery: {
        page: 1,
        per_page: 10
      },
      ruleForm: {
        work_order_id: '',
        node_id: '',
        user_id: '',
        remarks: ''
      },
      rules: {
        node_id: [
          { required: true, message: this.$t('请选择节点'), trigger: 'change' }
        ],
        user_id: [
          { required: true, message: this.$t('请选择用户'), trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.listQuery.page = this.queryParams.pageIndex
      this.listQuery.per_page = this.queryParams.pageSize
      this.listQuery.classify = 3
      workOrderList(this.listQuery).then(response => {
        this.ticketList = response.data.data
        this.queryParams.pageIndex = response.data.page
        this.queryParams.pageSize = response.data.per_page
        this.total = response.data.total_count
        this.loading = false
      })
    },
    handleSearch(val) {
      for (var k in val) {
        this.listQuery[k] = val[k]
      }
      this.getList()
    },
    handleView(row) {
      this.$router.push({
        name: 'ProcessListHandle',
        query: { workOrderId: row.id, processId: row.process }
      })
    },
    handleSelectionChange() {}
  }
}
</script>

<style scoped></style>

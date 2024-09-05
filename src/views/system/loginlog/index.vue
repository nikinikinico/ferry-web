<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="auto"
      >
        <el-form-item :label="$t('登录地址')">
          <el-input
            v-model="queryParams.ipaddr"
            :placeholder="$t('请输入登录地址')"
            clearable
            style="width: 240px"
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="$t('用户名称')">
          <el-input
            v-model="queryParams.username"
            :placeholder="$t('请输入用户名称')"
            clearable
            style="width: 240px"
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="small"
            @click="handleQuery"
            >{{ $t('搜索') }}</el-button
          >
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{
            $t('重置')
          }}</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            v-permisaction="['system:sysloginlog:remove']"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            >{{ $t('删除') }}</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-permisaction="['system:sysloginlog:clean']"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="handleClean"
            >{{ $t('清空') }}</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-permisaction="['system:sysloginlog:export']"
            type="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            >{{ $t('导出') }}</el-button
          >
        </el-col>
      </el-row>

      <el-table
        v-loading="loading"
        border
        :data="list"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          :label="$t('编号')"
          width="100"
          align="center"
          prop="infoId"
        />
        <el-table-column
          :label="$t('用户名称')"
          width="150"
          align="center"
          prop="username"
        />
        <el-table-column
          :label="$t('登录地址')"
          align="center"
          prop="ipaddr"
          width="130"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          :label="$t('登录地点')"
          align="center"
          prop="loginLocation"
        />
        <el-table-column :label="$t('浏览器')" align="center" prop="browser" />
        <el-table-column :label="$t('操作系统')" align="center" prop="os" />
        <el-table-column
          :label="$t('操作信息')"
          width="120"
          align="center"
          prop="msg"
        />
        <el-table-column
          :label="$t('登录日期')"
          align="center"
          prop="loginTime"
          width="180"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.loginTime) }}</span>
          </template>
        </el-table-column>
      </el-table>

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
import { list, delLogininfor, cleanLogininfor } from '@/api/system/loginlog'
import { formatJson } from '@/utils'

export default {
  name: 'Logininfor',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        ipaddr: undefined,
        username: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true
      list(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.list = response.data.list
          this.total = response.data.count
          this.loading = false
        }
      )
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.infoId)
      this.multiple = !selection.length
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const infoIds = row.infoId || this.ids
      this.$confirm(
        this.$t('是否确认删除访问编号为"{infoIds}"的数据项?', {
          infoIds: infoIds
        }),
        this.$t('警告'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }
      )
        .then(function () {
          return delLogininfor(infoIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$t('删除成功'))
        })
        .catch(function () {})
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$confirm(
        this.$t('是否确认清空所有登录日志数据项?'),
        this.$t('警告'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }
      )
        .then(function () {
          return cleanLogininfor()
        })
        .then(response => {
          if (response.code === 200) {
            this.getList()
            this.msgSuccess(this.$t('清空成功'))
          }
        })
        .catch(function () {})
    },
    /** 导出按钮操作 */
    handleExport() {
      // const queryParams = this.queryParams
      this.$confirm(
        this.$t('是否确认导出所有操作日志数据项?'),
        this.$t('警告'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }
      ).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = [
            this.$t('编号'),
            this.$t('用户名称'),
            this.$t('登录地址'),
            this.$t('登录地点'),
            this.$t('浏览器'),
            this.$t('操作系统'),
            this.$t('登录状态'),
            this.$t('操作信息'),
            this.$t('登录日期')
          ]
          const filterVal = [
            'infoId',
            'username',
            'ipaddr',
            'loginLocation',
            'browser',
            'os',
            'status',
            'msg',
            'loginTime'
          ]
          const list = this.list
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: this.$t('登录日志'),
            autoWidth: true, // Optional
            bookType: 'xlsx' // Optional
          })
          this.downloadLoading = false
        })
      })
    }
  }
}
</script>

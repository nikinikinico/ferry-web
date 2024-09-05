<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="auto"
      >
        <el-form-item :label="$t('岗位编码')" prop="postCode">
          <el-input
            v-model="queryParams.postCode"
            :placeholder="$t('请输入岗位编码')"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item :label="$t('岗位名称')" prop="postName">
          <el-input
            v-model="queryParams.postName"
            :placeholder="$t('请输入岗位名称')"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
            style="width: 220px"
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
            v-permisaction="['system:syspost:add']"
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            >{{ $t('新增') }}</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-permisaction="['system:syspost:edit']"
            type="success"
            icon="el-icon-edit"
            size="mini"
            :disabled="single"
            @click="handleUpdate"
            >{{ $t('编辑') }}</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-permisaction="['system:syspost:remove']"
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
            v-permisaction="['system:syspost:export']"
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
        :data="postList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          :label="$t('岗位编号')"
          width="80"
          align="center"
          prop="postId"
        />
        <el-table-column
          :label="$t('岗位编码')"
          align="center"
          prop="postCode"
        />
        <el-table-column
          :label="$t('岗位名称')"
          align="center"
          prop="postName"
        />
        <el-table-column :label="$t('岗位排序')" align="center" prop="sort" />
        <el-table-column :label="$t('状态')" align="center" prop="status">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '1' ? 'danger' : 'success'"
              disable-transitions
              >{{ scope.row.status === '1' ? $t('停用') : $t('正常') }}</el-tag
            >
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
        >
          <template slot-scope="scope">
            <el-button
              v-permisaction="['system:syspost:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              >{{ $t('编辑') }}</el-button
            >
            <el-button
              v-permisaction="['system:syspost:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              >{{ $t('删除') }}</el-button
            >
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
    <!-- 添加或修改岗位对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="auto">
        <el-form-item :label="$t('岗位名称')" prop="postName">
          <el-input
            v-model="form.postName"
            :placeholder="$t('请输入岗位名称')"
          />
        </el-form-item>
        <el-form-item :label="$t('岗位编码')" prop="postCode">
          <el-input
            v-model="form.postCode"
            :placeholder="$t('请输入编码名称')"
          />
        </el-form-item>
        <el-form-item :label="$t('岗位顺序')" prop="sort">
          <el-input-number
            v-model="form.sort"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
        <el-form-item :label="$t('备注')" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :placeholder="$t('请输入内容')"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{
          $t('确定')
        }}</el-button>
        <el-button @click="cancel">{{ $t('取消') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listPost,
  getPost,
  delPost,
  addPost,
  updatePost
} from '@/api/system/post'
import { formatJson } from '@/utils'

export default {
  name: 'Post',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 岗位表格数据
      postList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        postCode: undefined,
        postName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        postName: [
          {
            required: true,
            message: this.$t('岗位名称不能为空'),
            trigger: 'blur'
          }
        ],
        postCode: [
          {
            required: true,
            message: this.$t('岗位编码不能为空'),
            trigger: 'blur'
          }
        ],
        sort: [
          {
            required: true,
            message: this.$t('岗位顺序不能为空'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询岗位列表 */
    getList() {
      this.loading = true
      listPost(this.queryParams).then(response => {
        this.postList = response.data.list
        this.total = response.data.count
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        postId: undefined,
        postCode: undefined,
        postName: undefined,
        sort: 0,
        status: '0',
        remark: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.postId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = this.$t('添加岗位')
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()

      const postId = row.postId || this.ids
      getPost(postId).then(response => {
        this.form = response.data
        this.open = true
        this.title = this.$t('修改岗位')
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.postId !== undefined) {
            updatePost(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(this.$t('修改成功'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addPost(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(this.$t('新增成功'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const postIds = row.postId || this.ids
      this.$confirm(
        this.$t('是否确认删除岗位编号为"{postIds}"的数据项?', {
          postIds: postIds
        }),
        this.$t('警告'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }
      )
        .then(function () {
          return delPost(postIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$t('删除成功'))
        })
        .catch(function () {})
    },
    /** 导出按钮操作 */
    handleExport() {
      // const queryParams = this.queryParams
      this.$confirm(this.$t('是否确认导出所有岗位数据项?'), this.$t('警告'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      })
        .then(() => {
          this.downloadLoading = true
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = [
              this.$t('岗位编号'),
              this.$t('岗位编码'),
              this.$t('岗位名称'),
              this.$t('排序'),
              this.$t('创建时间')
            ]
            const filterVal = [
              'postId',
              'postCode',
              'postName',
              'sort',
              'create_time'
            ]
            const list = this.postList
            const data = formatJson(filterVal, list)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: this.$t('岗位管理'),
              autoWidth: true, // Optional
              bookType: 'xlsx' // Optional
            })
            this.downloadLoading = false
          })
        })
        .catch(function () {})
    }
  }
}
</script>

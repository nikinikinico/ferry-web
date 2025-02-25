<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24" style="padding-right: 0">
        <el-card class="box-card">
          <div class="head-container">
            <el-input
              v-model="deptName"
              :placeholder="$t('请输入部门名称')"
              clearable
              size="small"
              prefix-icon="el-icon-search"
              style="margin-bottom: 20px"
            />
          </div>
          <div class="head-container">
            <el-tree
              ref="tree"
              :data="deptOptions"
              :props="defaultProps"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              default-expand-all
              @node-click="handleNodeClick"
            />
          </div>
        </el-card>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-card class="box-card">
          <el-form
            ref="queryForm"
            :model="queryParams"
            :inline="true"
            label-width="120px"
          >
            <el-form-item :label="$t('用户名称')" prop="username">
              <el-input
                v-model="queryParams.username"
                :placeholder="$t('请输入用户名称')"
                clearable
                size="small"
                style="width: 240px"
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item :label="$t('手机号码')" prop="phone">
              <el-input
                v-model="queryParams.phone"
                :placeholder="$t('请输入手机号码')"
                clearable
                size="small"
                style="width: 250px"
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
              <el-button
                icon="el-icon-refresh"
                size="small"
                @click="resetQuery"
                >{{ $t('重置') }}</el-button
              >
            </el-form-item>
          </el-form>

          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                v-permisaction="['system:sysuser:add']"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
                >{{ $t('新增') }}</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['system:sysuser:edit']"
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
                v-permisaction="['system:sysuser:remove']"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleDelete"
                >{{ $t('删除') }}</el-button
              >
            </el-col>
          </el-row>

          <el-table
            v-loading="loading"
            :data="userList"
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="45" align="center" />
            <el-table-column
              :label="$t('编号')"
              width="80"
              align="center"
              prop="userId"
            />
            <el-table-column
              :label="$t('用户名称')"
              align="center"
              prop="username"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              :label="$t('用户昵称')"
              align="center"
              prop="nickName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              :label="$t('部门')"
              align="center"
              prop="deptName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              :label="$t('手机号码')"
              align="center"
              prop="phone"
              width="120"
            />
            <el-table-column :label="$t('状态')" width="68" align="center">
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.status"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('创建时间')"
              align="center"
              prop="create_time"
              width="165"
            >
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.create_time) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('操作')"
              align="center"
              width="220"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-button
                  v-permisaction="['system:sysuser:edit']"
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleUpdate(scope.row)"
                  >{{ $t('编辑') }}</el-button
                >
                <el-button
                  v-if="scope.row.username !== 'admin'"
                  v-permisaction="['system:sysuser:remove']"
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleDelete(scope.row)"
                  >{{ $t('删除') }}</el-button
                >
                <el-button
                  v-permisaction="['system:sysuser:resetPassword']"
                  size="mini"
                  type="text"
                  icon="el-icon-key"
                  @click="handleResetPwd(scope.row)"
                  >{{ $t('重置') }}</el-button
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
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="auto">
        <el-row>
          <el-col :span="12">
            <el-form-item
              :label="$t('用户名称')"
              prop="username"
              style="width: 90%"
            >
              <el-input
                v-model="form.username"
                :placeholder="$t('请输入用户名称')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('用户昵称')"
              prop="nickName"
              style="width: 90%"
            >
              <el-input
                v-model="form.nickName"
                :placeholder="$t('请输入用户昵称')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.userId == undefined"
              :label="$t('用户密码')"
              prop="password"
              style="width: 90%"
            >
              <el-input
                v-model="form.password"
                :placeholder="$t('请输入用户密码')"
                type="password"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('手机号码')"
              prop="phone"
              style="width: 90%"
            >
              <el-input
                v-model="form.phone"
                :placeholder="$t('请输入手机号码')"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('邮箱')" prop="email" style="width: 90%">
              <el-input
                v-model="form.email"
                :placeholder="$t('请输入邮箱')"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('角色')" style="width: 90%">
              <el-select
                v-model="form.roleId"
                :placeholder="$t('请选择')"
                style="width: 100%"
                @change="$forceUpdate()"
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('归属部门')"
              prop="deptId"
              style="width: 90%"
            >
              <treeselect
                v-model="form.deptId"
                :options="deptOptions"
                :normalizer="normalizer"
                :placeholder="$t('请选择归属部门')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('岗位')" style="width: 90%">
              <el-select
                v-model="form.postId"
                :placeholder="$t('请选择')"
                style="width: 100%"
                @change="$forceUpdate()"
              >
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == 1"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item :label="$t('备注')" style="width: 95%">
              <el-input
                v-model="form.remark"
                type="textarea"
                :placeholder="$t('请输入内容')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{
          $t('确定')
        }}</el-button>
        <el-button @click="cancel">{{ $t('取消') }}</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px">
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          {{ $t('将文件拖到此处，或') }}
          <em>{{ $t('点击上传') }}</em>
        </div>
        <div slot="tip" class="el-upload__tip">
          <el-checkbox v-model="upload.updateSupport" />{{
            $t('是否更新已经存在的用户数据')
          }}
          <el-link
            type="info"
            style="font-size: 12px"
            @click="importTemplate"
            >{{ $t('下载模板') }}</el-link
          >
        </div>
        <div slot="tip" class="el-upload__tip" style="color: red">
          {{ $t('提示：仅允许导入“xls”或“xlsx”格式文件！') }}
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">{{
          $t('确定')
        }}</el-button>
        <el-button @click="upload.open = false">{{ $t('取消') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  exportUser,
  resetUserPwd,
  changeUserStatus,
  importTemplate,
  getUserInit
} from '@/api/system/sysuser'
import { getToken } from '@/utils/auth'
import { treeselect } from '@/api/system/dept'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'User',
  components: { Treeselect },
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
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: '',
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 日期范围
      dateRange: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: 'children',
        label: 'deptName'
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/system/user/importData'
      },
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        username: undefined,
        phone: undefined,
        status: undefined,
        deptId: undefined
      },
      // 表单校验
      rules: {
        username: [
          {
            required: true,
            message: this.$t('用户名称不能为空'),
            trigger: 'blur'
          }
        ],
        nickName: [
          {
            required: true,
            message: this.$t('用户昵称不能为空'),
            trigger: 'blur'
          }
        ],
        deptId: [
          {
            required: true,
            message: this.$t('归属部门不能为空'),
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: this.$t('用户密码不能为空'),
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: this.$t('邮箱地址不能为空'),
            trigger: 'blur'
          },
          {
            type: 'email',
            message: this.$t('请输入正确的邮箱地址'),
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          {
            required: true,
            message: this.$t('手机号码不能为空'),
            trigger: 'blur'
          },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: this.$t('请输入正确的手机号码'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getList()
    this.getTreeselect()
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.userList = response.data.list
          this.total = response.data.count
          this.loading = false
        }
      )
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data
      })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.deptName.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.deptId
      this.getList()
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
    // 用户状态修改
    handleStatusChange(row) {
      const text = row.status === '0' ? this.$t('启用') : this.$t('停用')
      this.$confirm(
        this.$t('确认要"{text}" "{username}"用户吗?', {
          text: text,
          username: row.username
        }),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }
      )
        .then(function () {
          return changeUserStatus(row.userId, row.status)
        })
        .then(() => {
          this.msgSuccess(text + this.$t('成功'))
        })
        .catch(function () {
          row.status = row.status === '0' ? '1' : '0'
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
        userId: undefined,
        deptId: undefined,
        username: undefined,
        nickName: undefined,
        password: undefined,
        phone: undefined,
        email: undefined,
        sex: undefined,
        status: '0',
        remark: undefined,
        postIds: undefined,
        roleIds: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
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
      this.ids = selection.map(item => item.userId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getTreeselect()
      getUserInit().then(response => {
        this.postOptions = response.data.posts
        this.roleOptions = response.data.roles
        this.open = true
        this.title = this.$t('添加用户')
        this.form.password = '123456'
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()

      const userId = row.userId || this.ids
      getUser(userId).then(response => {
        this.form = response.data
        this.postOptions = response.posts
        this.roleOptions = response.roles
        this.form.postIds = response.postIds[0]
        this.form.roleIds = response.roleIds[0]
        this.open = true
        this.title = this.$t('修改用户')
        this.form.password = ''
      })
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt(
        this.$t('请输入"{name}"的新密码', { name: row.username }),
        this.$t('提示'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消')
        }
      )
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then(response => {
            if (response.code === 200) {
              this.msgSuccess(this.$t('修改成功，新密码是：') + value)
            } else {
              this.msgError(response.msg)
            }
          })
        })
        .catch(() => {})
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.userId !== undefined) {
            updateUser(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(this.$t('修改成功'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addUser(this.form).then(response => {
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
      const userIds = row.userId || this.ids
      this.$confirm(
        this.$t('是否确认删除用户编号为"{userIds}"的数据项?', {
          userIds: userIds
        }),
        this.$t('警告'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }
      )
        .then(function () {
          return delUser(userIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$t('删除成功'))
        })
        .catch(function () {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm(this.$t('是否确认导出所有用户数据项?'), this.$t('警告'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      })
        .then(function () {
          return exportUser(queryParams)
        })
        .then(response => {
          this.download(response.msg)
        })
        .catch(function () {})
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = this.$t('用户导入')
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
        this.download(response.msg)
      })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert(response.msg, this.$t('导入结果'), {
        dangerouslyUseHTMLString: true
      })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    }
  }
}
</script>

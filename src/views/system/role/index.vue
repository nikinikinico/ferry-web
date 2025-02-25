<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true">
        <el-form-item :label="$t('角色名称')" prop="roleName">
          <el-input
            v-model="queryParams.roleName"
            :placeholder="$t('请输入角色名称')"
            clearable
            size="small"
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="$t('权限字符')" prop="roleKey">
          <el-input
            v-model="queryParams.roleKey"
            :placeholder="$t('请输入权限字符')"
            clearable
            size="small"
            style="width: 280px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <!-- <el-form-item label=$t('创建时间')>
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder=$t('开始日期')
          end-placeholder=$t('结束日期')
        />
      </el-form-item> -->
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
            v-permisaction="['system:sysrole:add']"
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            >{{ $t('新增') }}</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-permisaction="['system:sysrole:edit']"
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
            v-permisaction="['system:sysrole:remove']"
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
            v-permisaction="['system:sysrole:export']"
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
        :data="roleList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$t('角色编号')" prop="roleId" width="120" />
        <el-table-column
          :label="$t('角色名称')"
          prop="roleName"
          :show-overflow-tooltip="true"
          width="150"
        />
        <el-table-column
          :label="$t('权限字符')"
          prop="roleKey"
          :show-overflow-tooltip="true"
          width="160"
        />
        <el-table-column :label="$t('显示顺序')" prop="roleSort" width="120" />
        <el-table-column :label="$t('状态')" align="center" width="100">
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
              v-permisaction="['system:sysrole:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              >{{ $t('编辑') }}</el-button
            >
            <el-button
              v-permisaction="['system:sysrole:remove']"
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

      <!-- 添加或修改角色配置对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="600px">
        <el-form ref="form" :model="form" :rules="rules" label-width="auto">
          <el-form-item :label="$t('角色名称')" prop="roleName">
            <el-input
              v-model="form.roleName"
              :placeholder="$t('请输入角色名称')"
              :disabled="isEdit"
            />
          </el-form-item>
          <el-form-item :label="$t('权限字符')" prop="roleKey">
            <el-input
              v-model="form.roleKey"
              :placeholder="$t('请输入权限字符')"
              :disabled="isEdit"
            />
          </el-form-item>
          <el-form-item :label="$t('角色顺序')" prop="roleSort">
            <el-input-number
              v-model="form.roleSort"
              controls-position="right"
              :min="0"
            />
          </el-form-item>
          <el-form-item :label="$t('菜单权限')">
            <el-tree
              ref="menu"
              :data="menuOptions"
              show-checkbox
              node-key="id"
              :empty-text="$t('加载中，请稍后')"
              :props="defaultProps"
            />
          </el-form-item>
          <el-form-item :label="$t('备注')">
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

      <!-- 分配角色数据权限对话框 -->
      <el-dialog :title="title" :visible.sync="openDataScope" width="500px">
        <el-form :model="form" label-width="80px">
          <el-form-item :label="$t('角色名称')">
            <el-input v-model="form.roleName" :disabled="true" />
          </el-form-item>
          <el-form-item :label="$t('权限字符')">
            <el-input v-model="form.roleKey" :disabled="true" />
          </el-form-item>
          <el-form-item :label="$t('权限范围')">
            <el-select v-model="form.dataScope">
              <el-option
                v-for="item in dataScopeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-show="form.dataScope == 2" :label="$t('数据权限')">
            <el-tree
              ref="dept"
              :data="deptOptions"
              show-checkbox
              default-expand-all
              node-key="id"
              :empty-text="$t('加载中，请稍后')"
              :props="defaultProps"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitDataScope">{{
            $t('确定')
          }}</el-button>
          <el-button @click="cancelDataScope">{{ $t('取消') }}</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import {
  listRole,
  getRole,
  delRole,
  addRole,
  updateRole,
  dataScope,
  changeRoleStatus
} from '@/api/system/role'
import {
  treeselect as menuTreeselect,
  roleMenuTreeselect
} from '@/api/system/menu'
import {
  treeselect as deptTreeselect,
  roleDeptTreeselect
} from '@/api/system/dept'
import { formatJson } from '@/utils'

export default {
  name: 'Role',
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
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      isEdit: false,
      // 日期范围
      dateRange: [],
      // 数据范围选项
      dataScopeOptions: [
        {
          value: '1',
          label: this.$t('全部数据权限')
        },
        {
          value: '2',
          label: this.$t('自定数据权限')
        },
        {
          value: '3',
          label: this.$t('本部门数据权限')
        },
        {
          value: '4',
          label: this.$t('本部门及以下数据权限')
        },
        {
          value: '5',
          label: this.$t('仅本人数据权限')
        }
      ],
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 表单校验
      rules: {
        roleName: [
          {
            required: true,
            message: this.$t('角色名称不能为空'),
            trigger: 'blur'
          }
        ],
        roleKey: [
          {
            required: true,
            message: this.$t('权限字符不能为空'),
            trigger: 'blur'
          }
        ],
        roleSort: [
          {
            required: true,
            message: this.$t('角色顺序不能为空'),
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
    /** 查询角色列表 */
    getList() {
      this.loading = true
      listRole(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.roleList = response.data.list
          this.total = response.data.count
          this.loading = false
        }
      )
    },
    /** 查询菜单树结构 */
    getMenuTreeselect() {
      menuTreeselect().then(response => {
        this.menuOptions = response.data
      })
    },
    /** 查询部门树结构 */
    getDeptTreeselect() {
      deptTreeselect().then(response => {
        this.deptOptions = response.data.list
      })
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      const checkedKeys = this.$refs.menu.getHalfCheckedKeys()
      // 半选中的菜单节点
      const halfCheckedKeys = this.$refs.menu.getCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
      return checkedKeys
    },
    // 所有部门节点数据
    getDeptAllCheckedKeys() {
      // 目前被选中的部门节点
      const checkedKeys = this.$refs.dept.getCheckedKeys()
      // 半选中的部门节点
      // const halfCheckedKeys = this.$refs.dept.getCheckedKeys()
      // checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
      return checkedKeys
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      roleMenuTreeselect(roleId).then(response => {
        this.menuOptions = response.menus
        this.$nextTick(() => {
          this.$refs.menu.setCheckedKeys(response.checkedKeys)
        })
      })
    },
    /** 根据角色ID查询部门树结构 */
    getRoleDeptTreeselect(roleId) {
      roleDeptTreeselect(roleId).then(response => {
        this.deptOptions = response.depts
        this.$nextTick(() => {
          this.$refs.dept.setCheckedKeys(response.checkedKeys)
        })
      })
    },
    // 角色状态修改
    handleStatusChange(row) {
      const text = row.status === '0' ? this.$t('启用') : this.$t('停用')
      this.$confirm(
        this.$t('确认要"{text}""{roleName}"角色吗?', {
          text: text,
          roleName: row.roleName
        }),
        this.$t('警告'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }
      )
        .then(function () {
          return changeRoleStatus(row.roleId, row.status)
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
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false
      this.reset()
    },
    // 表单重置
    reset() {
      if (this.$refs.menu !== undefined) {
        this.$refs.menu.setCheckedKeys([])
      }
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: '0',
        menuIds: [],
        deptIds: [],
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
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.roleId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getMenuTreeselect()
      this.open = true
      this.title = this.$t('添加角色')
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const roleId = row.roleId || this.ids
      getRole(roleId).then(response => {
        this.form = response.data
        this.open = true
        this.title = this.$t('修改角色')
        this.isEdit = true
        this.getRoleMenuTreeselect(roleId)
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.roleId !== undefined) {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            updateRole(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(this.$t('修改成功'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            addRole(this.form).then(response => {
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
    /** 提交按钮（数据权限） */
    submitDataScope: function () {
      if (this.form.roleId !== undefined) {
        this.form.deptIds = this.getDeptAllCheckedKeys()
        dataScope(this.form).then(response => {
          if (response.code === 200) {
            this.msgSuccess(this.$t('修改成功'))
            this.openDataScope = false
            this.getList()
          } else {
            this.msgError(response.msg)
          }
        })
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const roleIds = row.roleId || this.ids
      this.$confirm(
        this.$t('是否确认删除角色编号为"{roleIds}"的数据项?', {
          roleIds: roleIds
        }),
        this.$t('警告'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }
      )
        .then(function () {
          return delRole(roleIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$t('删除成功'))
        })
        .catch(function () {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm(this.$t('是否确认导出所有角色数据项?'), this.$t('警告'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = [
            this.$t('角色编号'),
            this.$t('角色名称'),
            this.$t('权限字符'),
            this.$t('显示顺序'),
            this.$t('状态'),
            this.$t('创建时间')
          ]
          const filterVal = [
            'roleId',
            'roleName',
            'roleKey',
            'roleSort',
            'status',
            'create_time'
          ]
          const list = this.roleList
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: this.$t('角色管理'),
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

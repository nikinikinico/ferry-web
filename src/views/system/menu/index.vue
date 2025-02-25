<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form :inline="true">
        <el-form-item :label="$t('菜单名称')">
          <el-input
            v-model="queryParams.title"
            :placeholder="$t('请输入菜单名称')"
            clearable
            size="small"
            style="width: 230px"
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
            v-permisaction="['system:sysmenu:add']"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleAdd"
            >{{ $t('新增') }}</el-button
          >
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        border
        :data="menuList"
        row-key="menuId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column
          prop="title"
          :label="$t('菜单名称')"
          :show-overflow-tooltip="true"
          width="180px"
        />
        <el-table-column
          prop="icon"
          :label="$t('图标')"
          align="center"
          width="100px"
        >
          <template slot-scope="scope">
            <svg-icon :icon-class="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('排序')" width="60px" />
        <el-table-column
          prop="permission"
          :label="$t('权限标识')"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          prop="path"
          :label="$t('路径')"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.menuType == 'A'">{{ scope.row.path }}</span>
            <span v-else>{{ scope.row.component }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="visible"
          :label="$t('可见')"
          :formatter="visibleFormat"
          width="80"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.visible === '1' ? 'danger' : 'success'"
              disable-transitions
              >{{ visibleFormat(scope.row) }}</el-tag
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
          width="180"
        >
          <template slot-scope="scope">
            <el-button
              v-permisaction="['system:sysmenu:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              >{{ $t('编辑') }}</el-button
            >
            <el-button
              v-permisaction="['system:sysmenu:add']"
              size="mini"
              type="text"
              icon="el-icon-plus"
              @click="handleAdd(scope.row)"
              >{{ $t('新增') }}</el-button
            >
            <el-button
              v-permisaction="['system:sysmenu:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              >{{ $t('删除') }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px">
      <el-form ref="form" :model="form" :rules="rules" label-width="auto">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('上级菜单')" style="width: 95%">
              <treeselect
                v-model="form.parentId"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                :placeholder="$t('选择上级菜单')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('菜单标题')"
              prop="title"
              style="width: 90%"
            >
              <el-input
                v-model="form.title"
                :placeholder="$t('请输入菜单标题')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('显示排序')" prop="sort">
              <el-input-number
                v-model="form.sort"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item :label="$t('菜单类型')" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">{{ $t('目录') }}</el-radio>
                <el-radio label="C">{{ $t('菜单') }}</el-radio>
                <el-radio label="F">{{ $t('按钮') }}</el-radio>
                <el-radio label="A">{{ $t('接口') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.menuType == 'A'" :label="$t('请求方式')">
              <el-radio-group v-model="form.action">
                <el-radio label="GET">GET</el-radio>
                <el-radio label="POST">POST</el-radio>
                <el-radio label="PUT">PUT</el-radio>
                <el-radio label="DELETE">DELETE</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('菜单图标')" style="width: 95%">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input
                  slot="reference"
                  v-model="form.icon"
                  :placeholder="$t('点击选择图标')"
                  readonly
                >
                  <svg-icon
                    v-if="form.icon"
                    slot="prefix"
                    :icon-class="form.icon"
                    class="el-input__icon"
                    style="height: 32px; width: 16px"
                  />
                  <i
                    v-else
                    slot="prefix"
                    class="el-icon-search el-input__icon"
                  />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.menuType == 'M' || form.menuType == 'C'"
              :label="$t('路由名称')"
              prop="menuName"
              style="width: 90%"
            >
              <el-input
                v-model="form.menuName"
                :placeholder="$t('请输入路由名称')"
              />
            </el-form-item>
          </el-col>

          <el-col
            v-if="form.menuType == 'M' || form.menuType == 'C'"
            :span="12"
          >
            <el-form-item
              :label="$t('组件路径')"
              prop="component"
              style="width: 90%"
            >
              <el-input
                v-model="form.component"
                :placeholder="$t('请输入组件路径')"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              v-if="form.menuType == 'M' || form.menuType == 'C'"
              :label="$t('是否外链')"
            >
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">{{ $t('是') }}</el-radio>
                <el-radio label="1">{{ $t('否') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              v-if="form.menuType != 'F'"
              :label="$t('路由地址')"
              prop="path"
              style="width: 90%"
            >
              <el-input
                v-model="form.path"
                :placeholder="$t('请输入路由地址')"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              v-if="form.menuType == 'F' || form.menuType == 'C'"
              :label="$t('权限标识')"
              style="width: 90%"
            >
              <el-input
                v-model="form.permission"
                :placeholder="$t('请权限标识')"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.menuType != 'F'" :label="$t('菜单状态')">
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in visibleOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                  >{{ dict.dictLabel }}</el-radio
                >
              </el-radio-group>
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
  </div>
</template>

<script>
import {
  listMenu,
  getMenu,
  delMenu,
  addMenu,
  updateMenu
} from '@/api/system/menu'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'

export default {
  name: 'Menu',
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 菜单状态数据字典
      visibleOptions: [
        {
          dictValue: '0',
          dictLabel: this.$t('显示')
        },
        {
          dictValue: '1',
          dictLabel: this.$t('隐藏')
        }
      ],
      // 查询参数
      queryParams: {
        title: undefined,
        visible: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          {
            required: true,
            message: this.$t('菜单标题不能为空'),
            trigger: 'blur'
          }
        ],
        sort: [
          {
            required: true,
            message: this.$t('菜单顺序不能为空'),
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
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      listMenu(this.queryParams).then(response => {
        this.menuList = response.data
        this.loading = false
      })
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.menuId,
        label: node.title,
        children: node.children
      }
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      listMenu().then(response => {
        this.menuOptions = []
        const menu = { menuId: 0, title: this.$t('主类目'), children: [] }
        menu.children = response.data
        this.menuOptions.push(menu)
      })
    },
    // 菜单显示状态字典翻译
    visibleFormat(row) {
      if (row.menuType === 'F') {
        return '-- --'
      } else if (row.visible === '1') {
        return this.$t('隐藏')
      } else if (row.visible === '0') {
        return this.$t('可见')
      }
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: 'M',
        sort: 0,
        action: this.form.menuType === 'A' ? this.form.action : '',
        isFrame: '1',
        visible: '0'
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      this.getTreeselect()
      if (row != null) {
        this.form.parentId = row.menuId
      }
      this.open = true
      this.title = this.$t('添加菜单')
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()
      getMenu(row.menuId).then(response => {
        this.form = response.data
        this.open = true
        this.title = this.$t('修改菜单')
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.menuId !== undefined) {
            updateMenu(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(this.$t('修改成功'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addMenu(this.form).then(response => {
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
      this.$confirm(
        this.$t('是否确认删除名称为"{title}"的数据项?', { title: row.title }),
        this.$t('警告'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }
      )
        .then(function () {
          return delMenu(row.menuId)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$t('删除成功'))
        })
        .catch(function () {})
    }
  }
}
</script>

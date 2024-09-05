<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{ this.$t('个人信息') }}</span>
          </div>
          <div>
            <div class="text-center">
              <userAvatar :user="user" />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" /> {{ this.$t('用户名称') }}
                <div class="pull-right">{{ user.username }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" /> {{ this.$t('手机号码') }}
                <div class="pull-right">{{ user.phone }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" /> {{ this.$t('用户邮箱') }}
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" /> {{ this.$t('所属部门') }}
                <div class="pull-right">{{ deptName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" /> {{ this.$t('所属角色') }}
                <div class="pull-right">{{ roleName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" /> {{ this.$t('创建日期') }}
                <div class="pull-right">{{ parseTime(user.create_time) }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>{{ this.$t('基本资料') }}</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('基本资料')" name="userinfo">
              <userInfo :user="user" />
            </el-tab-pane>
            <el-tab-pane :label="$t('修改密码')" name="resetPwd">
              <resetPwd :user="user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userAvatar from './userAvatar'
import userInfo from './userInfo'
import resetPwd from './resetPwd'
import { getUserProfile } from '@/api/system/sysuser'

export default {
  name: 'Profile',
  components: { userAvatar, userInfo, resetPwd },
  data() {
    return {
      user: {},
      roleGroup: {},
      postGroup: {},
      deptGroup: {},
      activeTab: 'userinfo',
      roleIds: undefined,
      postIds: undefined,
      roleName: undefined,
      postName: undefined,
      dept: {},
      deptName: undefined
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      getUserProfile().then(response => {
        this.user = response.data
        this.roleIds = response.roleIds
        this.roleGroup = response.roles

        if (this.roleIds[0]) {
          for (const key in this.roleGroup) {
            if (this.roleIds[0] === this.roleGroup[key].roleId) {
              this.roleName = this.roleGroup[key].roleName
            }
          }
        } else {
          this.roleName = this.$t('暂无')
        }
        this.dept = response.dept
        this.deptName = this.dept.deptName
      })
    }
  }
}
</script>

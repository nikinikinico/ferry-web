<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="auto">
    <el-form-item :label="$t('旧密码')" prop="oldPassword">
      <el-input
        v-model="user.oldPassword"
        :placeholder="$t('请输入旧密码')"
        type="password"
      />
    </el-form-item>
    <el-form-item :label="$t('新密码')" prop="newPassword">
      <el-input
        v-model="user.newPassword"
        :placeholder="$t('请输入新密码')"
        type="password"
      />
    </el-form-item>
    <el-form-item
      :label="$t('确认密码')"
      prop="confirmPassword"
      style="/* margin-bottom: 10px */"
    >
      <el-input
        v-model="user.confirmPassword"
        :placeholder="$t('请确认密码')"
        type="password"
      />
    </el-form-item>
    <!-- <el-form-item style="margin-bottom: 5px">
      <el-checkbox v-model="passwordTyleStatus">LDAP密码</el-checkbox>
    </el-form-item> -->
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">{{
        $t('保存')
      }}</el-button>
      <!-- <el-button type="danger" size="mini" @click="close">{{
        $t('关闭')
      }}</el-button> -->
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserPwd } from '@/api/system/sysuser'

export default {
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error(this.$t('两次输入的密码不一致')))
      } else {
        callback()
      }
    }
    return {
      passwordTyleStatus: true,
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
        passwordType: 1
      },
      // 表单校验
      rules: {
        oldPassword: [
          {
            required: true,
            message: this.$t('旧密码不能为空'),
            trigger: 'blur'
          }
        ],
        newPassword: [
          {
            required: true,
            message: this.$t('新密码不能为空'),
            trigger: 'blur'
          },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          {
            required: true,
            message: this.$t('确认密码不能为空'),
            trigger: 'blur'
          },
          { required: true, validator: equalToPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (!this.passwordTyleStatus) {
            this.user.passwordType = 0
          }
          this.user.passwordType = 0
          updateUserPwd(
            this.user.oldPassword,
            this.user.newPassword,
            this.user.passwordType
          ).then(response => {
            if (response.code === 200) {
              this.msgSuccess(this.$t('修改成功'))
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/profile/index' })
    }
  }
}
</script>

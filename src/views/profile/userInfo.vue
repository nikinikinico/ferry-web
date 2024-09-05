<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="auto">
    <el-form-item :label="$t('用户昵称')" prop="nickName">
      <el-input v-model="user.nickName" />
    </el-form-item>
    <el-form-item :label="$t('手机号码')" prop="phone">
      <el-input v-model="user.phone" maxlength="11" />
    </el-form-item>
    <el-form-item :label="$t('邮箱')" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item :label="$t('性别')">
      <el-radio-group v-model="user.sex">
        <el-radio label="0">{{ $t('男') }}</el-radio>
        <el-radio label="1">{{ $t('女') }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">{{
        $t('保存')
      }}</el-button>
      <!-- <el-button type="danger" size="mini" @click="close">{{ $t('关闭') }}</el-button> -->
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUser } from '@/api/system/sysuser'

export default {
  props: {
    // eslint-disable-next-line vue/require-default-prop
    user: { type: Object }
  },
  data() {
    return {
      // 表单校验
      rules: {
        nickName: [
          {
            required: true,
            message: this.$t('用户昵称不能为空'),
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
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          updateUser(this.user).then(response => {
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
      this.$router.push({ path: '/dashboard' })
    }
  }
}
</script>

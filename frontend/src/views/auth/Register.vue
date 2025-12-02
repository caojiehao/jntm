<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h1>🎵 基你太美</h1>
        <p class="subtitle">创建您的智能基金管家账号</p>
      </div>

      <div class="register-form">
        <el-form ref="registerForm" :model="registerData" :rules="rules" @submit.prevent="handleRegister">
          <el-form-item prop="username">
            <el-input
              v-model="registerData.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="registerData.email"
              placeholder="请输入邮箱"
              size="large"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerData.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerData.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="nickname">
            <el-input
              v-model="registerData.nickname"
              placeholder="请输入昵称（可选）"
              size="large"
              prefix-icon="Avatar"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleRegister"
              style="width: 100%"
            >
              {{ loading ? '注册中...' : '注册账号' }}
            </el-button>
          </el-form-item>

          <div class="register-footer">
            <router-link to="/login">已有账号？立即登录</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const registerForm = ref()
const loading = ref(false)

const registerData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  nickname: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== registerData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  nickname: [
    { max: 20, message: '昵称不能超过20个字符', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  try {
    await registerForm.value.validate()
    loading.value = true

    // 模拟注册请求
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success('注册成功！请登录')

    // 重定向到登录页
    router.push('/login')

  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请检查输入信息')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  margin: 0;
  font-size: 32px;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.register-form {
  margin-bottom: 20px;
}

.register-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-footer a {
  color: #409eff;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-container {
    padding: 10px;
  }

  .register-box {
    padding: 30px 20px;
    margin: 0 10px;
  }
}
</style>
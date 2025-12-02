<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>🎵 基你太美</h1>
        <p class="subtitle">智能基金管家</p>
      </div>

      <div class="login-form">
        <el-form ref="loginForm" :model="loginData" :rules="rules" @submit.prevent="handleLogin">
          <el-form-item prop="username">
            <el-input
              v-model="loginData.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginData.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              style="width: 100%"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>

          <div class="login-footer">
            <router-link to="/register">还没有账号？立即注册</router-link>
            <span class="divider">|</span>
            <a href="#" @click.prevent="handleForgotPassword">忘记密码？</a>
          </div>
        </el-form>
      </div>

      <div class="theme-preview">
        <h3>投资主题预览</h3>
        <div class="theme-cards">
          <div class="theme-card fire">
            <div class="theme-icon">🏖️</div>
            <h4>提前退休</h4>
            <p>FIRE财务独立主题</p>
          </div>
          <div class="theme-card global">
            <div class="theme-icon">🌍</div>
            <h4>全球配置</h4>
            <p>国际投资配置主题</p>
          </div>
          <div class="theme-card inflation">
            <div class="theme-icon">💰</div>
            <h4>跑赢通胀</h4>
            <p>保值增值主题</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref()
const loading = ref(false)

const loginData = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await loginForm.value.validate()
    loading.value = true

    // 检查是否启用模拟数据
    if (import.meta.env.VITE_DEV_MOCK_DATA === 'true') {
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟登录成功
      const mockUser = {
        id: 1,
        username: loginData.username,
        email: `${loginData.username}@jntm.com`,
        nickname: loginData.username,
        currentTheme: 'fire' as any,
        token: 'mock-jwt-token'
      }

      // 设置用户信息
      authStore.setUser(mockUser)

      ElMessage.success('登录成功！')

      // 重定向到仪表板
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/dashboard')
    } else {
      // 调用真实API进行登录
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: loginData.username,
            password: loginData.password
          })
        })

        if (response.ok) {
          const data = await response.json()

          if (data.success) {
            authStore.setUser(data.user)
            authStore.setToken(data.token)

            ElMessage.success('登录成功！')

            const redirect = router.currentRoute.value.query.redirect as string
            router.push(redirect || '/dashboard')
          } else {
            ElMessage.error(data.message || '登录失败')
          }
        } else {
          ElMessage.error('登录失败，请检查网络连接')
        }
      } catch (apiError) {
        console.error('API登录错误:', apiError)

        // 如果API调用失败，fallback到模拟登录
        console.log('API调用失败，使用模拟登录')

        await new Promise(resolve => setTimeout(resolve, 500))

        const mockUser = {
          id: 1,
          username: loginData.username,
          email: `${loginData.username}@jntm.com`,
          nickname: loginData.username,
          currentTheme: 'fire' as any,
          token: 'mock-jwt-token'
        }

        authStore.setUser(mockUser)

        ElMessage.success('登录成功！（模拟模式）')

        const redirect = router.currentRoute.value.query.redirect as string
        router.push(redirect || '/dashboard')
      }
    }

  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  ElMessage.info('密码重置功能开发中...')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
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

.login-form {
  margin-bottom: 30px;
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-footer a {
  color: #409eff;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

.divider {
  margin: 0 8px;
  color: #ddd;
}

.theme-preview {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.theme-preview h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  text-align: center;
}

.theme-cards {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.theme-card {
  flex: 1;
  text-align: center;
  padding: 16px 8px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}

.theme-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.theme-card h4 {
  margin: 8px 0 4px 0;
  font-size: 14px;
  color: #333;
}

.theme-card p {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }

  .login-box {
    padding: 30px 20px;
    margin: 0 10px;
  }

  .theme-cards {
    flex-direction: column;
  }
}
</style>
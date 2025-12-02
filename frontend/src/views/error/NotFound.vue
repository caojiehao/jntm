<template>
  <div class="not-found">
    <div class="error-container">
      <div class="error-content">
        <div class="error-icon">📄</div>
        <h1 class="error-title">404</h1>
        <h2 class="error-subtitle">页面未找到</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移除。
        </p>

        <div class="error-actions">
          <el-button type="primary" size="large" @click="goHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上页
          </el-button>
        </div>

        <div class="helpful-links">
          <h4>您可能在寻找：</h4>
          <div class="links-grid">
            <a href="/dashboard" @click.prevent="navigateTo('/dashboard')">
              <div class="link-item">
                <div class="link-icon">📊</div>
                <span>仪表板</span>
              </div>
            </a>
            <a href="/portfolio" @click.prevent="navigateTo('/portfolio')">
              <div class="link-item">
                <div class="link-icon">💼</div>
                <span>我的基金</span>
              </div>
            </a>
            <a href="/themes" @click.prevent="navigateTo('/themes')">
              <div class="link-item">
                <div class="link-icon">🎯</div>
                <span>投资主题</span>
              </div>
            </a>
            <a href="/analysis" @click.prevent="navigateTo('/analysis')">
              <div class="link-item">
                <div class="link-icon">📈</div>
                <span>投资分析</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div class="error-illustration">
        <div class="illustration-content">
          <div class="floating-icons">
            <div class="icon icon-1">📊</div>
            <div class="icon icon-2">💰</div>
            <div class="icon icon-3">📈</div>
            <div class="icon icon-4">🎯</div>
            <div class="icon icon-5">💼</div>
          </div>
          <div class="lost-character">
            🤔
          </div>
          <div class="search-radar">
            <div class="radar-ring"></div>
            <div class="radar-ring"></div>
            <div class="radar-ring"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="report-section">
      <div class="report-content">
        <h3>发现问题？</h3>
        <p>如果您认为这是一个错误，请告诉我们，我们会尽快修复。</p>
        <div class="report-actions">
          <el-button @click="reportBug">
            <el-icon><Warning /></el-icon>
            报告问题
          </el-button>
          <el-button @click="contactSupport">
            <el-icon><Service /></el-icon>
            联系客服
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { House, ArrowLeft, Warning, Service } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

const reportBug = () => {
  ElMessage.info('问题报告功能开发中...')
}

const contactSupport = () => {
  ElMessage.info('客服联系方式：support@jntm.com')
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 60px;
}

.error-content {
  text-align: center;
  color: white;
  max-width: 500px;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.error-title {
  font-size: 120px;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.error-subtitle {
  font-size: 32px;
  margin: 20px 0 16px 0;
  font-weight: 500;
}

.error-description {
  font-size: 18px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
}

.error-actions .el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.error-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.helpful-links {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.helpful-links h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  opacity: 0.9;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
}

.links-grid a {
  text-decoration: none;
  color: inherit;
}

.link-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.link-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.link-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.link-item span {
  font-size: 14px;
  opacity: 0.9;
}

.error-illustration {
  position: relative;
  width: 300px;
  height: 300px;
}

.illustration-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.lost-character {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  z-index: 10;
  animation: float 3s ease-in-out infinite;
}

.search-radar {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
}

.radar-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: radar 2s ease-out infinite;
}

.radar-ring:nth-child(1) {
  width: 60px;
  height: 60px;
  animation-delay: 0s;
}

.radar-ring:nth-child(2) {
  width: 120px;
  height: 120px;
  animation-delay: 0.5s;
}

.radar-ring:nth-child(3) {
  width: 200px;
  height: 200px;
  animation-delay: 1s;
}

.floating-icons {
  position: absolute;
  width: 100%;
  height: 100%;
}

.icon {
  position: absolute;
  font-size: 24px;
  opacity: 0.6;
  animation: float-icon 4s ease-in-out infinite;
}

.icon-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.icon-2 {
  top: 30%;
  right: 15%;
  animation-delay: 1s;
}

.icon-3 {
  bottom: 25%;
  left: 10%;
  animation-delay: 2s;
}

.icon-4 {
  bottom: 20%;
  right: 20%;
  animation-delay: 3s;
}

.icon-5 {
  top: 10%;
  left: 50%;
  animation-delay: 1.5s;
}

.report-section {
  background: rgba(0, 0, 0, 0.1);
  padding: 30px 20px;
  text-align: center;
  color: white;
}

.report-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.report-content p {
  margin: 0 0 20px 0;
  opacity: 0.8;
}

.report-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.report-actions .el-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

@keyframes radar {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes float-icon {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(5deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(10px) rotate(-5deg);
  }
}

@media (max-width: 768px) {
  .error-container {
    flex-direction: column;
    gap: 40px;
    padding: 20px;
  }

  .error-illustration {
    width: 250px;
    height: 250px;
  }

  .lost-character {
    font-size: 60px;
  }

  .error-title {
    font-size: 80px;
  }

  .error-subtitle {
    font-size: 24px;
  }

  .error-description {
    font-size: 16px;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .report-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
<template>
  <div class="profile">
    <div class="profile-header">
      <h1>👤 个人资料</h1>
      <p class="subtitle">管理您的个人信息和投资偏好</p>
    </div>

    <div class="profile-content">
      <div class="profile-sidebar">
        <div class="avatar-section">
          <div class="avatar">
            {{ userStore.user?.nickname?.[0] || '用' }}
          </div>
          <div class="avatar-actions">
            <el-button size="small" @click="changeAvatar">更换头像</el-button>
          </div>
        </div>

        <div class="profile-summary">
          <h3>{{ userStore.user?.nickname || '演示用户' }}</h3>
          <p class="email">{{ userStore.user?.email || 'demo@jntm.com' }}</p>
          <div class="stats">
            <div class="stat-item">
              <span class="value">{{ fundCount }}</span>
              <span class="label">持有基金</span>
            </div>
            <div class="stat-item">
              <span class="value">{{ getThemeName(userStore.user?.currentTheme) }}</span>
              <span class="label">当前主题</span>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-main">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info-section">
              <el-form
                ref="basicForm"
                :model="basicInfo"
                :rules="basicRules"
                label-width="120px"
                size="default"
              >
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="basicInfo.username" disabled />
                </el-form-item>

                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="basicInfo.nickname" placeholder="请输入昵称" />
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="basicInfo.email" placeholder="请输入邮箱" />
                </el-form-item>

                <el-form-item label="手机号码" prop="phone">
                  <el-input v-model="basicInfo.phone" placeholder="请输入手机号码" />
                </el-form-item>

                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="basicInfo.gender">
                    <el-radio value="male">男</el-radio>
                    <el-radio value="female">女</el-radio>
                    <el-radio value="other">其他</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="生日" prop="birthday">
                  <el-date-picker
                    v-model="basicInfo.birthday"
                    type="date"
                    placeholder="请选择生日"
                    style="width: 100%"
                  />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="saveBasicInfo" :loading="saving">
                    保存信息
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane label="投资偏好" name="preferences">
            <div class="preferences-section">
              <h4>风险承受能力</h4>
              <div class="risk-assessment">
                <div class="risk-options">
                  <div
                    v-for="option in riskOptions"
                    :key="option.level"
                    class="risk-option"
                    :class="{ active: preferences.riskLevel === option.level }"
                    @click="preferences.riskLevel = option.level"
                  >
                    <div class="risk-icon">{{ option.icon }}</div>
                    <h5>{{ option.title }}</h5>
                    <p>{{ option.description }}</p>
                  </div>
                </div>
              </div>

              <h4>投资目标</h4>
              <div class="investment-goals">
                <el-checkbox-group v-model="preferences.goals">
                  <el-checkbox value="retirement">养老规划</el-checkbox>
                  <el-checkbox value="education">子女教育</el-checkbox>
                  <el-checkbox value="house">购房计划</el-checkbox>
                  <el-checkbox value="wealth">财富增值</el-checkbox>
                  <el-checkbox value="income">稳定收入</el-checkbox>
                </el-checkbox-group>
              </div>

              <h4>投资期限</h4>
              <div class="investment-horizon">
                <el-select v-model="preferences.horizon" placeholder="请选择投资期限">
                  <el-option label="短期（1年以内）" value="short" />
                  <el-option label="中期（1-3年）" value="medium" />
                  <el-option label="长期（3年以上）" value="long" />
                </el-select>
              </div>

              <el-button type="primary" @click="savePreferences" :loading="saving">
                保存偏好
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="账户安全" name="security">
            <div class="security-section">
              <div class="security-item">
                <div class="security-info">
                  <h4>修改密码</h4>
                  <p>定期更换密码，保护账户安全</p>
                </div>
                <el-button @click="showChangePassword">修改密码</el-button>
              </div>

              <div class="security-item">
                <div class="security-info">
                  <h4>绑定邮箱</h4>
                  <p>当前邮箱：{{ userStore.user?.email || '未绑定' }}</p>
                </div>
                <el-button @click="bindEmail">{{ userStore.user?.email ? '更换邮箱' : '绑定邮箱' }}</el-button>
              </div>

              <div class="security-item">
                <div class="security-info">
                  <h4>登录记录</h4>
                  <p>查看最近的登录活动</p>
                </div>
                <el-button @click="viewLoginHistory">查看记录</el-button>
              </div>

              <div class="security-item">
                <div class="security-info">
                  <h4>两步验证</h4>
                  <p>增强账户安全性</p>
                </div>
                <el-switch v-model="security.twoFactor" @change="toggleTwoFactor" />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="通知设置" name="notifications">
            <div class="notifications-section">
              <h4>消息通知</h4>
              <div class="notification-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h5>净值提醒</h4>
                    <p>基金净值更新时推送通知</p>
                  </div>
                  <el-switch v-model="notifications.navUpdate" />
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h5>收益提醒</h5>
                    <p>收益达到阈值时推送通知</p>
                  </div>
                  <el-switch v-model="notifications.profitAlert" />
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h5>投资建议</h5>
                    <p>AI投资建议和分析报告</p>
                  </div>
                  <el-switch v-model="notifications.aiAdvice" />
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h5>市场资讯</h5>
                    <p>重要市场动态和新闻</p>
                  </div>
                  <el-switch v-model="notifications.marketNews" />
                </div>
              </div>

              <h4>通知方式</h4>
              <div class="notification-methods">
                <el-checkbox-group v-model="notifications.methods">
                  <el-checkbox value="app">应用内通知</el-checkbox>
                  <el-checkbox value="email">邮件通知</el-checkbox>
                  <el-checkbox value="sms">短信通知</el-checkbox>
                </el-checkbox-group>
              </div>

              <el-button type="primary" @click="saveNotifications" :loading="saving">
                保存设置
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordForm"
        :model="passwordData"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordData.currentPassword"
            type="password"
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordData.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordData.confirmPassword"
            type="password"
            show-password
            placeholder="请确认新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useAuthStore()

const activeTab = ref('basic')
const saving = ref(false)
const passwordDialogVisible = ref(false)

const basicForm = ref()
const passwordForm = ref()

const fundCount = ref(5)

const basicInfo = reactive({
  username: userStore.user?.username || 'demo',
  nickname: userStore.user?.nickname || '演示用户',
  email: userStore.user?.email || 'demo@jntm.com',
  phone: '',
  gender: '',
  birthday: null
})

const preferences = reactive({
  riskLevel: 'medium',
  goals: ['wealth'],
  horizon: 'medium'
})

const security = reactive({
  twoFactor: false
})

const notifications = reactive({
  navUpdate: true,
  profitAlert: true,
  aiAdvice: true,
  marketNews: false,
  methods: ['app']
})

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const riskOptions = [
  {
    level: 'conservative',
    icon: '🛡️',
    title: '保守型',
    description: '风险承受能力低，追求稳定收益'
  },
  {
    level: 'moderate',
    icon: '⚖️',
    title: '稳健型',
    description: '风险承受能力适中，平衡收益与风险'
  },
  {
    level: 'aggressive',
    icon: '🚀',
    title: '激进型',
    description: '风险承受能力高，追求高收益'
  }
]

const basicRules = {
  nickname: [
    { max: 20, message: '昵称不能超过20个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

function validateConfirmPassword(rule: any, value: string, callback: any) {
  if (value !== passwordData.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const getThemeName = (theme: string) => {
  const themeMap = {
    fire: 'FIRE',
    global: '全球配置',
    inflation: '跑赢通胀'
  }
  return themeMap[theme as keyof typeof themeMap] || '未知'
}

const saveBasicInfo = async () => {
  try {
    await basicForm.value.validate()
    saving.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新用户信息
    userStore.updateProfile(basicInfo)

    ElMessage.success('基本信息保存成功')
  } catch (error) {
    // 表单验证失败
  } finally {
    saving.value = false
  }
}

const savePreferences = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('投资偏好保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const saveNotifications = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('通知设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const changeAvatar = () => {
  ElMessage.info('头像更换功能开发中...')
}

const showChangePassword = () => {
  passwordData.currentPassword = ''
  passwordData.newPassword = ''
  passwordData.confirmPassword = ''
  passwordDialogVisible.value = true
}

const changePassword = async () => {
  try {
    await passwordForm.value.validate()

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
  } catch (error) {
    // 表单验证失败
  }
}

const bindEmail = () => {
  ElMessage.info('邮箱绑定功能开发中...')
}

const viewLoginHistory = () => {
  ElMessage.info('登录记录功能开发中...')
}

const toggleTwoFactor = (value: boolean) => {
  if (value) {
    ElMessageBox.confirm(
      '开启两步验证后，登录时需要额外的验证码，确定要开启吗？',
      '开启两步验证',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(() => {
      ElMessage.success('两步验证已开启')
    }).catch(() => {
      security.twoFactor = false
    })
  } else {
    ElMessage.info('两步验证已关闭')
  }
}
</script>

<style scoped>
.profile {
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.profile-header h1 {
  margin: 0;
  font-size: 32px;
  color: #333;
}

.subtitle {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 16px;
}

.profile-content {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  margin: 0 auto 16px auto;
}

.avatar-actions {
  margin-top: 16px;
}

.profile-summary {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-summary h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.email {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-item .value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-item .label {
  font-size: 12px;
  color: #666;
}

.profile-main {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.basic-info-section,
.preferences-section,
.security-section,
.notifications-section {
  padding: 30px;
}

.preferences-section h4,
.notifications-section h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.risk-assessment {
  margin-bottom: 30px;
}

.risk-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.risk-option {
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.risk-option:hover {
  border-color: #409EFF;
}

.risk-option.active {
  border-color: #409EFF;
  background: #f0f8ff;
}

.risk-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.risk-option h5 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.risk-option p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.investment-goals,
.investment-horizon {
  margin-bottom: 30px;
}

.notification-settings {
  margin-bottom: 30px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h5 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.setting-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.notification-methods {
  margin-bottom: 30px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.security-item:last-child {
  border-bottom: none;
}

.security-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.security-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
  }

  .risk-options {
    grid-template-columns: 1fr;
  }

  .setting-item,
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
<template>
  <div class="settings">
    <div class="settings-header">
      <h1>⚙️ 系统设置</h1>
      <p class="subtitle">个性化您的使用体验</p>
    </div>

    <div class="settings-content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="通用设置" name="general">
          <div class="general-section">
            <div class="setting-group">
              <h4>界面设置</h4>
              <div class="setting-item">
                <div class="setting-info">
                  <h5>主题模式</h5>
                  <p>选择您喜欢的界面主题</p>
                </div>
                <el-select v-model="generalSettings.theme" @change="updateTheme">
                  <el-option label="浅色模式" value="light" />
                  <el-option label="深色模式" value="dark" />
                  <el-option label="跟随系统" value="auto" />
                </el-select>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h5>语言</h5>
                  <p>选择界面显示语言</p>
                </div>
                <el-select v-model="generalSettings.language">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="繁體中文" value="zh-TW" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h5>默认首页</h5>
                  <p>设置登录后默认显示的页面</p>
                </div>
                <el-select v-model="generalSettings.defaultPage">
                  <el-option label="仪表板" value="dashboard" />
                  <el-option label="我的基金" value="portfolio" />
                  <el-option label="投资分析" value="analysis" />
                </el-select>
              </div>
            </div>

            <div class="setting-group">
              <h4>数据显示</h4>
              <div class="setting-item">
                <div class="setting-info">
                  <h5>刷新间隔</h5>
                  <p>数据自动刷新的时间间隔</p>
                </div>
                <el-select v-model="generalSettings.refreshInterval">
                  <el-option label="每5分钟" value="5" />
                  <el-option label="每10分钟" value="10" />
                  <el-option label="每30分钟" value="30" />
                  <el-option label="手动刷新" value="manual" />
                </el-select>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h5>数值精度</h5>
                  <p>基金净值显示的小数位数</p>
                </div>
                <el-radio-group v-model="generalSettings.decimalPlaces">
                  <el-radio :value="2">2位小数</el-radio>
                  <el-radio :value="3">3位小数</el-radio>
                  <el-radio :value="4">4位小数</el-radio>
                </el-radio-group>
              </div>
            </div>

            <el-button type="primary" @click="saveGeneralSettings" :loading="saving">
              保存设置
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="基金设置" name="fund">
          <div class="fund-section">
            <div class="setting-group">
              <h4>默认筛选</h4>
              <div class="setting-item">
                <div class="setting-info">
                  <h5>风险等级过滤</h5>
                  <p>默认隐藏的风险等级基金</p>
                </div>
                <el-checkbox-group v-model="fundSettings.riskFilter">
                  <el-checkbox value="high">高风险</el-checkbox>
                  <el-checkbox value="medium">中高风险</el-checkbox>
                  <el-checkbox value="low">低风险</el-checkbox>
                </el-checkbox-group>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h5>基金规模</h5>
                  <p>默认的最小基金规模要求</p>
                </div>
                <el-select v-model="fundSettings.minScale">
                  <el-option label="不限制" value="0" />
                  <el-option label="1亿元以上" value="1" />
                  <el-option label="5亿元以上" value="5" />
                  <el-option label="10亿元以上" value="10" />
                </el-select>
              </div>
            </div>

            <div class="setting-group">
              <h4>排序偏好</h4>
              <div class="setting-item">
                <div class="setting-info">
                  <h5>默认排序方式</h5>
                  <p>基金列表的默认排序规则</p>
                </div>
                <el-select v-model="fundSettings.defaultSort">
                  <el-option label="收益率" value="return" />
                  <el-option label="基金规模" value="scale" />
                  <el-option label="晨星评级" value="rating" />
                  <el-option label="成立时间" value="established" />
                </el-select>
              </div>
            </div>

            <div class="setting-group">
              <h4>收益提醒</h4>
              <div class="setting-item">
                <div class="setting-info">
                  <h5>收益提醒阈值</h5>
                  <p>当日收益超过此值时推送提醒</p>
                </div>
                <el-input-number
                  v-model="fundSettings.profitThreshold"
                  :min="0"
                  :max="10000"
                  :step="100"
                  placeholder="金额（元）"
                  style="width: 200px"
                />
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h5>亏损提醒阈值</h5>
                  <p>当日亏损超过此值时推送提醒</p>
                </div>
                <el-input-number
                  v-model="fundSettings.lossThreshold"
                  :min="0"
                  :max="10000"
                  :step="100"
                  placeholder="金额（元）"
                  style="width: 200px"
                />
              </div>
            </div>

            <el-button type="primary" @click="saveFundSettings" :loading="saving">
              保存设置
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="数据与隐私" name="privacy">
          <div class="privacy-section">
            <div class="setting-group">
              <h4>数据管理</h4>
              <div class="setting-item">
                <div class="setting-info">
                  <h5>缓存数据</h5>
                  <p>清除本地缓存的数据</p>
                </div>
                <el-button @click="clearCache" :loading="clearingCache">
                  清除缓存
                </el-button>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h5>导出数据</h5>
                  <p>导出您的投资数据</p>
                </div>
                <el-button @click="exportData">导出数据</el-button>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h5>同步设置</h5>
                  <p>数据同步状态和设置</p>
                </div>
                <div class="sync-status">
                  <el-tag :type="syncStatus === 'success' ? 'success' : 'warning'" size="small">
                    {{ syncStatus === 'success' ? '已同步' : '待同步' }}
                  </el-tag>
                  <el-button size="small" @click="manualSync" :loading="syncing">
                    手动同步
                  </el-button>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h4>隐私设置</h4>
              <div class="setting-item">
                <div class="setting-info">
                  <h5>数据分析</h5>
                  <p>允许使用匿名数据进行产品改进</p>
                </div>
                <el-switch v-model="privacySettings.allowAnalytics" />
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h5>个性化推荐</h5>
                  <p>基于投资行为提供个性化建议</p>
                </div>
                <el-switch v-model="privacySettings.personalization" />
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h5>营销推送</h5>
                  <p>接收产品更新和优惠信息</p>
                </div>
                <el-switch v-model="privacySettings.marketing" />
              </div>
            </div>

            <div class="setting-group danger-zone">
              <h4>危险区域</h4>
              <div class="setting-item">
                <div class="setting-info">
                  <h5>删除账户</h5>
                  <p>永久删除账户和所有相关数据</p>
                </div>
                <el-button type="danger" @click="deleteAccount">
                  删除账户
                </el-button>
              </div>
            </div>

            <el-button type="primary" @click="savePrivacySettings" :loading="saving">
              保存设置
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="关于" name="about">
          <div class="about-section">
            <div class="about-header">
              <div class="app-logo">
                🎵 基你太美
              </div>
              <h2>智能基金管家</h2>
              <p class="version">版本 1.0.0</p>
            </div>

            <div class="about-info">
              <div class="info-item">
                <h4>应用介绍</h4>
                <p>基你太美是一款创新的智能基金管家应用，通过不同的投资主题为用户提供个性化的投资体验。支持FIRE提前退休、全球配置、跑赢通胀等多种投资策略。</p>
              </div>

              <div class="info-item">
                <h4>核心功能</h4>
                <ul>
                  <li>📊 投资组合管理和分析</li>
                  <li>🎯 主题化投资策略</li>
                  <li>🤖 AI智能投资建议</li>
                  <li>📷 基金截图智能识别</li>
                  <li>📈 实时市场数据分析</li>
                  <li>🔔 个性化收益提醒</li>
                </ul>
              </div>

              <div class="info-item">
                <h4>技术支持</h4>
                <div class="support-links">
                  <a href="#" @click="openHelp">使用帮助</a>
                  <a href="#" @click="openFeedback">意见反馈</a>
                  <a href="#" @click="openPrivacy">隐私政策</a>
                  <a href="#" @click="openTerms">服务条款</a>
                </div>
              </div>

              <div class="info-item">
                <h4>更新日志</h4>
                <div class="changelog">
                  <div class="changelog-item">
                    <div class="version-tag">v1.0.0</div>
                    <div class="changelog-content">
                      <h5>初始版本发布</h5>
                      <ul>
                        <li>基础投资组合管理功能</li>
                        <li>三大投资主题支持</li>
                        <li>AI投资顾问对话</li>
                        <li>基金截图识别</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div class="info-item">
                <h4>联系我们</h4>
                <div class="contact-info">
                  <p>📧 邮箱：support@jntm.com</p>
                  <p>🌐 官网：www.jntm.com</p>
                  <p>📱 客服电话：400-123-4567</p>
                </div>
              </div>
            </div>

            <div class="about-actions">
              <el-button @click="checkUpdate" :loading="checkingUpdate">
                检查更新
              </el-button>
              <el-button @click="shareApp">
                分享应用
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('general')
const saving = ref(false)
const clearingCache = ref(false)
const syncing = ref(false)
const checkingUpdate = ref(false)
const syncStatus = ref('success')

const generalSettings = reactive({
  theme: 'light',
  language: 'zh-CN',
  defaultPage: 'dashboard',
  refreshInterval: '10',
  decimalPlaces: 4
})

const fundSettings = reactive({
  riskFilter: ['high'],
  minScale: '1',
  defaultSort: 'return',
  profitThreshold: 1000,
  lossThreshold: 1000
})

const privacySettings = reactive({
  allowAnalytics: true,
  personalization: true,
  marketing: false
})

const updateTheme = (theme: string) => {
  // 这里实现主题切换逻辑
  ElMessage.info(`切换到${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}主题`)
}

const saveGeneralSettings = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('通用设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const saveFundSettings = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('基金设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const savePrivacySettings = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('隐私设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const clearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '清除缓存后需要重新登录，确定要清除吗？',
      '清除缓存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    clearingCache.value = true
    // 模拟清除缓存
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('缓存清除成功')
  } catch (error) {
    // 用户取消
  } finally {
    clearingCache.value = false
  }
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const manualSync = async () => {
  syncing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    syncStatus.value = 'success'
    ElMessage.success('数据同步成功')
  } catch (error) {
    ElMessage.error('同步失败，请重试')
  } finally {
    syncing.value = false
  }
}

const deleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '删除账户后将无法恢复，所有数据将被永久删除。请输入"DELETE"确认删除：',
      '删除账户',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        inputPattern: /^DELETE$/,
        inputErrorMessage: '请输入DELETE确认删除',
        inputType: 'text',
        inputPlaceholder: '请输入DELETE'
      }
    )

    ElMessage.success('账户删除申请已提交')
  } catch (error) {
    // 用户取消或输入错误
  }
}

const openHelp = () => {
  ElMessage.info('使用帮助页面开发中...')
}

const openFeedback = () => {
  ElMessage.info('意见反馈页面开发中...')
}

const openPrivacy = () => {
  ElMessage.info('隐私政策页面开发中...')
}

const openTerms = () => {
  ElMessage.info('服务条款页面开发中...')
}

const checkUpdate = async () => {
  checkingUpdate.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.info('当前已是最新版本')
  } catch (error) {
    ElMessage.error('检查更新失败')
  } finally {
    checkingUpdate.value = false
  }
}

const shareApp = () => {
  if (navigator.share) {
    navigator.share({
      title: '基你太美 - 智能基金管家',
      text: '使用基你太美，让投资更智能！',
      url: window.location.origin
    })
  } else {
    ElMessage.info('分享链接已复制到剪贴板')
  }
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.settings-header {
  text-align: center;
  margin-bottom: 30px;
}

.settings-header h1 {
  margin: 0;
  font-size: 32px;
  color: #333;
}

.subtitle {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 16px;
}

.settings-content {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.general-section,
.fund-section,
.privacy-section,
.about-section {
  padding: 30px;
}

.setting-group {
  margin-bottom: 30px;
}

.setting-group h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f8f9fa;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
  margin-right: 20px;
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

.danger-zone {
  border: 1px solid #f56c6c;
  border-radius: 8px;
  padding: 20px;
  background: #fef0f0;
}

.danger-zone h4 {
  color: #f56c6c;
  border-color: #f56c6c;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.about-header {
  text-align: center;
  margin-bottom: 40px;
}

.app-logo {
  font-size: 64px;
  margin-bottom: 16px;
}

.about-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.version {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.about-info {
  margin-bottom: 40px;
}

.info-item {
  margin-bottom: 30px;
}

.info-item h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.info-item p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.info-item ul {
  margin: 0;
  padding-left: 20px;
}

.info-item li {
  margin-bottom: 8px;
  color: #666;
}

.support-links {
  display: flex;
  gap: 20px;
}

.support-links a {
  color: #409EFF;
  text-decoration: none;
}

.support-links a:hover {
  text-decoration: underline;
}

.changelog-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.version-tag {
  background: #409EFF;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  height: fit-content;
}

.changelog-content h5 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.changelog-content ul {
  margin: 0;
  padding-left: 20px;
}

.contact-info p {
  margin-bottom: 8px;
}

.about-actions {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.about-actions .el-button {
  margin: 0 8px;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .setting-info {
    margin-right: 0;
  }

  .support-links {
    flex-direction: column;
    gap: 12px;
  }

  .changelog-item {
    flex-direction: column;
    gap: 12px;
  }

  .about-actions .el-button {
    margin: 8px 0;
    width: 100%;
  }
}
</style>
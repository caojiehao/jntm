<template>
  <div class="ai-chat">
    <div class="chat-header">
      <h1>🤖 AI投资顾问</h1>
      <p class="subtitle">基于您的投资主题，为您提供专业的投资建议和解答</p>

      <div class="header-controls">
        <el-select v-model="chatTheme" placeholder="选择主题" size="default">
          <el-option label="提前退休 (FIRE)" value="fire" />
          <el-option label="全球配置" value="global" />
          <el-option label="跑赢通胀" value="inflation" />
        </el-select>
        <el-button @click="clearChat" :icon="Refresh">清空对话</el-button>
      </div>
    </div>

    <div class="chat-container">
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h3>💡 快速提问</h3>
        </div>

        <div class="quick-questions">
          <div
            v-for="question in quickQuestions"
            :key="question.id"
            class="question-item"
            @click="askQuickQuestion(question.text)"
          >
            <div class="question-icon">{{ question.icon }}</div>
            <div class="question-content">
              <h5>{{ question.title }}</h5>
              <p>{{ question.text }}</p>
            </div>
          </div>
        </div>

        <div class="chat-history">
          <h4>历史对话</h4>
          <div class="history-list">
            <div
              v-for="chat in chatHistory"
              :key="chat.id"
              class="history-item"
              @click="loadChatHistory(chat)"
            >
              <div class="history-title">{{ chat.title }}</div>
              <div class="history-time">{{ formatTime(chat.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-messages" ref="messagesContainer">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message-wrapper"
            :class="message.role"
          >
            <div class="message-avatar">
              <div v-if="message.role === 'user'" class="user-avatar">
                {{ userStore.user?.nickname?.[0] || '用' }}
              </div>
              <div v-else class="ai-avatar">🤖</div>
            </div>

            <div class="message-content">
              <div class="message-header">
                <span class="sender-name">
                  {{ message.role === 'user' ? '我' : 'AI投资顾问' }}
                </span>
                <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
              </div>

              <div class="message-text" v-html="message.content"></div>

              <div v-if="message.suggestions" class="message-suggestions">
                <div
                  v-for="suggestion in message.suggestions"
                  :key="suggestion"
                  class="suggestion-item"
                  @click="askQuickQuestion(suggestion)"
                >
                  {{ suggestion }}
                </div>
              </div>

              <div v-if="message.role === 'assistant'" class="message-actions">
                <el-button size="small" text @click="copyMessage(message.content)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <el-button size="small" text @click="likeMessage(index)">
                  <el-icon><Select /></el-icon>
                </el-button>
                <el-button size="small" text @click="dislikeMessage(index)">
                  <el-icon><CloseBold /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="message-wrapper assistant">
            <div class="message-avatar">
              <div class="ai-avatar">🤖</div>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div v-if="messages.length === 0" class="empty-chat">
            <div class="empty-icon">💬</div>
            <h3>开始您的AI投资咨询</h3>
            <p>我是基于{{ getThemeName(chatTheme) }}主题的AI投资顾问，可以帮助您：</p>
            <ul>
              <li>分析投资组合表现</li>
              <li>制定投资策略建议</li>
              <li>解答基金相关问题</li>
              <li>提供市场走势分析</li>
            </ul>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-wrapper">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="2"
              placeholder="请输入您的问题..."
              @keydown.ctrl.enter="sendMessage"
              @keydown.meta.enter="sendMessage"
              resize="none"
            />
            <div class="input-actions">
              <el-button size="small" text @click="clearInput">清空</el-button>
              <el-button
                type="primary"
                @click="sendMessage"
                :loading="isTyping"
                :disabled="!userInput.trim()"
              >
                发送 (Ctrl+Enter)
              </el-button>
            </div>
          </div>

          <div class="input-tips">
            <span>💡 小贴士：按 Ctrl+Enter 快速发送消息</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Refresh, CopyDocument, Select, CloseBold } from '@element-plus/icons-vue'

const userStore = useAuthStore()

const chatTheme = ref(userStore.user?.currentTheme || 'fire')
const userInput = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement>()

const messages = ref([
  {
    role: 'assistant',
    content: `您好！我是基于${getThemeName(chatTheme.value)}主题的AI投资顾问。<br><br>我可以为您提供专业的投资建议，包括：<br>• 投资组合分析和优化建议<br>• 基金筛选和配置推荐<br>• 市场走势和投资机会分析<br>• 个性化的投资策略制定<br><br>请问有什么可以帮助您的吗？`,
    timestamp: new Date(),
    suggestions: [
      '分析我的投资组合',
      '推荐一些适合的基金',
      '当前市场如何调整投资策略'
    ]
  }
])

const chatHistory = ref([
  {
    id: 1,
    title: '基金配置建议',
    timestamp: new Date(Date.now() - 86400000),
    messages: []
  },
  {
    id: 2,
    title: '市场分析咨询',
    timestamp: new Date(Date.now() - 172800000),
    messages: []
  }
])

const quickQuestions = ref([
  {
    id: 1,
    icon: '📊',
    title: '组合分析',
    text: '帮我分析一下我的投资组合表现'
  },
  {
    id: 2,
    icon: '🎯',
    title: '基金推荐',
    text: '根据我的情况推荐一些适合的基金'
  },
  {
    id: 3,
    icon: '📈',
    title: '市场策略',
    text: '当前市场环境下应该调整投资策略吗'
  },
  {
    id: 4,
    icon: '⚡',
    title: '风险评估',
    text: '我的投资组合风险水平如何'
  },
  {
    id: 5,
    icon: '💰',
    title: '收益目标',
    text: '如何设定合理的收益目标'
  },
  {
    id: 6,
    icon: '🔍',
    title: '基金选择',
    text: '如何选择优质的主动管理基金'
  }
])

const getThemeName = (theme: string) => {
  const themeMap = {
    fire: '提前退休',
    global: '全球配置',
    inflation: '跑赢通胀'
  }
  return themeMap[theme as keyof typeof themeMap] || '通用'
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return timestamp.toLocaleDateString()
}

const formatMessageTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  const trimmedInput = userInput.value.trim()
  if (!trimmedInput || isTyping.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: trimmedInput,
    timestamp: new Date()
  })

  userInput.value = ''
  scrollToBottom()

  // 开始AI回复
  isTyping.value = true
  scrollToBottom()

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 生成AI回复
    const aiResponse = generateAIResponse(trimmedInput)

    messages.value.push({
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      suggestions: aiResponse.suggestions
    })

  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，我暂时无法回答您的问题，请稍后再试。',
      timestamp: new Date()
    })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

const generateAIResponse = (userInput: string) => {
  const responses = {
    analysis: {
      content: `基于您的投资组合分析，我发现以下特点：<br><br>📊 **组合概览**<br>• 当前总收益率：<strong>+8.5%</strong><br>• 年化波动率：<strong>12.3%</strong><br>• 夏普比率：<strong>1.05</strong><br><br>🎯 **优化建议**<br>1. 适当增加债券配置，降低组合波动性<br>2. 考虑配置部分QDII基金，实现全球化分散<br>3. 定期进行资产再平衡，保持目标配置比例<br><br>您的投资组合整体表现良好，风险适中，建议继续保持当前的长期投资策略。`,
      suggestions: [
        '如何进行资产再平衡？',
        '推荐一些QDII基金',
        '债券基金怎么选？'
      ]
    },
    recommend: {
      content: `根据您${getThemeName(chatTheme.value)}的投资目标，我为您推荐以下基金：<br><br>🏆 **核心推荐**<br>1. <strong>易方达消费行业股票（110022）</strong><br>   • 近1年收益：+15.6%<br>   • 基金经理：萧楠，经验丰富<br>   • 适合长期持有的消费主题基金<br><br>2. <strong>华夏回报混合（002001）</strong><br>   • 近1年收益：+8.9%<br>   • 风险控制优秀，最大回撤较小<br>   • 适合作为组合的稳健配置<br><br>💡 **配置建议**<br>建议采用核心-卫星策略，70%配置于核心推荐基金，30%用于卫星配置其他主题基金。`,
      suggestions: [
        '这些基金的费率如何？',
        '现在适合买入吗？',
        '还有其他推荐吗？'
      ]
    },
    market: {
      content: `当前市场环境下，我为您提供以下投资策略建议：<br><br>📈 **市场分析**<br>• A股估值处于合理区间，具备投资价值<br>• 消费和科技板块表现相对较强<br>• 债券收益率下行，配置价值凸显<br><br>🎯 **策略建议**<br>1. **权益类**：保持60-70%配置，优选优质基金<br>2. **固收类**：增加至25-30%，提供稳定性<br>3. **另类投资**：配置5-10%REITs或商品基金<br><br>⚠️ **风险提示**<br>市场短期波动难免，建议采用定投方式平摊成本，坚持长期投资理念。`,
      suggestions: [
        '具体推荐哪些基金？',
        '定投怎么做比较合适？',
        '如何控制风险？'
      ]
    }
  }

  // 根据用户输入匹配相应的回复
  for (const [key, response] of Object.entries(responses)) {
    if (userInput.includes('分析') || userInput.includes('组合')) {
      return responses.analysis
    }
    if (userInput.includes('推荐') || userInput.includes('基金')) {
      return responses.recommend
    }
    if (userInput.includes('市场') || userInput.includes('策略')) {
      return responses.market
    }
  }

  // 默认回复
  return {
    content: `感谢您的提问！作为您的AI投资顾问，我建议您：<br><br>1. 明确自己的投资目标和风险承受能力<br>2. 根据市场情况合理配置资产<br>3. 选择优质基金并长期持有<br>4. 定期回顾和调整投资组合<br><br>如果您有具体的问题，欢迎继续向我咨询，我会为您提供更详细的分析和建议。`,
    suggestions: [
      '分析我的投资组合',
      '推荐一些适合的基金',
      '当前市场如何调整投资策略'
    ]
  }
}

const askQuickQuestion = (question: string) => {
  userInput.value = question
  sendMessage()
}

const clearChat = () => {
  messages.value = [
    {
      role: 'assistant',
      content: `对话已清空。我是基于${getThemeName(chatTheme.value)}主题的AI投资顾问，请问有什么可以帮助您的吗？`,
      timestamp: new Date(),
      suggestions: [
        '分析我的投资组合',
        '推荐一些适合的基金',
        '当前市场如何调整投资策略'
      ]
    }
  ]
  ElMessage.success('对话已清空')
}

const clearInput = () => {
  userInput.value = ''
}

const copyMessage = (content: string) => {
  // 移除HTML标签
  const textContent = content.replace(/<[^>]*>/g, '')
  navigator.clipboard.writeText(textContent)
  ElMessage.success('已复制到剪贴板')
}

const likeMessage = (index: number) => {
  ElMessage.success('感谢您的反馈')
}

const dislikeMessage = (index: number) => {
  ElMessage.info('感谢您的反馈，我们会改进回答质量')
}

const loadChatHistory = (chat: any) => {
  ElMessage.info(`加载对话: ${chat.title}`)
  // 这里应该实现历史对话加载逻辑
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.ai-chat {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.chat-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
}

.subtitle {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 16px;
}

.header-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.chat-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.chat-sidebar {
  width: 320px;
  background: #f8f9fa;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.quick-questions {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.question-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
}

.question-item:hover {
  background: #e7f3ff;
  transform: translateX(4px);
}

.question-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.question-content h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.question-content p {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.chat-history {
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.chat-history h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 12px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background: #e9ecef;
}

.history-title {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}

.history-time {
  font-size: 11px;
  color: #999;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-wrapper {
  display: flex;
  margin-bottom: 24px;
  max-width: 80%;
}

.message-wrapper.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-wrapper.assistant {
  margin-right: auto;
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #67C23A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.message-content {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  position: relative;
}

.message-wrapper.user .message-content {
  background: #409EFF;
  color: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.sender-name {
  font-weight: 500;
}

.message-time {
  opacity: 0.7;
}

.message-text {
  line-height: 1.6;
  word-break: break-word;
}

.message-text :deep(strong) {
  font-weight: 600;
  color: #409EFF;
}

.message-wrapper.user .message-text :deep(strong) {
  color: white;
}

.message-suggestions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-item {
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-item:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.message-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.message-content:hover .message-actions {
  opacity: 1;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409EFF;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.empty-chat {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-chat h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #333;
}

.empty-chat p {
  margin: 0 0 20px 0;
  font-size: 16px;
  line-height: 1.5;
}

.empty-chat ul {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.empty-chat li {
  margin-bottom: 8px;
}

.chat-input {
  border-top: 1px solid #eee;
  padding: 20px;
  background: #f8f9fa;
}

.input-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  overflow: hidden;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.input-tips {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .chat-sidebar {
    display: none;
  }

  .message-wrapper {
    max-width: 95%;
  }

  .chat-header {
    padding: 16px 20px;
  }

  .chat-header h1 {
    font-size: 24px;
  }

  .header-controls {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
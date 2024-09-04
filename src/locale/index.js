import Vue from 'vue'
import VueI18n from 'vue-i18n'
import globalLan from './globalLan'
Vue.use(VueI18n)
function getMessage() {
  const messages = {}
  const files = require.context('./lang', true, /\.json$/)
  console.log('文件列表', files.keys())
  files.keys().forEach(item => {
    const key = item
      .split('/')
      .pop()
      .replace(/\.\w+$/, '')
    messages[key] = files(item)
  })
  return messages
}

const messages = getMessage()
export const LOCALE_OPTIONS = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]
const defaultLocale = localStorage.getItem('ferry-locale') || 'zh-CN'

const i18n = new VueI18n({
  locale: defaultLocale,
  messages: {
    'en-US': { ...messages['en-US'], ...globalLan['en-US'] },
    'zh-CN': { ...messages['zh-CN'], ...globalLan['zh-CN'] }
  }
})
export default i18n
export { messages }

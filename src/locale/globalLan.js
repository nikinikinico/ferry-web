import elenLocale from 'element-ui/lib/locale/lang/en' //element
import elzhLocale from 'element-ui/lib/locale/lang/zh-CN'
import formMakingEn from '@/components/VueFormMaking/lang/en-US' //formmaking
import formMakingZh from '@/components/VueFormMaking/lang/zh-CN'
export default {
  'en-US': {
    ...elenLocale,
    ...formMakingEn
  },
  'zh-CN': {
    ...elzhLocale,
    ...formMakingZh
  }
}

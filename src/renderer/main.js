import 'regenerator-runtime'
import Vue from 'vue'
import axios from 'axios'
import './AppData'

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.config.ignoredElements = ['field','block','category','xml','mutation','value','sep']

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

var shared = {}
shared.install = () => {
    Object.defineProperty(Vue.prototype, '$appData', {
        get () { return global.AppData }
    })
}
Vue.use(shared)

global.vueJS = new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

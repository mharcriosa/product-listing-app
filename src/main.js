import Vue from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify/lib';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

new Vue({
  vuetify: new Vuetify(),
  render: h => h(App),
}).$mount('#app');

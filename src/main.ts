import './utils/polyfills' 
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import store from "./store";
import {VueMasonryPlugin} from 'vue-masonry';
import naive from "naive-ui";
import { Popup } from 'vant';
import 'vant/lib/index.css';
const app = createApp(App)
app
    .use(VueMasonryPlugin)
    .use(store)
    .use(router)
    .use(naive)
    .use(Popup)
    .mount('#app')
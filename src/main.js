import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/base.css";

createApp(App).use(createPinia()).use(router).mount("#app");

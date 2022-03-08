import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      light: {
        primary: "#000000",
        secondary: "#EFEFEF",
        accent: "#574f7d",
        error: "#b71c1c",
        info: "#3c2a4d",
        options: {
          header: "#000000",
          headerButton: "#FFFFFF",
          bottomBorder: "#44c2fd",
        },
      },
      dark: {
        primary: "#FFFFFF",
        secondary: "#000000",
        accent: "#574f7d",
        error: "#b71c1c",
        info: "#95adbe",
        options: {
          header: "#000000",
          headerButton: "#FFFFFF",
          bottomBorder: "#44c2fd",
        },
      },
    },
  },
});

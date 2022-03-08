<template>
  <v-app>
    <v-app-bar app color="secondary" height="extended">
      <v-img :src="require('@/assets/unknower-logo.png')" contain height="35" class="ma-2"></v-img>
    </v-app-bar>
    <v-main class="main mt-16">
      <WorldClock />
    </v-main>
    <v-footer>
        <div class="d-flex justify-center flex-grow-1">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on">BOOK UNKNOWER</span>
            </template>
            <span>BOOKING@UNKNOWER.COM / Unknower#0677 ON DISCORD</span>
          </v-tooltip>
        </div>
    </v-footer>
  </v-app>
</template>

<script>
import WorldClock from "./components/WorldClock";

export default {
  name: "App",

  components: {
    WorldClock,
  },

  data: () => ({
    //
  }),
};
</script>

<style scoped>
h1 {
  font-size: 48pt;
  letter-spacing: 30px;
  padding-left: 30px;
}
</style>

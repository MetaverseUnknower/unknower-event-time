<template>
  <v-container>
    <v-row class="text-center">
      <v-spacer></v-spacer>
      <v-col cols="12" md="6" sm="8" xs="12">
        <v-card class="pa-4">
          <div class="text-h3 text-sm-h2 font-weight-bold">UTC</div>
          <div class="text-h2 text-sm-h1">{{ utc }}</div>
        </v-card>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>

    <v-row class="text-center">
      <v-col  cols="12" md="6" sm="8" xs="12" class="mx-auto">
        <div class="next text-md-h5 text-sm-h5 font-weight-bold" v-if="nextShow">
          NEXT UNKNOWER EVENT IS {{ timeFromNow }}<br />
        </div>
        <v-card v-if="nextShow" class="pa-4 mt-4">
          <div class="text-uppercase date text-md-h4 text-sm-h4 font-weight-bold">
            {{ nextShow.name }}
          </div>
          <div class="text-uppercase date text-md-h4 text-sm-h4 font-weight-bold">
            {{ displayedTime }}
          </div>
        </v-card>
        <div class="next text-md-h4 text-sm-h4" v-if="!nextShow">NO UPCOMING EVENTS</div>
        <div class="next mt-6 text-md-h6 text-sm-h6" v-if="!nextShow">TO SCHEDULE AN EVENT:</div>
        <div class="next my-1 text-md-h6 text-sm-h6" v-if="!nextShow">BOOKING@UNKNOWER.COM</div>
        <div class="my-1 text-md-h6 text-sm-h6" v-if="!nextShow">Unknower#0677 ON DISCORD</div>
      </v-col>
    </v-row>
    <v-row class="text-center" v-if="nextShow">
      <v-col sm="6" xs="12" class="mx-auto pa-1">
        <div class="text-xs-h6">Showing {{ selectedTimezone }} Timezone</div>
        <v-btn v-if="!switchingTz" @click="switchingTz = true" class="my-6 mx-auto">Change Timezone</v-btn>
        <v-autocomplete
          v-if="nextShow && switchingTz"
          v-model="selectedTimezone"
          :items="timezoneList"
          label="Switch Timezone"
          outlined
          class="ma-2"
          @change="switchTimezone()"
        ></v-autocomplete>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment-timezone";
import timezones from "timezones-list";

export default {
  name: "WorldClock",

  data: () => ({
    alwaysDarkMode: true,
    timezoneList: timezones.map((tz) => tz.tzCode),
    timeInterval: "",
    apiInterval: "",
    displayedTime: "",
    now: moment().toISOString(),
    utc: moment().tz("UTC").format("H:mm:ss"),
    events: [],
    nextShow: "",
    switchingTz: false,
    selectedTimezone: moment.tz.guess(),
  }),
  mounted: function () {
    clearInterval(this.timeInterval);
    clearInterval(this.apiInterval);
    this.updateTime();
    this.checkForShows();
  },
  beforeDestroy() {
    clearInterval(this.timeInterval);
    clearInterval(this.apiInterval);
  },
  computed: {
    darkModeEnabled: function () {
      return this.$vuetify.theme.dark;
    },
  },
  watch: {
    nextShow: function () {},
  },
  methods: {
    toggleDarkMode: function () {
      if (this.alwaysDarkMode || moment().format("H") >= 20 || moment().format("H") < 6) {
        this.$vuetify.theme.dark = true;
      } else {
        this.$vuetify.theme.dark = false;
      }
    },
    checkForShows: function () {
      const apiUrl = "https://api.unknower.io/event";
      this.now = moment().toISOString();

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          this.events = data.events;
          console.log(this.events);
          this.futureEvents = this.events.filter((event) => {
            return moment(event.startTime).isAfter(this.now);
          });
          console.log(this.futureEvents);
          if (this.futureEvents) {
            this.nextShow = this.futureEvents[0];
            this.displayedTime = moment(this.futureEvents[0].startTime).format("LLL");
            this.timeFromNow = moment(this.futureEvents[0].startTime).fromNow();
          }
        });
    },
    updateTime: function () {
      const objThis = this;
      this.timeInterval = setInterval(function () {
        objThis.utc = moment().tz("UTC").format("H:mm:ss");
        objThis.now = moment().toISOString();
        if (objThis.alwaysDarkMode && objThis.darkModeEnabled) {
          return;
        } else {
          objThis.toggleDarkMode();
        }
      }, 500);

      this.apiInterval = setInterval(function () {
        objThis.checkForShows();
      }, 60000);
    },
    switchTimezone: function () {
      this.switchingTz = false;
      console.log(this.selectedTimezone);
      this.displayedTime = moment(this.futureEvents[0].startTime)
        .tz(this.selectedTimezone)
        .format("LLL");
    },
  },
};
</script>

<style scoped>
.date {
  color: lightskyblue;
}
.next {
  text-transform: uppercase;
}
</style>

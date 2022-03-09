<template>
  <v-container>
    <v-row class="text-center">
      <v-spacer></v-spacer>
      <v-col cols="12" md="8" sm="10" xs="12">
        <v-card class="pa-4">
          <div class="text-h3 text-sm-h2 text-xs-h3 font-weight-bold">UTC</div>
          <div class="text-h2 text-sm-h1">{{ utc }}</div>
        </v-card>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>

    <v-row class="text-center">
      <v-col cols="12" md="8" sm="10" xs="12" class="mx-auto">
        <div class="next text-md-h5 text-sm-h5 text-xs-h6 font-weight-bold" v-if="nextDayOfEvents">{{ nextEventText }} {{ timeFromNow }}<br /></div>
        <v-card v-if="nextDayOfEvents">
          <div v-for="event in nextDayOfEvents" class="pa-4 mt-4" :key="event.id">
            <div class="text-uppercase date text-md-h5 text-sm-h6 text-xs-h6 font-weight-bold">
              {{ event.name }}
            </div>
            <div class="text-uppercase date text-md-h5 text-sm-h6 text-xs-h6 font-weight-bold">
              {{ event.displayedTime }}
            </div>
          </div>
        </v-card>
        <div class="next text-md-h4 text-sm-h4" v-if="!nextDayOfEvents">NO UPCOMING EVENTS</div>
        <div class="next mt-6 text-md-h6 text-sm-h6" v-if="!nextDayOfEvents">TO SCHEDULE AN EVENT:</div>
        <div class="next my-1 text-md-h6 text-sm-h6" v-if="!nextDayOfEvents">BOOKING@UNKNOWER.COM</div>
        <div class="my-1 text-md-h6 text-sm-h6" v-if="!nextDayOfEvents">Unknower#0677 ON DISCORD</div>
      </v-col>
    </v-row>
    <v-row class="text-center" v-if="nextDayOfEvents">
      <v-col sm="6" xs="12" class="mx-auto pa-1">
        <div class="text-xs-h6">Showing {{ selectedTimezone }} Timezone</div>
        <v-btn v-if="!switchingTz" @click="switchingTz = true" class="my-6 mx-auto">Change Timezone</v-btn>
        <v-autocomplete
          v-if="nextDayOfEvents && switchingTz"
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
    nextDayOfEvents: [],
    nextEventText: "",
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
    upcomingEvent: function () {},
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
            this.closestEvent = this.futureEvents[0];
            this.nextDayOfEvents = this.futureEvents.filter((event) => event.eventGroup == this.closestEvent.eventGroup);

            this.timeFromNow = moment(this.closestEvent.startTime).fromNow();
            this.nextDayOfEvents.forEach((event) => {
              event.displayedTime = moment(event.startTime).format("LLL");
            });

            this.getNextEventText()
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
      this.displayedTime = moment(this.futureEvents[0].startTime).tz(this.selectedTimezone).format("LLL");
    },
    getNextEventText: function () {
      if (this.nextDayOfEvents.length > 1) {
        this.nextEventText = "NEXT UNKNOWER EVENTS START ";
      } else if (this.nextDayOfEvents.length < 2) {
        this.nextEventText = "NEXT UNKNOWER EVENT STARTS ";
      } else {
        return "";
      }
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

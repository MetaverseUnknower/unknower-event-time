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
        <v-progress-circular indeterminate v-if="!loaded" color="cyan"></v-progress-circular>
        <v-card v-if="loaded && upcomingEvents">
          <div v-for="event in nextDayOfEvents" class="pa-4 mt-4" :key="event.id">
            <div class="next text-md-h5 text-sm-h5 text-xs-h6 font-weight-bold" v-if="event.ongoing">{{ onGoingEventText }} {{ ongoingEnds }}<br /></div>
            <div class="next text-md-h5 text-sm-h5 text-xs-h6 font-weight-bold mb-2" v-if="!event.ongoing">{{ nextEventText }} {{ startTimeFromNow }}<br /></div>
            <div class="text-uppercase date text-md-h5 text-sm-h6 text-xs-h6 font-weight-bold">
              {{ event.name }}
            </div>
            <div class="text-uppercase date text-md-h5 text-sm-h6 text-xs-h6 font-weight-bold">
              {{ event.displayedTime }}
            </div>
            <v-btn
              class="cyan text-md-h5 text-sm-h5 text-xs-h6 font-weight-bold mt-4"
              :href="'https://play.decentraland.org/?position=' + event.coords[0] + '%2C' + event.coords[1] + '/'"
              target="_blank"
              v-if="event.ongoing"
              >JUMP IN</v-btn
            >
          </div>
        </v-card>
        <div class="next text-md-h4 text-sm-h4" v-if="!upcomingEvents">NO UPCOMING EVENTS</div>
        <div class="next mt-6 text-md-h6 text-sm-h6" v-if="!upcomingEvents">TO SCHEDULE AN EVENT:</div>
        <div class="next my-1 text-md-h6 text-sm-h6" v-if="!upcomingEvents">BOOKING@UNKNOWER.COM</div>
        <div class="my-1 text-md-h6 text-sm-h6" v-if="!upcomingEvents">Unknower#0677 ON DISCORD</div>
      </v-col>
    </v-row>
    <v-row class="text-center" v-if="loaded && upcomingEvents">
      <v-col sm="6" xs="12" class="mx-auto pa-1">
        <div class="text-xs-h6">Showing {{ selectedTimezone }} Timezone</div>
        <v-btn v-if="!switchingTz" @click="switchingTz = true" class="my-6 mx-auto">Change Timezone</v-btn>
        <v-autocomplete
          v-if="upcomingEvents && switchingTz"
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
    loaded: false,
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
    onGoingEventText: "ONGOING EVENT ENDS ",
    nextShow: "",
    startTimeFromNow: "",
    switchingTz: false,
    selectedTimezone: moment.tz.guess(),
    upcomingEvents: true,
    onGoingEvent: false,
    futureEvents: [],
    eventsWithoutOngoing: [],
    closestEvent: {},
    nextEventStartsIn: "",
  }),
  mounted: function () {
    clearInterval(this.timeInterval);
    clearInterval(this.apiInterval);
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
          this.events = data.events.sort((eventA, eventB) => eventA.id - eventB.id);
          this.updateTime();
          setTimeout(() => {
            this.loaded = true;
          }, 500);
        });
    },
    updateTime: function () {
      const objThis = this;
      this.timeInterval = setInterval(function () {
        objThis.utc = moment().tz("UTC").format("H:mm:ss");
        objThis.now = moment().toISOString();

        objThis.futureEvents = objThis.events.filter((event) => {
          return moment(event.endTime).isAfter();
        });

        objThis.ongoingEvents = objThis.futureEvents.filter((event) => {
          return moment(event.startTime).isBefore();
        });

        if (objThis.futureEvents.length) {
          objThis.upcomingEvents = true;

          objThis.nextEvent = objThis.futureEvents.find((event) => {
            return moment(event.startTime).isAfter();
          });

          objThis.nextDayOfEvents = objThis.futureEvents.filter((event) => event.eventGroup == objThis.closestEvent.eventGroup);

          objThis.futureEvents.forEach((event) => {
            event.coords = typeof event.coords == "string" ? event.coords.split(",") : event.coords;
            event.displayedTime = moment(event.startTime).tz(objThis.selectedTimezone).format("LLL");
            event.ongoing = moment(event.startTime).isBefore() && moment(event.endTime).isAfter();
          });
        } else {
          objThis.upcomingEvents = false;
        }

        if (objThis.nextEvent) {
          objThis.startTimeFromNow = moment(objThis.nextEvent.startTime).fromNow();
          objThis.endTimeFromNow = moment(objThis.nextEvent.endTime).fromNow();
        }

        if (objThis.ongoingEvents.length) {
          objThis.ongoingEnds = moment(objThis.ongoingEvents[0].endTime).fromNow();
        }

        objThis.getNextEventText();

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
      this.nextDayOfEvents.forEach((event) => {
        event.displayedTime = moment(event.startTime).tz(this.selectedTimezone).format("LLL");
        event.ongoing = moment(event.startTime).isBefore() && moment(event.endTime).isAfter();
      });
    },
    getNextEventText: function () {
      if (this.upcomingEvents && this.eventsWithoutOngoing.length > 1) {
        this.nextEventText = "NEXT UNKNOWER EVENTS START ";
      } else if (this.eventsWithoutOngoing.length < 2) {
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

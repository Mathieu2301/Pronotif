<template>
  <div class="pageContainer">
    <div class="block">
      <div class="title">Status</div>
      <div class="content">
        <div>Notifications: {{ options.notifs ? status.notif : 'Désactivées' }}</div>

        <div class="separator" v-if="options.notifs && status.retryAble">
          <input type="submit" value="Réessayer" @click="activateNotif">
        </div>

        <div class="separator" v-if="installPWA.prompt">
          <input type="submit" value="Installer l'application" @click="installPWA.prompt">
        </div>
      </div>
    </div>

    <div class="separator"/>

    <div class="block">
      <div class="title">Notifications</div>
      <div class="content">
        <optionSwitch
          :firstValue="options.notifs"
          :onClick="toggleOption('notifs')">
          Activer les notifications
        </optionSwitch>

        <optionSwitch :class="{ disabled: !options.notifs }"
          :firstValue="options.notifs_homeworks"
          :onClick="toggleOption('notifs_homeworks')">
          Notifications des devoirs
        </optionSwitch>

        <optionSwitch :class="{ disabled: !options.notifs }"
          :firstValue="options.notifs_marks"
          :onClick="toggleOption('notifs_marks')">
          Notifications des notes
        </optionSwitch>

        <optionSwitch :class="{ disabled: !options.notifs }"
          :firstValue="options.notifs_reports"
          :onClick="toggleOption('notifs_reports')">
          Notifications des retards et absences
        </optionSwitch>
      </div>
    </div>

    <div class="separator"/>

    <div class="block">
      <div class="title">Problèmes</div>
      <div class="content">
        Vous rencontrez des problèmes avec Pronotif,
        vous avez une idée de fonctionnalité ou un
        avis à donner ?
        <div class="separator"></div>
        Contactez vite
        <a href="http://instagram.com/pronotif/"
          target="_blank"
          rel="Pronotif sur Instagram">@pronotif</a>
        ou
        <a href="http://instagram.com/mathieu.le.mec/"
          target="_blank"
          rel="mathieu.le.mec sur Instagram">@mathieu.le.mec</a>
        sur Instagram !
      </div>
    </div>

    <div class="separator"/>

    <div class="block">
      <div class="title">Changer d'utilisateur</div>
      <div class="content">
        <input type="submit"
          class="blue"
          value="Changer d'utilisateur"
          @click="disconnect">
      </div>
    </div>

  </div>
</template>

<script>
import optionSwitch from '@/els/optionSwitch.vue';

export default {
  name: 'SettingsPage',

  components: {
    optionSwitch,
  },

  props: {
    data: Object,
    user: Object,
    status: Object,
    installPWA: Object,
    activateNotif: Function,
  },

  data: () => ({
    options: {
      notifs: true,
      notifs_homeworks: true,
      notifs_marks: true,
      notifs_reports: true,
    },
  }),

  watch: {
    data() {
      this.updateOptions();
    },
  },

  mounted() {
    this.updateOptions();
  },

  methods: {
    updateOptions() {
      if (!this.data.options) return;
      this.options = {
        notifs: !this.data.options.disable_global,
        notifs_homeworks: !this.data.options.disable_homeworks,
        notifs_marks: !this.data.options.disable_marks,
        notifs_reports: !this.data.options.disable_reports,
      };
    },

    toggleOption(option) {
      return (e) => {
        if (e.target.localName === 'span') return;
        this.options[option] = !this.options[option];
        window.socket.emit('setOptions', this.user, this.options);
      };
    },

    disconnect() {
      if (this.user.server === 'demo.index-education.net') {
        localStorage.removeItem('username');
        localStorage.removeItem('server');
      }

      localStorage.removeItem('password');
      window.location.reload();
    },
  },
};
</script>

<style scoped>

</style>

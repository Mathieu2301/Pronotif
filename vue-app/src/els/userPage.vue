<template>
  <div>
    <div class="header">
      <div>{{ data.name }} ({{ data.class }})</div>
      <!-- eslint-disable-next-line -->
      <svg @click="disconnect" viewBox="0 0 512 512"><path d="M0,99.07c0.88-4.5,1.65-9,2.66-13.5C13.7,36.81,57.1,1.37,107.4.24c14.4-.33,28.81-0.29,43.21,0,24.11,0.41,43.16,19.39,43.48,43a43.67,43.67,0,0,1-42.41,44.51c-12.79.46-25.6,0.07-38.41,0.16-16.73.12-25.61,9.1-25.62,25.84q0,142,0,284.09c0,17.06,8.92,26,25.89,26.11,13.33,0.07,26.7-.4,40,0.34,31.22,1.74,50.41,36.47,35.46,64-7.43,13.67-19,22.62-34.76,23.22-19.15.72-38.5,1.1-57.53-.75C48.32,506,7.82,465.88,1.13,417.76,0.89,416,.38,414.32,0,412.61Q0,255.84,0,99.07Z"/><path d="M361.56,219.69c-2.09-2.29-3.3-3.7-4.6-5C338.43,196,319.8,177.4,301.4,158.59c-14.85-15.19-16.68-38.47-4.69-55.24,12.73-17.81,35.68-24.18,54.87-14.75a49.58,49.58,0,0,1,12.84,9.32q67.06,66.82,133.83,133.93c18.35,18.43,18.32,44.83-.09,63.29Q432.82,360.66,367.28,426c-18.2,18.14-45.31,18.26-63.06.59-17.33-17.26-16.92-44.31,1.14-62.54q25.71-26,51.7-51.64a32.79,32.79,0,0,1,4.32-3.11l-0.82-1.93h-5.84q-89.64,0-179.28,0c-21.27,0-39.45-13.86-44.11-33.34-6.72-28.06,13.82-54.11,43.09-54.24,38.59-.18,77.19,0,115.79,0h71.35Z"/></svg>
    </div>
    <div class="pageContainer">
      <div class="block">
        <div class="title">Status</div>
        <div class="content">
          <div>Notifications: {{ status.notif }}</div>
          <div class="separator" v-if="status.retryAble">
            <input type="submit" value="Réessayer" @click="activateNotif">
          </div>
          <div class="separator" v-if="installPWA.prompt">
            <input type="submit" value="Installer l'application" @click="installPWA.prompt">
          </div>
        </div>
      </div>

      <div class="separator"/>

      <div class="block">
        <div class="title">Cours d'aujourd'hui</div>
        <div class="content">
          <timetable :times="data.timetable"/>
        </div>
      </div>

      <div class="separator"/>

      <div class="block">
        <div class="title">Pour demain</div>
        <div class="content">
          <div class="list" v-if="hwks && hwks.length > 0">
            <div
              v-for="(hw, i) in hwks"
              :key="i"
            >
              <div :style="{ color: hw.color }">{{ hw.subject }}</div>
              <div class="left">{{ hw.description }}</div>
            </div>
          </div>
          <div v-else>Rien à faire pour demain</div>
        </div>
      </div>

      <div class="separator"/>

      <div class="block">
        <div class="title">Dernières notes</div>
        <div class="content">
          <table v-if="mrks && mrks.length > 0">
            <tr>
              <th class="left">Nom</th>
              <th class="left">Note</th>
              <th class="left negligible2">Étend</th>
              <th class="left negligible2">Moy</th>
            </tr>

            <tr class="time"
              v-for="(mrk, i) in mrks"
              :key="i"
            >
              <td class="left" :style="{ color: mrk.subject.color }">
                {{ mrk.title || mrk.subject.name }}
              </td>
              <td class="left">
                <span :class="{
                  green: mrk.average && (mrk.value - mrk.average >= 0.5),
                  yellow: mrk.average && (
                    (mrk.value - mrk.average < 0.5)
                    && (mrk.average - mrk.value < 1)
                  ),
                  red: mrk.average && (mrk.average - mrk.value >= 1),
                }">
                  {{ mrk.value || '?' }}/{{ mrk.scale }}
                </span>
                x{{ mrk.coefficient }}
              </td>
              <td class="left negligible2">{{ mrk.min || '?' }} - {{ mrk.max || '?' }}</td>
              <td class="left negligible2">{{ mrk.average || '?' }}</td>
            </tr>
          </table>
          <div v-else>Aucune note</div>
        </div>
      </div>

      <div class="separator"/>

      <div class="block">
        <div class="title">Menu d'aujourd'hui</div>
        <div class="content">
          <div class="list" v-if="data.menu && data.menu.length > 0">
            <div
              v-for="m in data.menu"
              :key="m"
            >
              <div class="left">{{ m }}</div>
            </div>
          </div>
          <div v-else>Pas de menu aujourd'hui</div>
        </div>
      </div>

      <div class="separator"/>

      <div class="block">
        <div class="title">Amis</div>
        <div class="content">
          <div class="droppables" v-if="data.friends && data.friends.length > 0">
            <div class="droppable"
              v-for="f in data.friends"
              :key="f.key"
              :class="{ open: selectedFriend === f.key }"
            >
              <div class="head" @click="selectFriend(f.key)">
                <div>({{ f.class }}) {{ f.name }}</div>
                <div class="right delCross clickable" @click="removeFriend(f)">
                  <!-- eslint-disable-next-line -->
                  <svg class="delCross" viewBox="0 0 5567 5567"><path d="M1166 208l1615 1616 1616 -1616c632,-632 1600,319 959,960l-1615 1615 1615 1616c631,630 -329,1590 -959,959l-1616 -1615 -1615 1615c-631,631 -1590,-329 -960,-959l1616 -1616 -1616 -1615c-630,-631 329,-1591 960,-960z"/></svg>
                </div>
              </div>
              <div class="body">
                <timetable :times="f.timetable"/>
              </div>
            </div>
          </div>
          <div v-else>Aucun ami</div>

          <div class="separator"/>

          <form @submit="addFriend">
            <div class="input">
              <input type="text"
                v-model="friendName"
                placeholder="Nom d'utilisateur">
              <input class="green_btn" type="submit" value="Ajouter">
            </div>
          </form>
        </div>
      </div>

      <div :class="message.type" v-if="message.text" @click="message.text = ''">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script>
import ScrollReveal from 'scrollreveal';
import timetable from '@/els/timetable.vue';

export default {
  name: 'UserPage',

  components: {
    timetable,
  },

  props: {
    data: Object,
    user: Object,
    installPWA: Object,
  },

  data: () => ({
    friendName: '',
    message: {
      type: '',
      text: '',
    },

    selectedFriend: false,

    status: {
      notif: 'Activation...',
      retryAble: false,
    },
  }),

  computed: {
    hwks() {
      if (!this.data.homeworks || this.data.homeworks.length < 1) return false;
      return this.data.homeworks.filter((hw) => (
        !hw.done
        // eslint-disable-next-line
        && hw.for._seconds * 1000 <= (Date.now() + 86400000)
      ));
    },

    mrks() {
      if (!this.data.marks || this.data.marks.length < 1) return false;
      return this.data.marks;
    },
  },

  methods: {
    activateNotif() {
      if (!window.enablePush) {
        this.message = { type: 'error', text: 'Notifications indisponibles !' };
        this.status.notif = 'Indisponibles';
        this.status.retryAble = true;
        return;
      }
      window.enablePush().then((token) => {
        this.status.notif = 'Activées';
        window.socket.emit('addPushToken', this.user, token);
      }).catch(() => {
        this.status.notif = 'Désactivées';
        this.status.retryAble = true;
        this.message = { type: 'error', text: 'Notifications désactivées' };
      });
    },

    disconnect() {
      localStorage.removeItem('password');
      window.location.reload();
    },

    addFriend(e) {
      e.preventDefault();
      this.message.text = '';
      if (!this.friendName || this.friendName.length < 3) return;
      window.socket.emit('addFriend', this.user, this.friendName, (rs) => {
        if (rs.error) this.message = { type: 'error', text: rs.error };
        else this.message = { type: 'success', text: `Ami "${this.friendName}" ajouté !` };
      });
      this.friendName = '';
    },

    removeFriend(f) {
      if (!window[`${'confirm'}`](`Retirer "${f.name}" de la liste d'amis ?`)) return;
      this.message.text = '';
      window.socket.emit('removeFriend', this.user, f.key, (rs) => {
        if (rs.error) this.message = { type: 'error', text: rs.error };
        else this.message = { type: 'success', text: `Ami "${f.name}" retiré !` };
      });
    },

    selectFriend(i) {
      this.selectedFriend = (this.selectedFriend !== i ? i : false);
    },

  },

  mounted() {
    setTimeout(this.activateNotif, 2000);

    ScrollReveal({
      reset: true,
      duration: 500,
      scale: 0.5,
      distance: '50px',
    }).reveal('.block');

    if (window.param && window.param.addFriend) {
      const fname = atob(window.param.addFriend);
      this.message.text = '';
      window.socket.emit('addFriend', this.user, fname, (rs) => {
        // eslint-disable-next-line
        window.alert(rs.error || `Ami "${fname}" ajouté !`);
        window.location.href = '/';
      });
    }
  },
};
</script>

<style scoped>
.droppables {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}

.droppable {
  border: 1px solid #ffffff70;
  border-radius: 10px;
}

.droppable > .head {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.droppable > .body {
  padding: 15px;
  height: 100%;
}

.droppable:hover > .head,
.droppable.open > .head {
  background-color: #0094d738;
}

.droppable:not(.open) > .head {
  border-radius: 10px;
}

.droppable:not(.open) > .body {
  height: 0;
  opacity: 0;
  padding: 0;
  pointer-events: none;
}
</style>

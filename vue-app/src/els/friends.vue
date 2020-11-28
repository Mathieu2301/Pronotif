<template>
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

    <svg class="qrCode" v-html="qrcode" @click="shareUser"/>

  </div>
</template>

<script>
import timetable from '@/els/timetable.vue';

export default {
  name: 'Friends',

  components: {
    timetable,
  },

  props: {
    data: Object,
    user: Object,
  },

  data: () => ({
    friendName: '',
    selectedFriend: false,

    qrcode: localStorage.getItem('friendQRCode'),
  }),

  methods: {
    shareUser() {
      console.log(this.data);
      const url = `https://pronotif.fr/addFriend/${btoa(this.data.key)}`;
      try {
        navigator.share({
          title: 'Ajoutez moi sur Pronotif',
          text: 'Ajoutez moi sur Pronotif',
          url,
        });
      } catch (e) {
        navigator.permissions.query({ name: 'clipboard-write' }).then(() => {
          navigator.clipboard.writeText(url).then(() => {
            window.toast.success({ title: 'L\'URL à été copiée' });
          }, () => {
            window.toast.error({ title: 'Impossible de copier l\'URL' });
          });
        });
      }
    },

    addFriend(e) {
      e.preventDefault();
      if (!this.friendName || this.friendName.length < 3) return;

      const fname = this.friendName;
      window.socket.emit('addFriend', this.user, fname, (rs) => {
        if (rs.error) window.toast.error({ title: rs.error });
        else window.toast.success({ title: `Ami "${rs.fname}" ajouté !` });
      });
      this.friendName = '';
    },

    removeFriend(f) {
      window.toast.confirm(`Retirer "${f.name}" de la liste d'amis ?`, () => {
        window.socket.emit('removeFriend', this.user, f.key, (rs) => {
          if (rs.error) window.toast.error({ title: rs.error });
          else window.toast.success({ title: `Ami "${f.name}" retiré !` });
        });
      });
    },

    selectFriend(i) {
      this.selectedFriend = (this.selectedFriend !== i ? i : false);
    },
  },
};
</script>

<style>
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

.droppable.open > .head {
  background-color: #0094d738;
}

@media screen and (min-width: 700px) {
  .droppable:hover > .head {
    background-color: #0094d738;
  }
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

.qrCode {
  fill: #000000;
  background: #00ffa6;
  border-radius: 10px;
  height: 300px;
  margin-bottom: 20px;
}
</style>

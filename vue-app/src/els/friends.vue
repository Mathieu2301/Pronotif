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

    <div class="centerContainer">
      <div class="svgTextBtn" @click="showQR = true">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 100 100"><path d="m5.4863 6.0859a1.2501 1.2501 0 0 0-1.25 1.25v26.871a1.2501 1.2501 0 1 0 2.5 0v-25.621h25.727a1.2501 1.2501 0 1 0 0-2.5h-26.977zm62.504 0a1.2501 1.2501 0 1 0 0 2.5h25.727v25.621a1.2501 1.2501 0 1 0 2.5 0v-26.871a1.2501 1.2501 0 0 0-1.25-1.25h-26.977zm-17.457 10.123a1.2501 1.2501 0 0 0-1.2305 1.2676v24.215a1.2501 1.2501 0 1 0 2.5 0v-24.215a1.2501 1.2501 0 0 0-1.2695-1.2676zm-35.109 0.017578a1.2501 1.2501 0 0 0-1.25 1.25v23.367a1.2501 1.2501 0 0 0 1.25 1.25h23.367a1.2501 1.2501 0 0 0 1.25-1.25v-23.367a1.2501 1.2501 0 0 0-1.25-1.25h-23.367zm46.035 0a1.2501 1.2501 0 0 0-1.25 1.25v23.367a1.2501 1.2501 0 0 0 1.25 1.25h23.367a1.2501 1.2501 0 0 0 1.25-1.25v-23.367a1.2501 1.2501 0 0 0-1.25-1.25h-23.367zm-44.785 2.5h20.867v20.867h-20.867v-20.867zm46.035 0h20.867v20.867h-20.867v-20.867zm-47.285 30.805a1.2501 1.2501 0 1 0 0 2.5h33.879v32.734a1.2501 1.2501 0 0 0 1.25 1.25h34.273a1.2501 1.2501 0 1 0 0-2.5h-33.023v-32.734a1.2501 1.2501 0 0 0-1.25-1.25h-35.129zm46.035 0a1.2501 1.2501 0 0 0-1.25 1.25v22.84a1.2501 1.2501 0 1 0 2.5 0v-21.59h20.867v21.59a1.2501 1.2501 0 1 0 2.5 0v-22.84a1.2501 1.2501 0 0 0-1.25-1.25h-23.367zm-46.035 10.73a1.2501 1.2501 0 0 0-1.25 1.25v23.367a1.2501 1.2501 0 0 0 1.25 1.25h23.367a1.2501 1.2501 0 0 0 1.25-1.25v-23.367a1.2501 1.2501 0 0 0-1.25-1.25h-23.367zm1.25 2.5h20.867v20.867h-20.867v-20.867zm-11.207 3.6016a1.2501 1.2501 0 0 0-1.2305 1.2676v26.871a1.2501 1.2501 0 0 0 1.25 1.25h26.977a1.2501 1.2501 0 1 0 0-2.5h-25.727v-25.621a1.2501 1.2501 0 0 0-1.2695-1.2676zm89.48 0a1.2501 1.2501 0 0 0-1.2305 1.2676v25.621h-25.727a1.2501 1.2501 0 1 0 0 2.5h26.977a1.2501 1.2501 0 0 0 1.25-1.25v-26.871a1.2501 1.2501 0 0 0-1.2695-1.2676z"/></svg>
        <div>Afficher code QR</div>
      </div>

      <div class="svgTextBtn" @click="shareUser">
        <!-- eslint-disable-next-line -->
        <svg viewBox="0 0 1024 1024"><path d="M857.3,665.6c-33.1-17.5-71-21.2-106.7-10.4c-1.5,0.4-3,0.9-4.4,1.4c-0.9,0.3-1.8,0.6-2.7,1  c-20.6,7.4-39.5,19.7-54.6,35.6c-0.3,0.3-0.5,0.5-0.8,0.8l-262.5-139l0.2-0.8c0.1-0.4,0.2-0.9,0.3-1.3c6-24.1,6.4-49.7,0.9-74.1  c-0.2-1.1-0.5-2.1-0.8-3.2c-0.1-0.7-0.3-1.4-0.5-2c0-0.2-0.1-0.3-0.1-0.5l262.4-139c0.3,0.3,0.5,0.5,0.8,0.8  c15.1,15.9,34,28.2,54.6,35.6c0.9,0.3,1.8,0.6,2.7,0.9c1.5,0.5,3,1,4.5,1.5c13.4,4,27.1,6,40.8,6c22.7,0,45.3-5.6,65.9-16.5  c33.3-17.7,57.8-47.2,68.9-83.3c4.2-13.7,6.3-27.7,6.3-41.7c0-22.7-5.5-45.3-16.5-65.9c-17.7-33.3-47.3-57.8-83.3-68.9  c-36.1-11.1-74.3-7.5-107.6,10.2c-56.6,30-85.8,93.8-71.7,156l-262.5,139c-0.1-0.2-0.3-0.3-0.4-0.5c-11.1-12.5-24.1-23.3-38.7-31.9  c-37-21.8-80.2-27.9-121.8-17.1c-41.6,10.8-76.5,37-98.3,74c-45,76.4-19.5,175.1,56.9,220.1c25,14.7,53,22.3,81.4,22.3  c12.2,0,24.5-1.4,36.7-4.3c2-0.5,3.9-0.9,5.6-1.4c1.1-0.3,2.2-0.6,3.2-0.9c24-7,46.3-19.7,64.4-36.7c0.5-0.4,0.9-0.9,1.4-1.3  c0.2-0.2,0.5-0.5,0.7-0.7l0.1-0.1c0.8-0.8,1.6-1.6,2.4-2.4c0.4-0.4,0.8-0.8,1.3-1.3c1.5-1.5,3-3.1,4.5-4.8c0.1-0.2,0.3-0.3,0.4-0.5  l262.7,139.1c-14.1,62.2,15.1,126,71.7,156c20.7,10.9,43.2,16.5,65.9,16.5c14,0,28-2.1,41.7-6.3c36.1-11.1,65.6-35.6,83.3-68.9  c17.6-33.3,21.3-71.6,10.2-107.6C915.1,712.9,890.6,683.3,857.3,665.6z"/></svg>
        <div>Partager le lien</div>
      </div>
    </div>

    <div class="qrPage" v-if="showQR" @click="showQR = false">
      <svg class="qrCode" v-html="qrcode"/>
    </div>
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

    showQR: false,
    qrcode: localStorage.getItem('friendQRCode'),
  }),

  methods: {
    shareUser() {
      const url = `https://pronotif.fr/addFriend/${btoa(this.data.key)}`;
      try {
        navigator.share({
          title: 'Ajoutez moi sur Pronotif',
          text: 'Ajoutez moi sur Pronotif',
          url,
        });
      } catch (e) {
        navigator.permissions.query({ name: 'clipboard-write' }).then(({ state }) => {
          if (state !== 'granted') {
            window.toast.error({ title: 'Impossible de copier l\'URL' });
            return;
          }
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
  transform: scale(0.5);
  pointer-events: none;
}

.qrPage {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFF;
}

.qrCode {
  fill: #000000;
  border-radius: 10px;
  margin-bottom: 20px;
  height: 100%;
  width: 70%;
  cursor: pointer;
}

.centerContainer {
  display: flex;
  flex-wrap: wrap;
  margin: 0 50px;
  gap: 10px;
  padding: 20px 0 40px;
}

.svgTextBtn {
  display: flex;
  height: 50px;
  max-width: 250px;
  width: 100%;
  margin: 0 auto;
  align-items: center;
  background-color: #ffffff1c;
  border-radius: 20px;
  border: solid 2px #e6e6e6;
  cursor: pointer;
}

.svgTextBtn:hover { background-color: #ffffff30 }

.svgTextBtn > svg {
  fill: #FFF;
  height: 100%;
  padding: 1px 15px;
  border-right: solid 2px #e6e6e6;
}

.svgTextBtn > div {
  width: 100%;
  text-align: center;
}

</style>

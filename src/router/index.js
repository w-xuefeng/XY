import Vue from 'vue'
import Router from 'vue-router'
import player from '@/components/player'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'player',
      component: player
    }
  ]
})

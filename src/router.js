import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import MatchView from './views/MatchView.vue'
import HeroesView from './views/HeroesView.vue'
import PlayersView from './views/PlayersView.vue'
import TournamentsView from './views/TournamentsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView, meta: { title: 'Find a match' } },
    { path: '/matches/:id(\\d+)', component: MatchView, meta: { title: 'Match overview' } },
    { path: '/heroes', component: HeroesView, meta: { title: 'Heroes' } },
    { path: '/players', component: PlayersView, meta: { title: 'Pro players' } },
    { path: '/tournaments', component: TournamentsView, meta: { title: 'Tournaments' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Dota 2 insights'} · Aghs Labs`
})

export default router

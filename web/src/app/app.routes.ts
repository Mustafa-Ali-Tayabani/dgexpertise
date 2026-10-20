import { Routes } from '@angular/router';
import { toRoute } from './core/links';
import { SERVICE_LIST } from './data/site-data';
import { Home } from './pages/home/home';
import { Expertise } from './pages/expertise/expertise';
import { Service } from './pages/service/service';
import { InfoPage } from './pages/info/info-page';
import { ArticlePage } from './pages/article/article';
import { LegalPage } from './pages/legal/legal';

/** Info pages: route path → info-data PAGES key (paths mirror the design filenames). */
const INFO: Record<string, string> = {
  'qui-sommes-nous': 'about',
  'references': 'references',
  'application': 'application',
  'formations-polluants': 'formations',
  'bibliotheque-des-polluants': 'bibliotheque',
  'laboratoires-partenaires': 'laboratoires',
  'actualites': 'news',
  'contact': 'contact',
};

export const routes: Routes = [
  { path: '', component: Home, title: 'DG Expertise' },
  { path: 'expertise', component: Expertise, title: 'Expertise — DG Expertise' },
  ...SERVICE_LIST.map((s: any) => ({ path: toRoute(s.file).slice(1), component: Service, data: { slug: s.slug }, title: 'DG Expertise' })),
  ...Object.entries(INFO).map(([path, page]) => ({ path, component: InfoPage, data: { page }, title: 'DG Expertise' })),
  { path: 'actualites/:slug', component: ArticlePage, title: 'Actualités — DG Expertise' },
  { path: 'mentions-legales', component: LegalPage, data: { doc: 'mentions' }, title: 'Mentions légales — DG Expertise' },
  { path: 'protection-des-donnees', component: LegalPage, data: { doc: 'privacy' }, title: 'Protection des données — DG Expertise' },
  { path: '**', redirectTo: '' },
];

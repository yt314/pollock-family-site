import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'כניסה · פורום משפחת פולוק',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'הפורום המשפחתי',
  },
  {
    path: 'forum/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/forum/forum').then((m) => m.Forum),
    title: 'פורום',
  },
  {
    path: 'thread/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/thread/thread').then((m) => m.Thread),
    title: 'אשכול',
  },
  {
    path: 'rules',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/rules/rules').then((m) => m.Rules),
    title: 'תקנון · הפורום המשפחתי',
  },
  { path: '**', redirectTo: '' },
];

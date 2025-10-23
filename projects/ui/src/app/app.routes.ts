import { Routes } from '@angular/router';
import { ConverterPageComponent } from './features/converter/converter.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: ConverterPageComponent },
  { path: '**', redirectTo: '' },
];

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProcesoOfflinePage } from './proceso-offline.page';

const routes: Routes = [
  {
    path: '',
    component: ProcesoOfflinePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProcesoOfflinePage]
})
export class ProcesoOfflinePageModule {}

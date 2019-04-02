import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProcesarParcialPage } from './procesar-parcial.page';

const routes: Routes = [
  {
    path: '',
    component: ProcesarParcialPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProcesarParcialPage]
})
export class ProcesarParcialPageModule {}

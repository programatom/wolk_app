import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CajaDiariaPage } from './caja-diaria.page';

const routes: Routes = [
  {
    path: '',
    component: CajaDiariaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CajaDiariaPage]
})
export class CajaDiariaPageModule {}

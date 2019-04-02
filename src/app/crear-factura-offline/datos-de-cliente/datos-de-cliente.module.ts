import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DatosDeClientePage } from './datos-de-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: DatosDeClientePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DatosDeClientePage]
})
export class DatosDeClientePageModule {}

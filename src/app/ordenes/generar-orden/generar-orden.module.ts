import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GenerarOrdenPage } from './generar-orden.page';

const routes: Routes = [
  {
    path: '',
    component: GenerarOrdenPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GenerarOrdenPage]
})
export class GenerarOrdenPageModule {}

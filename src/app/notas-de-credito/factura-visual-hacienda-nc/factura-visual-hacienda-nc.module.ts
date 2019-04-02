import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FacturaVisualHaciendaNCPage } from './factura-visual-hacienda-nc.page';

const routes: Routes = [
  {
    path: '',
    component: FacturaVisualHaciendaNCPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FacturaVisualHaciendaNCPage]
})
export class FacturaVisualHaciendaNCPageModule {}

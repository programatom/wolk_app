import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NotasRealizadasPage } from './notas-realizadas.page';

const routes: Routes = [
  {
    path: '',
    component: NotasRealizadasPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [NotasRealizadasPage]
})
export class NotasRealizadasPageModule {}

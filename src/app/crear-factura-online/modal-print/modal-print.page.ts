import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { NavigationParamsService } from 'src/app/services/navigation-params.service';

@Component({
  selector: 'app-modal-print',
  templateUrl: './modal-print.page.html',
  styleUrls: ['./modal-print.page.scss'],
})
export class ModalPrintPage implements OnInit {
  printerList: any = [];


  constructor(public navCtrl: NavController, public navParams: NavigationParamsService,
              private modalCtrl: ModalController) {
  }


  select(data) {
    this.navParams.selectedPrinter = data;
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
    this.printerList = this.navParams.dataPrint.data;
  }

  dismissModal(){
    this.navParams.selectedPrinter = null;
    this.modalCtrl.dismiss();

  }

}

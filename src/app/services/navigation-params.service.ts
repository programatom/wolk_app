import { Injectable } from '@angular/core';
import { ObjClientData,ObjProcesoOffline } from 'src/interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class NavigationParamsService {

  clientData = new Object() as ObjClientData;
  procesoOfflineData = new Object() as ObjProcesoOffline;
  dataPrint:{
    data:any
    backUrl:string
  } = {
    "data": [],
    "backUrl":""
  };
  selectedPrinter:any = null;

  dataCajaDiaria = new Object () as {
    "data":any
  };
  constructor() {
    this.dataCajaDiaria.data = new Object() as any;
  }
}

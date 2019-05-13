import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintStringProcessService {

  constructor() { }

  generateLineProduct(codigo: string, nombre: number, diferencia: number) {
    var productoCut = this.cutString(codigo, 10, "right", true);
    var nombreCut = this.cutString(nombre.toString(), 20, "right", true);
    var numeroCut = this.cutString(diferencia, 10, "left")
    var linea = productoCut + nombreCut + numeroCut + "\n";
    return linea;
  }



  cutString(string, max, pad, exception?) {

    if (typeof string != "string") {
      string = string.toString();
    };

    if (exception == undefined) {
      string = this.numberWithCommas(string);
    }

    let len = string.length;
    if (len > max) {
      return string.substring(0, max);
    } else {
      let espacios = max - len;
      if (pad == "right") {
        return string + ' '.repeat(espacios);
      } else {
        return ' '.repeat(espacios) + string;
      }
    }
  }

  numberWithCommas(string) {
    return string.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  centeredString(string: string) {
    // LA LONG MAXIMA es 40
    let stringLength: number = string.length;
    let padLeft: number = 40 - stringLength;
    if (padLeft < 0) {
      return string.substring(0, 40);
    } else {
      padLeft = padLeft / 2;
      return " ".repeat(padLeft) + string;
    }
  }

  numberToDisplayStyle(number) {
    let string = number.toString();
    let split = string.split(".");
    if (split.length == 1) {
      return this.numberWithCommas(string) + ".00";
    } else {
      return this.numberWithCommas(string);
    }
  }




}

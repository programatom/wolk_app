import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintStringProcessService {

  constructor() { }

  generateLineProduct(codigo: string, nombre: number, diferencia: number) {
    var productoCut = this.cutString(codigo, 15, "right", true);
    var existenciaCut = this.cutString(nombre.toString(), 10, "left", true);
    var diferenciaCut = this.cutString(diferencia, 15, "left")
    var linea = productoCut + existenciaCut + diferenciaCut + "\n";
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

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintStringProcessService {

  constructor() { }

  generateLineProduct(first: string, second: number, third: number) {
    var firstCut = this.cutString(first, 10, "right", true);
    var secondCut = this.cutString(second.toString(), 20, "center", true);
    var thirdCut = this.cutString(third, 10, "left");
    var linea = firstCut + secondCut + thirdCut + "\n";
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
      } else if ( pad == "left"){
        return ' '.repeat(espacios) + string;
      } else if( pad =="center"){
        return ' '.repeat(Math.floor(espacios/2)) + string + ' '.repeat(Math.floor(espacios/2));

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

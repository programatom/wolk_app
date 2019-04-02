import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonOperationsService {

  constructor() { }

  aproxXDecimals(number:number ,decimales:number){
    let ceros = "0".repeat(decimales);
    let aprox = parseInt("1" + ceros);
    return Math.round(number * aprox)/aprox;
  }

  checkStrOrNumberThreeDecimals(array: Array<any>) {

    // Agarra STR y checkea su tipo e inicializa cada variable en el orden del array
    // entregado.
    // Si hay un elemento del array que no es un numero rebota con un status fail

    let obj = {}
    obj["valores"] = [];
    obj["status"] = "success";

    for(let i = 0; i < array.length; i++ ){

      let variable = array[i]
      let type = typeof (variable);

      if (type == "number") {
        obj["valores"].push(Math.round(variable*1000)/1000);
      } else {
        if (isNaN(variable)) {
          obj["status"] = "fail";
        } else {
          let variableForNum = variable.replace(",",".");
          let varNum = parseFloat(variableForNum)
          obj["valores"].push(Math.round(varNum*1000)/1000);
        }
      }
    }

    return obj;
  }
}

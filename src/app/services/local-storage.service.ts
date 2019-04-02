import { Injectable } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { ObjLocalStorage } from "../../interfaces/interfaces";

import { Storage } from '@ionic/storage';
import { ToastService } from './toast.service';
import { AlertOptions } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {


  objResponse: objResponse;
  isCordova: boolean = false;
  internetConnection:boolean = true;

  // Se instancia todo el local storage en este objeto

  localStorageObj = new Object() as ObjLocalStorage;

  constructor(private storage: Storage,
    private plt: Platform,
    private toastServ: ToastService,
    private alertCtrl: AlertController) {

    if (this.plt.is("cordova")) {
      this.isCordova = true;
    }
  }

  checkInternetConnection(){
    if(this.internetConnection == false){
      this.toastServ.toastMensajeDelServidor("No tiene conexión a internet!" , "error")
    }else{
      return;
    }
  }

  async presentAlert(header?, subHeader?, inputs?, buttons?, message?) {


    let alertOptions = new Object() as AlertOptions;

    if (header != undefined) {
      alertOptions.header = header
    }
    if (subHeader != undefined) {
      alertOptions.subHeader = subHeader
    }
    if (inputs != undefined) {
      alertOptions.inputs = inputs
    }
    if (buttons != undefined) {
      alertOptions.buttons = buttons
    }
    if (buttons != undefined) {
      alertOptions.message = message
    }

    const alert = await this.alertCtrl.create(alertOptions);
    return await alert.present();
  }



  valueInsertIterator(arrayOfKeyValueObj) {

    if (this.isCordova) {
      console.log(JSON.stringify(arrayOfKeyValueObj))
    } else {
      console.log(arrayOfKeyValueObj);
    }
    return new Promise((resolve) => {
      let lengthArray = arrayOfKeyValueObj.length;
      let asyncEndCount = 0;
      for (let i = 0; i <= lengthArray - 1; i++) {
        let key = Object.keys(arrayOfKeyValueObj[i])[0];
        let value = arrayOfKeyValueObj[i][key];

        // Tiro lengthKeys tareas asincronas

        this.insertAndInstantiateValue(key, value).then((asyncEnd) => {
          asyncEndCount = asyncEndCount + 1;
          if (asyncEndCount == lengthArray) {
            resolve(this.objResponse = {
              "status": "success",
              "mensaje": 'Se instanciaron y guardaron las variables'
            })
          }
        });
      }
    })
  }


  insertAndInstantiateValue(key, value) {
    return new Promise((resolve) => {
      if (this.plt.is('cordova')) {
        this.storage.ready().then(() => {
          if (typeof value === "object") {
            this.insertValue(true, key, value)
            resolve(this.objResponse);
          } else {
            this.insertValue(false, key, value)
            resolve(this.objResponse);
          }
        }).catch((error)=>{
          console.log(error)
        })
      } else {

        if (typeof value === "object") {
          this.insertValue(true, key, value);
          resolve(this.objResponse);
        } else {
          this.insertValue(false, key, value)
          resolve(this.objResponse);
        }

      }
    })
  }

  insertValue(stringify: boolean, key, value) {

    if (stringify) {
      if (this.isCordova) {
        this.storage.set(key, JSON.stringify(value)).then((data)=>{
          console.log("TOMA BUG DE MIERDA");
          console.log(JSON.stringify(data));
          this.instantiate(key, value);
          this.objResponse = {
            "status": "success",
            "mensaje": 'Se guardó el value' + value + ' en la key: ' + key + ' con éxito'
          }
        });
        //console.log('Se guardó el value: ', value, "en la key: ", key,' con éxito');
        return;
      } else {
        localStorage.setItem(key, JSON.stringify(value));
        //console.log('Se guardó el value: ' + value + "en la key: " + key + ' con éxito');
        this.instantiate(key, value);
        this.objResponse = {
          "status": "success",
          "mensaje": 'Se guardó el value: ' + value + "en la key: " + key + ' con éxito'
        }
        return;
      }
    } else {
      if (this.isCordova) {
        this.storage.set(key, value).then((data)=>{
          console.log("TOMA BUG DE MIERDA")
          console.log(JSON.stringify(data))
          //console.log('Se guardó el value: ', value, "en la key: ", key,' con éxito');
          this.instantiate(key, value);
          this.objResponse = {
            "status": "success",
            "mensaje": 'Se guardó el value' + value + ' en la key: ' + key + ' con éxito'
          }
        });
        return;
      } else {
        localStorage.setItem(key, value);
        //console.log('Se guardó el value: ' + value + "en la key: " + key + ' con éxito');
        this.instantiate(key, value);
        this.objResponse = {
          "status": "success",
          "mensaje": 'Se guardó el value: ' + value + "en la key: " + key + ' con éxito'
        }
        return;
      }
    }

  }

  searchAndInstantiateAllKeysInStorage() {

    return new Promise((resolve) => {
      if (this.isCordova) {
        this.storage.keys().then((keys) => {
          console.log(JSON.stringify(keys));
          this.iterateKeys(keys).then((response) => {
            resolve(response);
          })
        })
      } else {
        let keys = Object.keys(localStorage);
        this.iterateKeys(keys).then((response) => {
          resolve(response);
        })
      }
    })
  }

  iterateKeys(keys) {

    // Ordenar el array antes

    return new Promise((resolve) => {
      let lengthArray = keys.length;
      let asyncEndCount = 0;
      for (let i = 0; i < lengthArray; i++) {
        let key = keys[i];

        // Tiro lengthKeys tareas asincronas

        this.searchAndInstantiateKey(key).then((asyncEnd) => {
          if (asyncEnd["status"] == "fail") {
            asyncEndCount = asyncEndCount + 1;
            resolve(this.objResponse = {
              "status": "fail",
              "mensaje": 'No se encontró el valor ' + key + " en el storage"
            })
          } else {
            asyncEndCount = asyncEndCount + 1;
            if (asyncEndCount == lengthArray) {
              resolve(this.objResponse = {
                "status": "success",
                "mensaje": 'Se barrieron todas las keys del storage'
              })
            }
          }
        });
      }
      resolve(this.objResponse = {
        "status": "success",
        "mensaje": 'Se barrieron todas las keys del storage'
      })
    })
  }

  searchAndInstantiateKey(key) {
    if (this.plt.is('cordova')) {

      // DISPOSTIVO

      return new Promise((resolve) => {
        this.storage.ready().then(() => {
          this.storage.get(key).then((value: any) => {
            console.log("El valor nulo de la variable value del store: ")
            console.log(value)
            if (value != undefined || value != null) {
              this.instantiate(key, value);
              this.objResponse = {
                "status": "success",
                "mensaje": "Se encontró el valor: " + value + " en la key: " + key,
              };
              resolve(this.objResponse);
            } else {
              this.objResponse = {
                "status": "fail",
                "mensaje": "No se encontró el valor",
              }
              resolve(this.objResponse);
            }
          }).catch((err) => {
            console.log(JSON.stringify(err));
          })
        })
      })
    } else {

      //NAVEGADOR

      return new Promise((resolve) => {
        let value = localStorage.getItem(key);
        if (value == null) {
          console.log('No hay value')
          this.objResponse = {
            "status": "fail",
            "mensaje": "No se encontró el valor",
          }
          resolve(this.objResponse);
        } else {
          this.instantiate(key, value);
          this.objResponse = {
            "status": "success",
            "mensaje": "Se encontró el valor: " + value + " en la key: " + key,
          };
          resolve(this.objResponse);
        }
      })
    }
  }

  instantiate(key, value) {

    if (this.isJson(value)) {
      this.localStorageObj[key] = this.parse(value);
      return;
    } else {
      this.localStorageObj[key] = value;
      return;
    }
  }

  eliminateAllValuesInStorage() {
    return new Promise((resolve) => {
      if(this.plt.is("cordova")){
        this.storage.ready().then(() => {
          this.storage.clear().then(() => {
            console.log('Se borraron todos los valores')
            this.objResponse = {
              "status": "success",
              "mensaje": "Se borraron todos los valores del local storage",
            }
            resolve(this.objResponse);
          }).catch((error)=>{
            console.log(JSON.stringify(error));
          })
        }).catch((error)=>{
          console.log(JSON.stringify(error));
        })
      }else{
        localStorage.clear();
        this.objResponse = {
          "status": "success",
          "mensaje": "Se borraron todos los valores del local storage",
        }
        resolve(this.objResponse);
      }
    })
  }

  eliminateOneValueInStorage(key) {
    return new Promise((resolve) => {
      if (this.plt.is("cordova")) {
        this.storage.ready().then(() => {
          this.storage.remove(key).then(() => {
            console.log('Se borró el value en la key', key)
            this.objResponse = {
              "status": "success",
              "mensaje": "Se borro el value en la key: " + key,
            }
            this.desinstantiate(key);
            resolve(this.objResponse);
          })
          .catch((error)=>{
            console.log("Ocurrio un error con la elminacion del value ", key)
          })
        })
      } else {
        localStorage.removeItem(key);
        console.log('Se borró el value en la key', key)
        this.objResponse = {
          "status": "success",
          "mensaje": "Se borro el value en la key: " + key,
        }
        this.desinstantiate(key);
        resolve(this.objResponse);
      }
    })
  }

  desinstantiate(key) {
    delete this.localStorageObj[key];
    return;
  }

  parse(array) {

    try {
      let a = JSON.parse(array);
    } catch (e) {
      return [];
    }
    array = JSON.parse(array);
    return array;
  }

  isJson(item) {

    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }

    if (typeof item === "object" && item !== null) {
      return true;
    }

    return false;
  }
}



interface objResponse {
  "status": string,
  "mensaje": string
}

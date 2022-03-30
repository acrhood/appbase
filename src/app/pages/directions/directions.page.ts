import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs';
import { AlertController, ModalController, LoadingController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudService } from '../../services/crud.service';
import { AdddirectionPage } from '../adddirection/adddirection.page';
import { ErrorPage } from '../../modals/error/error.page';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { GooglemapsPage } from 'src/app/modals/googlemaps/googlemaps.page';

declare var google: any;

@Component({
  selector: 'app-directions',
  templateUrl: './directions.page.html',
  styleUrls: ['./directions.page.scss'],
})
export class DirectionsPage implements OnInit {
  // tslint:disable: triple-equals
  @ViewChild('Map', {static: false}) mapElement: ElementRef;
  userid: string;
  listaDirecciones: any;
  subsDireccion: Subscription;
  iddir: any;
  map: any;
  mapOptions: any;
  location: any = { lat: 10.0721746, lng: -84.31173590000003 };
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( public alertController: AlertController,
               private afAuth: AngularFireAuth,
               private crudService: CrudService,
               public modalCtrl: ModalController,
               /*private locationAccuracy: LocationAccuracy,*/
               private loadingCtrl: LoadingController ) { }

  ngOnInit() {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
    }
    // this.locationAccuracy.canRequest().then((canRequest: boolean) => {
    //   if (canRequest) {
    //     // the accuracy option will be ignored by iOS
    //     this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
    //       () => {
    //         console.log('Request successful');
    //       },
    //       error => {
    //         console.log('Error requesting location permissions', error);
    //       }
    //     );
    //   } else {
    //     console.log('else can request');
    //   }
    // }).catch((err: any) => {
    //   console.log(err);
    // });
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    if (this.afAuth.auth.currentUser != null) {
      this.getDireccionesByUser();
    } else {
      this.listaDirecciones = [];
    }
  }

  async openMap(vid: number) {
    console.log('ver direccion en mapa');
    const modal = await this.modalCtrl.create({
      component: GooglemapsPage,
      componentProps: { vid }
    });
    return await modal.present();
  }

  setDefecto( viddir: any ) {
    console.log('viddir');
    console.log(viddir);
    const data = { sel: '', tbl: 48, where: '"' + this.userid + '",' + viddir };
    this.crudService.crud( data ).subscribe(res => {
      console.log(res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"directions","setDefecto",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.getDireccionesByUser();
      }
    }, err => {
      console.log(err);
    });
  }

  getDireccionesByUser() {
    console.log('getDireccionesByUser2');
    console.log(this.userid);
    const data = { sel: '', tbl: 16, where: '"' + this.userid + '"' };
    this.crudService.crud( data ).subscribe(res => {
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"directions","getDireccionesByUser",16';
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log('res');
        console.log( JSON.stringify(res) );
        console.log(res[0].length);
        if (res[0].length == 0) {
          this.listaDirecciones = res[0];
          document.getElementById('noDirections').classList.remove('ion-hide');
        } else {
          this.listaDirecciones = res[0];
          document.getElementById('noDirections').classList.add('ion-hide');
        }
      }
    }, err => {
      console.log('error: crud err');
      console.log( err );
    });
  }

  async editDireccion( event: any ) {
    const viddir: any = event.target.id;
    const data = { sel: '', tbl: 17, where: viddir };
    console.log('Direccion');
    this.crudService.crud( data ).subscribe(
      async (succ) => {
        console.log('succ');
        console.log(succ);
        // insert error
        if (succ[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + succ[0].ERROR + '",' +
          '"directions","editDireccion",17';
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        } else {
          const modal = await this.modalCtrl.create({
            component: AdddirectionPage,
            componentProps: {
              viddir: succ[0][0][0],
              vopt: 2,
              vdireccion: succ[0][0][1],
              votrasenas: succ[0][0][2],
              vphone: succ[0][0][3],
              nlat: succ[0][0][5],
              nlng: succ[0][0][6],
              nkms: succ[0][0][7],
              tipo: 2
            }
          });
          await modal.present();
          // tslint:disable-next-line: no-shadowed-variable
          const { data } = await modal.onWillDismiss();
          console.log('Cierra modal editar direccion');
          console.log(data);
          if (data != undefined) {
            this.getDireccionesByUser();
          }
        }
      }, (error) => {
        console.log('error');
        console.log(error);
      }
    );
  }

  async deleteDireccion( event: any ) {
    const id: any = event.target.id;
    console.log( id );
    const modal = await this.modalCtrl.create({
      component: ErrorPage,
      cssClass: 'error-modal',
      componentProps: {
        error: 'Desea eliminar esta dirección?'
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    const loading = await this.loadingCtrl.create({
      message: 'Borrando direccion...',
    });
    await loading.present();
    if (data != undefined) {
      const str = { sel: '', tbl: 15, where: '3,' + id + ',0,0,0,"","","",0' };
      this.crudService.crud( str ).subscribe(res => {
        console.log( res );
        if (res[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
          '"directions","deleteDireccion",' + str.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        } else {
          loading.dismiss();
          this.getDireccionesByUser();
        }
      }, err => {
        loading.dismiss();
        console.log( err );
      });
    } else {
      loading.dismiss();
    }
  }

  async presentAlertConfirm( id: any) {
    const alert = await this.alertController.create({
      header: 'Confirmacion!',
      message: '¿Desea eliminar esta dirección?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Eliminar',
          handler: () => {
            console.log('Confirm Okay');
            this.deleteDireccion( id );
            this.getDireccionesByUser();
          }
        }
      ]
    });
    await alert.present();
  }

}

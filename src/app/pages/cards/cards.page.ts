import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudService } from 'src/app/services/crud.service';
import { FtpaymentService } from '../../services/ftpayment.service';
import { VerifypassPage } from '../../modals/verifypass/verifypass.page';
import { NavController, ModalController, LoadingController } from '@ionic/angular';
import { GeneralComponent } from '../../components/general/general.component';
import { StorageService } from '../../services/storage.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit {
  // tslint:disable: triple-equals
  userid: string;
  listaCards: any;
  username: string;
  impresa: string;
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private afAuth: AngularFireAuth,
               private crudService: CrudService,
               private fts: FtpaymentService,
               private modalCtrl: ModalController,
               private loadingCtrl: LoadingController,
               private general: GeneralComponent,
               private storage: StorageService,
               private navCtrl: NavController ) { }

  async ngOnInit() {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      this.username = this.afAuth.auth.currentUser.email;
      this.impresa = (await this.storage.getItem('impresa')).value;
      this.getCardsByUser();
    } else {
      // this.listaCards = [];
      this.general.mostrar_alert('Para ver el historial de ordenes debes iniciar sesión');
      this.navCtrl.navigateBack('/signin');
    }
  }

  ionViewDidEnter() {
    if (this.afAuth.auth.currentUser != null) {
      this.getCardsByUser();
    } else {
      this.listaCards = [];
    }
  }

  doRefresh(event: any) {
    console.log('Begin async operation');
    this.getCardsByUser();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  setDefecto( cardid: any ) {
    console.log('cardid');
    console.log(cardid);
    const data = { sel: '', tbl: 55, where: cardid + ',"' + this.userid + '"' };
    this.crudService.crud( data ).subscribe(res => {
      console.log(res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","cards","setDefecto",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.getCardsByUser();
      }
    }, err => {
      console.log(err);
    });
  }

  getCardsByUser() {
    console.log('getCardsByUser');
    this.userid = this.afAuth.auth.currentUser.uid;
    console.log(this.userid);

    const data = { sel: '', tbl: 49, where: '"' + this.userid + '"' };

    this.crudService.crud( data ).subscribe(
      res => {
        console.log('res');
        console.log( JSON.stringify(res) );
        // insert error
        if (res[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
          '"cards","getCardsByUser",' + data.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        } else {
          if (res[0].length == 0) {
            document.getElementById('noCards').classList.remove('ion-hide');
            this.listaCards = res[0];
          } else {
            document.getElementById('noCards').classList.add('ion-hide');
            this.listaCards = res[0];
          }
        }
      },
      err => {
        console.log('error: crud err');
        console.log( err );
      }
    );
  }

// crud( data: any ) {
//   this.crudService.crud( data ).subscribe(
//     async res => {
//       console.log('Información de tarjeta eliminada');
//       console.log( res );
//       // insert error
//       if (res[0].ERROR != undefined) {
//         this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
//         '"","",';
//         this.crudService.crud(this.errsystem).subscribe(done => {
//           console.log(done);
//         }, err => {
//           console.log(err);
//         });
//       }
//       this.modalCtrl.dismiss({
//         dismissed: true
//       });
//       this.getCardsByUser();
//       return true;
//     },
//     err => {
//       console.log( err );
//     }
//   );
// }

async cardDelete( idcard: number, cardTokenId: string ) {
  console.log(this.username);
  // const modal = await this.modalCtrl.create({
  //   component: VerifypassPage,
  //   cssClass: 'modal-modal',
  //   componentProps: {
  //     getuser: this.username
  //   }
  // });
  // await modal.present();
  // const { data } = await modal.onWillDismiss();
  // console.log(JSON.stringify(data));
  // console.log(data);
  const loading = await this.loadingCtrl.create({
    message: 'Eliminando tarjeta',
  });
  await loading.present();
  // if (data != undefined) {
    this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
      if (sucft[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + sucft[0].ERROR + '","cards","cardDelete",96';
        this.crudService.crud(this.errsystem).subscribe(done => {
          loading.dismiss();
          this.general.mostrar_error('Tuvimos un inconveniente eliminando la tarjeta', 0);
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.fts.appGetChargesByUser(sucft[0][0][0], sucft[0][0][1], this.username).subscribe((res: any) => {
          console.log(res);
          console.log(res.userCharges);
          if (res != null) {
            if (res.userCharges != null ) {
              if (res.userCharges.length > 0) {
                this.fts.appDeleteCharge(sucft[0][0][0], sucft[0][0][1], this.username, res.userCharges[0].chargeTokenId).
                subscribe((delCharge: any) => {
                  if (delCharge.apiStatus == 'Successful') {
                    this.deleteCard(loading, cardTokenId, idcard, sucft[0][0][0]);
                  }
                });
              }
            } else {
              this.deleteCard(loading, cardTokenId, idcard, sucft[0][0][0]);
            }
          } else {
            loading.dismiss();
            this.general.mostrar_error('Intente de nuevo por favor', 0);
          }
        }, err => {
          console.log(err);
        });
      }
    }, err => {
      console.log('err');
      console.log(err);
    });
    console.log('fin');
  // } else {
  //   loading.dismiss();
  // }
}

deleteCard(loading, cardTokenId, idcard, appname) {
  
  this.fts.userDeleteCard(appname, this.username, '', cardTokenId).subscribe( (succ: any) => {
    console.log(JSON.stringify(succ));
    if (succ != null) {
      if (succ.apiStatus == 'Successful') {
        const info = { sel: '', tbl: 46, where: '3,' + idcard + ',"","","","",""' };
        // this.crud( info );
        this.crudService.crud( info ).subscribe(suc => {
          if (suc[0].ERROR != undefined) {
            this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + suc[0].ERROR + '",' +
            '"cards","cardDelete",' + info.tbl;
            this.crudService.crud(this.errsystem).subscribe(done => {
              console.log(done);
            }, err => {
              console.log(err);
            });
          } else {
            this.modalCtrl.dismiss({
            dismissed: true
          });
          this.getCardsByUser();
          }
        }, err => {
          console.log(err);
        });
        loading.dismiss();
      } else {
        loading.dismiss();
      }
    } else {
      this.general.mostrar_error('Tuvimos un inconveniente eliminando la tarjeta, por favor intente de nuevo', 0);
      loading.dismiss();
    }
  }, err => {
    console.log('err api');
    console.log(JSON.stringify(err));
    loading.dismiss();
  });
}

}

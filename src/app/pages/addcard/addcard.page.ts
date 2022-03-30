import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudService } from '../../services/crud.service';
import { NavController, ModalController, LoadingController } from '@ionic/angular';
import { GeneralComponent } from '../../components/general/general.component';
import { FtpaymentService } from '../../services/ftpayment.service';
import { VerifypassPage } from '../../modals/verifypass/verifypass.page';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';

// const impresa = environment.impresa;

@Component({
  selector: 'app-addcard',
  templateUrl: './addcard.page.html',
  styleUrls: ['./addcard.page.scss'],
})
export class AddcardPage implements OnInit {
  // tslint:disable: triple-equals
  // tslint:disable: max-line-length, no-unused-expression
  vopt = 1;
  @ViewChild('typecard', { read: ElementRef, static: false }) private typecard: ElementRef;
  @ViewChild('psscard', { read: ElementRef, static: false }) private psscard: ElementRef;
  numC = '0000 0000 0000 0000';
  v4num = '0000';
  titC = 'NOMBRE';
  expM = 'MM/YY';
  // expY = 'YY';
  cardTokenId: string;
  type: string;
  expDate: string;
  pssC: string;
  userid: string;
  username: string;
  cvv = '';
  impresa: string;
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private afAuth: AngularFireAuth,
               private crudService: CrudService,
               private navCtrl: NavController,
               public modalCtrl: ModalController,
               public general: GeneralComponent,
               private fts: FtpaymentService,
               public loadingController: LoadingController,
               private storage: StorageService ) { }

  async ngOnInit() {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      this.username = this.afAuth.auth.currentUser.email;
      this.impresa = (await this.storage.getItem('impresa')).value;
    }
  }

  actNumcard(event: any) {
    this.numC = '';
    this.numC += event.target.value;
    const vcard = this.numC.substring(-2, 2);
    this.v4num = this.numC.substring(15, 19);
    console.log( 'v4num' );
    console.log( this.v4num );
    if (vcard == '34' || vcard == '37') {
      console.log('American Express');
      this.type = 'amex';
      this.typecard.nativeElement.classList.add('amex');
      this.general.mostrar_alert('Lo sentimos! En este momento no procesamos pagos con tarjetas <b>American Express</b>');
    } else if (vcard == '51' || vcard == '52' || vcard == '53' || vcard == '54' || vcard == '55') {
      console.log('Mastercard');
      this.type = 'mastercard';
      this.typecard.nativeElement.classList.add('mastercard');
    } else if (vcard == '40' || vcard == '41' || vcard == '42' || vcard == '43' || vcard == '44' || vcard == '45'
     || vcard == '46' || vcard == '47' || vcard == '48' || vcard == '49') {
      console.log('Visa');
      this.type = 'visa';
      this.typecard.nativeElement.classList.add('visa');
    } else {
      this.type = undefined;
      this.typecard.nativeElement.classList.remove('visa');
      this.typecard.nativeElement.classList.remove('mastercard');
      this.typecard.nativeElement.classList.remove('amex');
    }

    console.log(this.numC);
    console.log('length');
    console.log(this.numC.length);
    console.log('substr');
  }

  actTitcard(event: any) {
    this.titC = '';
    this.titC += event.target.value;
    console.log(this.titC);
  }

  actExpdate(event: any) {
    this.expM = '';
    this.expM += event.target.value;
    console.log(this.expM);
  }

  // crud( data: any ) {
  //   this.crudService.crud( data ).subscribe(
  //     async res => {
  //       // insert error
  //       if (res[0].ERROR != undefined) {
  //         this.errsystem.where = '0,"Error en DB","' + this.username + '","' + res[0].ERROR + '","orderview","crud",' + data.table;
  //         this.crudService.crud(this.errsystem).subscribe(done => {
  //           console.log(done);
  //         }, err => {
  //           console.log(err);
  //         });
  //       } else {
  //         console.log('data');
  //         console.log(data);
  //         console.log('informacion de tarjeta actualizada');
  //         console.log( res );
  //         console.log( JSON.stringify(res) );
  //         this.modalCtrl.dismiss({
  //           dismissed: true
  //         });
  //         this.navCtrl.navigateBack('/cards');
  //         this.vaciaCampos();
  //         return true;
  //       }
  //     },
  //     err => {
  //       console.log( err );
  //     }
  //   );
  // }

  vaciaCampos() {
    this.numC = '';
    this.titC = '';
    this.cardTokenId = '';
  }

  async registerCard() {
    this.pssC = (await this.storage.getItem('passCache')).value;
    console.log('contraseña cache', this.pssC);
    if (this.afAuth.auth.currentUser != null) {
      const regCard = document.getElementById('regCard') as HTMLInputElement;
      regCard.disabled = true;
      this.cardTokenId = 'cardTokenId';
      this.cvv = this.psscard.nativeElement.value;
      console.log('cardTokenId vopt type cvv');
      console.log(this.cardTokenId, this.vopt, this.type, this.cvv);
      if (this.type == undefined) {
        this.general.mostrar_alert('El formato de tarjeta no es correcto, por favor verifica la información');
        regCard.disabled = false;
      } else {
        const providerId =  this.afAuth.auth.currentUser.providerData[0].providerId;
        if (providerId == 'google.com' || providerId == 'facebook.com') {
          const loading = await this.loadingController.create({
            message: 'Agregando tarjeta...'
          });
          await loading.present();
          const fecha = this.expM.split('/');
          const month = fecha[0];
          const year = '20' + fecha[1];
          const numcard: string = this.numC.replace(' ', '').replace(' ', '').replace(' ', '');
          
          console.log('pass');
          console.log(this.pssC);
          this.addingCard(loading, numcard, month, year);
        } else {
          this.presentModal(this.pssC);
          // this.storage.getItem('passCache').then((suc: any) => {
          //   console.log(suc);
          //   this.presentModal(suc);
          // }, (err: any) => {
          //   console.log(err);
          //   this.presentModal(err);
          // }).catch(errCatch => {
          //   console.log(errCatch);
          // });
        }
      }
    } else {
      this.general.mostrar_alert('Se necesita iniciar sesión para agregar una tarjeta');
      this.navCtrl.navigateBack('/signin');
    }
  }

  async presentModal(pass: string) {
    console.log('contraseña guardada');
    console.log((await this.storage.getItem('passCache')).value);    
    const fecha = this.expM.split('/');
    const month = fecha[0];
    const year = '20' + fecha[1];
    const numcard: string = this.numC.replace(' ', '').replace(' ', '').replace(' ', '');

    if (pass == null) {
      const modal = await this.modalCtrl.create({
        component: VerifypassPage,
        cssClass: 'modal-modal',
        componentProps: {
          getuser: this.username,
          passwd: pass
        }
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      console.log('data');
      console.log(JSON.stringify(data));
      console.log(data);
      const loading = await this.loadingController.create({
        message: 'Agregando tarjeta...'
      });
      await loading.present();
      if (data != undefined) {
        // this.pssC = (await this.storage.getItem('passCache')).value;
        this.pssC = data.pass;
        console.log('numcard');
        console.log(numcard);
        // this.addingCard(loading, numcard, month, year);
      } else {
        loading.dismiss();
      }
    } else {
      const loading = await this.loadingController.create({
        message: 'Agregando tarjeta...'
      });
      await loading.present();
      this.addingCard(loading, numcard, month, year);
    }
    
  }

  addingCard(loading: any, numcard: any, month: any, year: any) {
    console.log(this.impresa);
    this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
      // console.log(sucft);
      console.log(sucft[0][0][0], this.username, this.pssC, this.titC, numcard, month, year, this.cvv);
      this.fts.userIncludeCard(sucft[0][0][0], this.username, this.pssC, this.titC, numcard, month, year,
      this.cvv).subscribe((succ: any) => {
        console.log('include card');
        // console.log(JSON.stringify(succ));
        console.log(succ);
        const regCard = document.getElementById('regCard') as HTMLInputElement;
        if (succ == null) {
          loading.dismiss();
        } else {
          if (succ.apiStatus == 'Successful') {
            const info = { sel: '', tbl: 46, where: '1,0,"' + this.v4num + '","' + this.titC + '","' + succ.cardTokenId +
            '","' + this.userid + '","' + this.type + '"' };
            this.crudService.crud( info ).subscribe(card => {
              if (card[0].ERROR != undefined) {
                this.errsystem.where = '0,"Error en DB","' + this.username + '","' + card[0].ERROR + '","addcard",' +
                '"addingCard",' + info.tbl;
                this.crudService.crud(this.errsystem).subscribe(done => {
                  console.log(done);
                }, err => {
                  console.log(err);
                });
              } else {
                this.modalCtrl.dismiss({ dismissed: true });
                this.navCtrl.navigateBack('/cards');
              }
            });
            // this.crud( info );
            loading.dismiss();
          // tslint:disable-next-line: quotemark
          } else if (succ.apiStatus == 'Invalid User or Password') {
            loading.dismiss();
            this.general.mostrar_alert('Usuario o contraseña invalidos');
            regCard.disabled = false;
          } else if (succ.apiStatus == 'Too Many Cards Per User Max (\'3\')') {
            loading.dismiss();
            this.general.mostrar_alert('Se ha excedido el numero de tarjetas que puede registrar(Máximo 3 tarjetas)');
            regCard.disabled = false;
          } else if (succ.apiStatus == 'Max Users Same Card') {
            loading.dismiss();
            this.general.mostrar_alert('Esta tarjeta está asociada a muchos usuarios');
            regCard.disabled = false;
          } else {
            this.errsystem.where = '0,"' + succ.apiStatus + '","' + this.userid + '","' + succ + '","addcard","addingCard",0';
            this.crudService.crud(this.errsystem).subscribe(res => {
              console.log(res);
              loading.dismiss();
              this.general.mostrar_alert('Tuvimos un problema para guardar la información, revisa la información de la ' +
              'tarjeta e intenta de nuevo intenta de nuevo por favor.');
              regCard.disabled = false;
            }, err => {
              loading.dismiss();
              console.log(err);
            });
          }
        }
      });
    }, err => {
      console.log('err');
      console.log(err);
    });
  }

}

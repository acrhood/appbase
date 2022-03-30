import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { GeneralComponent } from '../../components/general/general.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';

@Component({
  selector: 'app-verifypass',
  templateUrl: './verifypass.page.html',
  styleUrls: ['./verifypass.page.scss'],
})
export class VerifypassPage implements OnInit {
  // tslint:disable: triple-equals
  @Input() getuser: string;
  @Input() passwd: string;
  mail: string;
  pass: string;
  uid: string;

  constructor( public modalCtrl: ModalController,
               private crud: CrudService,
               private general: GeneralComponent,
               private afauth: AngularFireAuth,
               private platform: Platform,
               public faio: FingerprintAIO ) { }

  ngOnInit() {
    this.mail = this.getuser;
    this.uid = this.afauth.auth.currentUser.uid;
    const fpaio = document.getElementById('fingerPrintAIO') as HTMLInputElement;
    console.log('passwd');
    console.log(this.passwd);
    if (this.passwd != undefined) {
      fpaio.classList.remove('ion-hide');
    } else {
      fpaio.classList.add('ion-hide');
    }
  }

  fingerPrint() {
    if (this.platform.is('hybrid')) {
      this.faio.isAvailable().then(is => {
        console.log('isAvailable');
        console.log(is);
        if (is == 'biometric') {
          this.faio.show({
            title: 'appExpress',
            description: 'Fingerprint AIO',
            disableBackup: true,
            cancelButtonTitle: 'Cancelar',
          }).then((result: any) => {
            console.log(result);
            if (result == 'biometric_success') {
              this.dismiss(this.passwd.substring(0, this.passwd.length - 1));
            }
          }).catch((error: any) => {
            console.log(error);
          });
        }
      }).catch(err => {
        console.log('err isAvailable');
        console.log(err);
      });
    } else {
      console.log('web');
    }
  }

  login() {
    let data = {};
    console.log(this.mail, this.pass);
    if (this.pass != '') {
      console.log('web');
      data = { sel: '', tbl: '47', where: '"' + this.mail + '","' + this.pass + '"' };
      this.crud.crud( data ).subscribe(res => {
        console.log(res);
        console.log(res[0].length);
        if (res[0].length == 2) {
          console.log(res[0]);
          this.general.mostrar_error(res[0][0], 0);
        } else {
          console.log('guardando');
          this.dismiss(this.pass);
        }
      }, err => {
        console.log(err);
      });
    } else {
      this.general.mostrar_error('Contraseña requerida', 0);
    }
  }

  dismiss(pass: string) {
    this.modalCtrl.dismiss({
      dismissed: true,
      pass
    });
  }

}

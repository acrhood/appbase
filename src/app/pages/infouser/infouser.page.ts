import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastController, ModalController, LoadingController } from '@ionic/angular';
import { AlertPage } from '../../modals/alert/alert.page';
import { GeneralComponent } from '../../components/general/general.component';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-infouser',
  templateUrl: './infouser.page.html',
  styleUrls: ['./infouser.page.scss'],
})
export class InfouserPage implements OnInit {
  // tslint:disable: triple-equals
  verified: any;
  userid: string;
  nameusr: string;
  mailusr: string;
  phoneusr: string;
  cedusr: number;
  piusr: number;
  tname: any;
  tmail: any;
  tphone: any;
  nusr: any;
  musr: any;
  pusr: any;
  cusr: any;
  pinusr: any;
  impresa: string;
  listabancos: any;
  selectbank: any;
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private afAuth: AngularFireAuth,
               private crudService: CrudService,
               private toastCtrl: ToastController,
               private modalCtrl: ModalController,
               private general: GeneralComponent,
               private loadingCtrl: LoadingController,
               private storage: StorageService ) { }

  async ngOnInit() {
    this.userid = this.afAuth.auth.currentUser.uid;
    this.impresa = (await this.storage.getItem('impresa')).value;
    this.getBancosinpe();
    const datos = { sel: '', tbl: 8, where: '"' + this.userid + '"' };
    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...'
    });
    await loading.present();
    this.crudService.crud( datos ).subscribe(res => {
      console.log('res', res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","infouser","ngOnInit",' + datos.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.nameusr = res[0][0][1];
        this.mailusr = res[0][0][3];
        this.phoneusr = res[0][0][4];
        this.cedusr = res[0][0][5];
        this.pinusr = res[0][0][6];
        this.selectbank = res[0][0][7];
        this.verified = this.afAuth.auth.currentUser.emailVerified;
        if (!this.verified) {
          document.getElementById('verified').classList.remove('ion-hide');
        }
      }
      loading.dismiss();
    }, err => {
      console.log(err);
      loading.dismiss();
    });
  }

  doRefresh(event: any) {
    console.log('Begin async operation');
    this.ngOnInit();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  actInfo() {
    console.log(this.nusr, this.pusr, this.userid, this.cusr,this.selectbank);
    const datos = { sel: '', tbl: 6, where: '2,0,"' + this.nusr + '","","",' +
    this.impresa + ',"' + this.pusr + '","' + this.userid + '",' + this.cusr + ',0,' + this.piusr + ',' + this.selectbank };
    this.crudService.crud( datos ).subscribe(
      async (res: any) => {
        console.log(res);
        // insert error
        if (res[0].ERROR != undefined) {
          this.general.mostrar_error('El teléfono debe contener solo números', 0 );
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","infouser","actInfo",' + datos.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        } else {
          const toast = await this.toastCtrl.create({
            message: 'Información guardada correctamente',
            duration: 2000
          });
          toast.present();
        }
      }, err => {
        console.log(err);
      }
    );
  }

  async sendEmailVerification() {
    const modal = await this.modalCtrl.create({
      component: AlertPage,
      componentProps: {
        error: 'Enviar correo'
      },
      cssClass: 'alert-modal'

    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    if (data != undefined) {
      this.afAuth.auth.currentUser.sendEmailVerification();
    }

  }

  async onChange( b: any ) {
    this.selectbank = b.target.value == '' ? 0 : b.target.value;
    console.log('BANK', this.selectbank);
  }

  getBancosinpe() {
    this.crudService.crud({ sel: '*', tbl: 119, where: 'id > 0' }).subscribe(data => {
      this.listabancos = data[0];
      console.log('data sinpe:', this.listabancos);
    });
  }
}

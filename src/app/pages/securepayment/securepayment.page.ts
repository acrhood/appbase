import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { CrudService } from '../../services/crud.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-securepayment',
  templateUrl: './securepayment.page.html',
  styleUrls: ['./securepayment.page.scss'],
})
export class SecurepaymentPage implements OnInit {
  // tslint:disable: triple-equals
  @ViewChild('xpin1', {static: false}) xpin1: any;
  @ViewChild('xpin2', {static: false}) xpin2: any;
  @ViewChild('xpin3', {static: false}) xpin3: any;
  @ViewChild('xpin4', {static: false}) xpin4: any;
  pin1: string;
  pin2: string;
  pin3: string;
  pin4: string;
  userid: string;
  @Input() ordenesactuales: number;
  @Input() maximoordenes: number;
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private loading: LoadingController, private crudService: CrudService,
               private modal: ModalController, public afAuth: AngularFireAuth ) { }

  ngOnInit() {
    setTimeout(() => {
      this.xpin1.setFocus();
    }, 500);
    this.userid = this.afAuth.auth.currentUser.uid;
    console.log('ordenes actuales y maximo ordenes');
    console.log(this.ordenesactuales, this.maximoordenes);
    if (Number(this.ordenesactuales) > Number(this.maximoordenes)) {
      document.getElementById('error_maxordenes').classList.remove('ion-hide');
    } else {
      document.getElementById('error_maxordenes').classList.add('ion-hide');
    }
  }

  closeModal() {
    this.modal.dismiss();
  }

  async validateKey(vid: number) {
    switch (vid) {
      case 1:
        this.xpin2.setFocus();
        break;
      case 2:
        this.xpin3.setFocus();
        break;
      case 3:
        this.xpin4.setFocus();
        break;
      case 4:
        // validar
        const loading = await this.loading.create({
          message: 'Validando PIN'
        });
        await loading.present();
        const pin = this.pin1 + '' + this.pin2 + '' + this.pin3 + '' + this.pin4;
        console.log(this.userid);
        this.crudService.crud({ sel: 'pin', tbl: 5, where: 'uid = "' + this.userid + '"' }).subscribe(suc => {
          console.log(suc);
          // insert error
          if (suc[0].ERROR != undefined) {
            this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + suc[0].ERROR + '","securepayment","validateKey",5';
            this.crudService.crud(this.errsystem).subscribe(done => {
              console.log(done);
            }, err => {
              console.log(err);
            });
          } else {
            console.log(suc + ' ' + pin);
            if (suc[0][0][0] == pin) {
              document.getElementById('error_pin').classList.add('ion-hide');
              loading.dismiss();
              this.modal.dismiss({
                dismissed: true,
                validado: 1
              });
            } else {
              this.pin1 = '';
              this.pin2 = '';
              this.pin3 = '';
              this.pin4 = '';
              document.getElementById('error_pin').classList.remove('ion-hide');
              loading.dismiss();
              this.xpin1.setFocus();
            }
          }
        }, err => {
          console.log(err);
        });
        break;
    }
  }

}

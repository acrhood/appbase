import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { CrudService } from '../../services/crud.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { GeneralComponent } from '../../components/general/general.component';
import { FtpaymentService } from '../../services/ftpayment.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  // tslint:disable: triple-equals
  // tslint:disable: max-line-length
  name: string;
  pass: string;
  email: string;
  phone: string;
  cedula: number;
  pin: number;
  userid: string;
  isChecked = false;
  isSinpe = false;
  selectbank: any;
  impresa: number;
  listabancos: any;
  errsystem = { sel: '', tbl: 80, where: '' };
  @ViewChild('xname', {static: false}) xname: any;
  @ViewChild('xemail', {static: false}) xemail: any;
  @ViewChild('xpass', {static: false}) xpass: any;
  @ViewChild('xphone', {static: false}) xphone: any;
  @ViewChild('xcedula', {static: false}) xcedula: any;
  @ViewChild('xpin', {static: false}) xpin: any;
  constructor( private loadingCtrl: LoadingController,
               private navCtrl: NavController,
               private authService: AuthService,
               private afAuth: AngularFireAuth,
               private crudService: CrudService,
               private general: GeneralComponent,
               private fts: FtpaymentService,
               private storage: StorageService,
               public actionSheetController: ActionSheetController) { }

  async ngOnInit() {
    // this.impresa = (await this.storage.getItem('impresa')).value;
    this.impresa = environment.madreSucursal;
    this.getBancosinpe();
  }

  async registerUser() {
    console.log(this.name, this.email, this.pass, this.phone, this.cedula, this.selectbank);
    const loading = await this.loadingCtrl.create({
      message: 'Creando usuario..',
      duration: 2000
    });
    await loading.present();
    const btnapp = document.getElementById('reg') as HTMLInputElement;
    btnapp.disabled = true;
    const valCreateUSer = this.validateRegister();
    console.log('validando');
    console.log(valCreateUSer);
    if ( valCreateUSer == false ) {
      console.log('creando usuario');
      this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
        // insert error
        if (sucft[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.email + '","' + sucft[0].ERROR + '","signup","registerUser",96';
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        } else {
          this.fts.createUser(sucft[0][0][0], this.email, this.email, this.email, '', this.email.replace(/\s+/g, ''), this.phone)
          .subscribe(async (succ: any) => {
            console.log('succ api');
            console.log(JSON.stringify(succ));
            console.log(succ);
            if (succ != null) {
              console.log(succ.apiStatus)
              switch (succ.apiStatus) {
                case 'DuplicateUserName':
                  loading.dismiss();
                  this.general.mostrar_error('Este usuario ya había sido creado anteriormente', 0);
                  btnapp.disabled = false;
                  break;
                case 'Invalid Mail Format':
                  loading.dismiss();
                  this.general.mostrar_error('Formato del correo introducido es inválido. (Ej: nombre@gmail.com)', 0);
                  btnapp.disabled = false;
                  break;
                // case 'InvalidPassword':
                //   loading.dismiss();
                //   this.general.mostrar_error('La contraseña debe tener mínimo 8 caracteres. Obligatorio debe' +
                //   'contener letras, números y caracteres especiales como $, &, @, /, _, ., (, ), ‘, -', 0);
                //   break;
                case 'Invalid Phone Format':
                  loading.dismiss();
                  this.general.mostrar_error('Formato de teléfono inválido', 0);
                  btnapp.disabled = false;
                  break;
                case 'Success':
                  this.authService.signUpWithEmail(this.email.replace(/\s+/g, ''), this.pass).then(res => {
                    console.log(res);
                    // loading.dismiss();
                    this.storage.setItem('passCache', this.pass).then(suc => {
                      console.log('suc', suc);
                    }, rej => {
                      console.log('rej', rej);
                    }).catch(errCatch => {
                      console.log('errCatch', errCatch);
                    });
                    this.phone = this.phone == undefined ? '' : this.phone.replace(/\s+/g, '').replace('-', '');
                    this.cedula = this.cedula == undefined ? 0 : this.cedula;
                    this.userid = res.user.uid;
                    this.selectbank = this.selectbank == undefined ? 0 : this.selectbank;
                    const data = { sel: '', tbl: 6, where: '1,0,"' + this.name + '","' + this.email + '","' + this.pass +
                    '",' + this.impresa + ',"' + this.phone + '","' + this.userid + '",' + this.cedula + ',2,' + this.pin + ',' + this.selectbank };
                    console.log(data);
                    this.crudService.crud( data ).subscribe(result => {
                      console.log('result database');
                      console.log(result);
                      // insert error
                      if (result[0].ERROR != undefined) {
                        this.errsystem.where = '0,"Error en DB","' + this.email + '","' + result[0].ERROR + '",' +
                        '"signup","registerUser",' + data.tbl;
                        this.crudService.crud(this.errsystem).subscribe(done => {
                          console.log(done);
                          btnapp.disabled = false;
                        }, err => {
                          console.log(err);
                        });
                      } else {
                        this.afAuth.auth.currentUser.sendEmailVerification();
                        this.afAuth.auth.currentUser.updateProfile({
                          displayName: this.name
                        }).then(ready => {
                          console.log('ready');
                          console.log(ready);
                          console.log(res.additionalUserInfo.isNewUser);
                          loading.dismiss();
                          if (res.additionalUserInfo.isNewUser == true) {
                            console.log('go session');
                            this.navCtrl.navigateBack('/sessionstatus');
                          }
                        }).catch( noready => {
                          console.log('noready');
                          console.log(noready);
                          loading.dismiss();
                        });
                      }
                    }, error => {
                      console.log(error);
                    });
                  }).catch(async error => {
                    console.log(error);
                    console.log(error.code);
                    if ( error.code == 'auth/invalid-email' ) {
                      loading.dismiss();
                      this.general.mostrar_error('Correo inválido', 0);
                      btnapp.disabled = false;
                    } else if (error.code == 'auth/weak-password') {
                      loading.dismiss();
                      this.general.mostrar_error('Contraseña inválida', 0);
                      btnapp.disabled = false;
                    } else if (error.code == 'auth/email-already-in-use') {
                      loading.dismiss();
                      this.general.mostrar_error('Este usuario ya ha sido registrado', 0);
                      btnapp.disabled = false;
                    } else {
                      this.errsystem.where = '0,"' + error.code + '","' + this.email + '","' + error.message + '",' +
                      '"signup","registerUser",0';
                      this.crudService.crud(this.errsystem).subscribe(res => {
                        loading.dismiss();
                        console.log(res);
                        btnapp.disabled = false;
                      }, err => {
                        loading.dismiss();
                        console.log(err);
                      });
                    }
                  });
                  break;
                default:
                  this.errsystem.where = '0,"' + succ.apiStatus + '","' + this.email + '","' + succ + '","signup","registerUser",0';
                  this.crudService.crud(this.errsystem).subscribe(res => {
                    loading.dismiss();
                    console.log(res);
                    btnapp.disabled = false;
                  }, err => {
                    loading.dismiss();
                    console.log(err);
                  });
                  break;
              }
            } else {
              loading.dismiss();
              this.general.mostrar_error('Tuvimos un inconveniente para registrar este usuario, por favor intentelo de nuevo', 0);
              btnapp.disabled = false;
            }
          }, (err: any) => {
            console.log(err);
            if (err.status == 0) {
              loading.dismiss();
              this.general.mostrar_error('Tuvimos un inconveniente para registrar este usuario, por favor intentelo de nuevo', 0);
              btnapp.disabled = false;
            } else {
              loading.dismiss();
              this.general.mostrar_error('', 0);
              btnapp.disabled = false;
            }
          });
        }
      }, err => {
        console.log('err');
        console.log(err);
      });
    } else {
      loading.dismiss();
      btnapp.disabled = false;
      this.general.mostrar_error(String(valCreateUSer), 0);
    }
  }

  validateRegister() {
    if (this.name == undefined || this.name == '') {
      this.xname.setFocus();
      return 'Nombre requerido';
    }

    if (this.email == undefined || this.email == '') {
      this.xemail.setFocus();
      return 'Correo requerido';
    }

    if (this.pass == undefined || this.pass == '') {
      this.xpass.setFocus();
      return 'Contraseña requerido';
    }

    if (this.phone == undefined || this.phone == '') {
      this.xphone.setFocus();
      return 'Teléfono requerido';
    }

    // if (this.cedula == undefined) {
    //   this.xphone.setFocus();
    //   return 'Cédula requerida';
    // }

    if (String(this.cedula).length > 0 && String(this.cedula).length < 9) {
      this.xcedula.setFocus();
      return 'La cédula debe contener mínimo 9 dígitos';
    }

    if (this.pin == undefined || String(this.pin).length == 0) {
      this.xpin.setFocus();
      return 'PIN requerido';
    }

    if (String(this.pin).length < 4) {
      this.xpin.setFocus();
      return 'PIN debe ser de 4 degitos';
    }

    if (this.isChecked == true) {
      return 'Debe aceptar los Términos & Condiciones y Políticas de Privacidad';
    }

    return false;
  }

  addValue( e: any ) {
    this.isChecked = e.currentTarget.checked;
    console.log('isChecked', this.isChecked);
  }

  async onChange( b: any ) {
    this.selectbank = b.target.value == '' ? 0 : b.target.value;
    console.log('BANK', this.selectbank);
    if ( this.selectbank == 0 ) {
      document.getElementById('bankopt').classList.add('ion-hide');
    }
  }

  getBancosinpe() {
    this.crudService.crud({ sel: '*', tbl: 119, where: 'id > 0' }).subscribe(data => {
      this.listabancos = data[0];
      console.log('data sinpe:', this.listabancos);
    });
  }

  validateNum( num: any ) {
    const telephone = num.currentTarget.value;
    if ( telephone != '' ) {
      document.getElementById('bankopt').classList.remove('ion-hide');
    } else {
      document.getElementById('bankopt').classList.add('ion-hide');
    }
  }

}

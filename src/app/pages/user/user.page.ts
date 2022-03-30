import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { CrudService } from '../../services/crud.service';
import * as firebase from 'firebase';
import { StorageService } from 'src/app/services/storage.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { GeneralComponent } from '../../components/general/general.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  // tslint:disable: triple-equals
  user: boolean;
  nameusr: string;
  mailusr: string;
  userEmail: string;
  tipoUser: number;

  constructor( private crudService: CrudService,
               private navCtrl: NavController,
               public platform: Platform,
               private authService: AuthService,
               private storage: StorageService,
               private afAuth: AngularFireAuth,
               private general: GeneralComponent ) {
                firebase.auth().onAuthStateChanged((user) => {
                  if (user) {
                    console.log(user.uid);
                    const data = { sel: '', tbl: 8, where: '"' + user.uid + '"' };
                    this.crudService.crud( data ).subscribe(res => {
                      console.log(res);
                      this.nameusr = res[0][0][1];
                      this.tipoUser = res[0][0][2];
                      this.mailusr = res[0][0][3];
                      // const reportes = document.getElementById('reports') as HTMLInputElement;
                      // console.log(res[0][0][2]);
                      // if (res[0][0][2] == 1) {
                      //   reportes.classList.remove('ion-hide');
                      // } else {
                      //   reportes.classList.add('ion-hide');
                      // }
                    }, err => {
                      console.log(err);
                    });
                  }
                });
               }

  ngOnInit() {
    console.log(this.afAuth.auth.currentUser);
    if (this.afAuth.auth.currentUser != null) {
      this.user = true;
    } else {
      this.user = false;
      this.general.mostrar_alert('Para ver el historial de ordenes debes iniciar sesión');
      this.navCtrl.navigateBack('/signin');
    }
  }

  async logout() {
    console.log('Logout');
    this.storage.clear();
    this.authService.signOut().then((res: any) => {
      console.log(res);
      if (this.platform.is('hybrid')) {
        console.log('storage');
      }
      this.navCtrl.navigateBack('/signin');
    });
  }

}

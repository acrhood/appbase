import { Component, OnInit } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
})
export class SecurityPage implements OnInit {
  email: string;

  constructor( private toastCtrl: ToastController,
               private navCtrl: NavController,
               private  auth: AuthService ) {
                if ( firebase.auth().currentUser != null ) {
                  this.email = firebase.auth().currentUser.email;
                }
               }

  ngOnInit() { }

  doRefresh(event: any) {
    console.log('Begin async operation');
    this.ngOnInit();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  resetPass() {
    firebase.auth().sendPasswordResetEmail( this.email.replace(/\s+/g, '') ).then( async () => {
      const toast = await this.toastCtrl.create({
        message: 'Cambio de contraseña enviada a su correo',
        duration: 2000,
        position: 'top'
      });
      toast.present();
      this.auth.signOut();
      this.navCtrl.navigateBack('/signin');
    });
  }

}

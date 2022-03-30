import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { Facebook } from '@ionic-native/facebook/ngx';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private afAuth: AngularFireAuth, private fb: Facebook ) { }

  // Registro con correo
  signUpWithEmail(email: any, pass: any): Promise<firebase.auth.UserCredential> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, pass);
  }

  // Ingreso con email
  signInWithEmail(email: any, pass: any): Promise<firebase.auth.UserCredential> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, pass);
  }

  // Ingreso con Google
  signInWithGoogle(): Promise<firebase.auth.UserCredential> {
    const provider: firebase.auth.GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  // Ingreso con Facebook web
  signInWithFacebookWeb(): Promise<firebase.auth.UserCredential> {
    console.log('auth facebook');
    // const provider: firebase.auth.FacebookAuthProvider = new firebase.auth.FacebookAuthProvider();
    return this.afAuth.auth.signInWithPopup( new firebase.auth.FacebookAuthProvider() );
  }

  // Ingreso con Facebook app
  signInWithFacebookApp() {
    return this.fb.login(['public_profile', 'email']);
  }

  signInWithApple(appleResponse: any) {
    console.log('appleResponse');
    console.log(appleResponse.identityToken);
    const provider = new firebase.auth.OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: appleResponse.identityToken
    });
    return this.afAuth.auth.signInWithCredential(credential);
  }

  // Finalizar sesión
  signOut(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

}

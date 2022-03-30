import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  // tslint:disable: triple-equals
  newpass = '';

  constructor( private afAuth: AngularFireAuth,
               private crudService: CrudService ) { }

  ngOnInit() {
    console.log(this.afAuth.auth.currentUser.uid);
    const data = { sel: 'idtipo', tbl: 5, where: 'uid = "' + this.afAuth.auth.currentUser.uid + '"' };
    this.crudService.crud( data ).subscribe((succ: any) => {
      console.log('succ');
      console.log(succ);
      if (succ[0][0][0] == 1) {
        const subs = document.getElementById('subs') as HTMLInputElement;
        subs.style.display = 'block';
      }
    }, (err: any) => {
      console.log('error');
      console.log(err);
    });
  }

}

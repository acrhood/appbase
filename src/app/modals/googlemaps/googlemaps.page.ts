import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { CrudService } from 'src/app/services/crud.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ModalController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-googlemaps',
  templateUrl: './googlemaps.page.html',
  styleUrls: ['./googlemaps.page.scss'],
})
export class GooglemapsPage implements OnInit {
  // tslint:disable: triple-equals
  map: any;
  marker: any;
  userid: any;
  mapOptions: any;
  @Input() vid: number;
  origen = { lat: null, lng: null };
  errsystem = { sel: '', tbl: 80, where: '' };
  markerOptions: any = { position: null, map: null };
  @ViewChild('Map', {static: false}) mapElement: ElementRef;

  constructor( private crud: CrudService, private afAuth: AngularFireAuth, private modalCtrl: ModalController ) { }

  ngOnInit() {
    this.userid = this.afAuth.auth.currentUser.uid;
    this.showMap();
  }

  showMap() {
    console.log('showMap funcion');
    this.crud.crud({ sel: '', tbl: 17, where: this.vid }).subscribe(suc => {
      // insert error
      if (suc[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + suc[0].ERROR + '"';
        this.crud.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.origen = { lat: parseFloat(suc[0][0][5]), lng: parseFloat(suc[0][0][6]) };
        this.mapOptions = { center: this.origen, zoom: 18, mapTypeControl: false };
        console.log( JSON.stringify(this.mapOptions) );
        console.log('start timeout');
        this.map = new google.maps.Map( this.mapElement.nativeElement, this.mapOptions );
        console.log('marker options');
        this.markerOptions.position = this.origen;
        this.markerOptions.map = this.map;
        console.log(this.markerOptions);
        this.marker = new google.maps.Marker(this.markerOptions);
      }
    });
    // get coords origen
  }

  goBack() {
    this.modalCtrl.dismiss();
  }

}

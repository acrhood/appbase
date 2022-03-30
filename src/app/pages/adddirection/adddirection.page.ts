import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudService } from '../../services/crud.service';
import { PickerController, NavController, ModalController, LoadingController } from '@ionic/angular';
import { GeneralComponent } from '../../components/general/general.component';
import { Plugins } from '@capacitor/core';
import { StorageService } from '../../services/storage.service';
// import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
const { Geolocation } = Plugins;
declare var google: any;

@Component({
  selector: 'app-adddirection',
  templateUrl: './adddirection.page.html',
  styleUrls: ['./adddirection.page.scss'],
})
export class AdddirectionPage implements OnInit {
  // tslint:disable: triple-equals
  // tslint:disable: new-parens
  maxrango: any;
  direccion: string;
  otrasenas: string;
  phone: string;
  userid: string;
  subsDirecciones: Subscription;
  listaDirecciones: any;
  latitud: any;
  longitud: any;
  kms: any;
  dir1: any;
  @ViewChild('Map', {static: false}) mapElement: ElementRef;
  map: any;
  markerOptions: any = { position: null, map: null };
  mapOptions: any;
  marker: any;
  location = { lat: null, lng: null };
  newlat: any;
  newlng: any;
  origen = { lat: null, lng: null };
  destino = { lat: null, lng: null};
  directionsService: any;
  ubication: string;
  impresa: string;
  errsystem = { sel: '', tbl: 80, where: '' };
  @Input() viddir: number;
  @Input() vopt = 1;
  @Input() vdireccion: string;
  @Input() votrasenas: string;
  @Input() vphone: string;
  @Input() nlat: any;
  @Input() nlng: any;
  @Input() nkms: string;
  @Input() tipo: any;

  constructor( private afAuth: AngularFireAuth,
               private general: GeneralComponent,
               private crudService: CrudService,
               public pickerCtrl: PickerController,
               private navCtrl: NavController,
               /*private geolocation: Geolocation,*/
               /*private nativeGeocoder: NativeGeocoder,*/
               public modalCtrl: ModalController,
               private loadingCtrl: LoadingController,
               private storage: StorageService ) { this.directionsService = new google.maps.DirectionsService; }

  ngOnInit() { }

  async ionViewDidEnter() {
    console.log('vididr', this.viddir);
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      this.impresa = (await this.storage.getItem('impresa')).value;
    }
    if (this.nlat == undefined && this.nlng == undefined) {
      const coordinates = await Geolocation.getCurrentPosition();
      console.log('Current', coordinates);
      console.log('latitud', coordinates.coords.latitude);
      console.log('longitud', coordinates.coords.longitude);
      this.location.lat = coordinates.coords.latitude;
      this.location.lng = coordinates.coords.longitude;
      this.newlat = coordinates.coords.latitude;
      this.newlng = coordinates.coords.longitude;
      this.destino = this.location;
      this.showMap(this.location);
    } else {
      if (this.viddir != undefined) {
        this.direccion = this.vdireccion;
        this.otrasenas = this.votrasenas;
        this.phone = this.vphone;
        this.destino = { lat: parseFloat(this.nlat), lng: parseFloat(this.nlng) };
        if (this.nlat != undefined && this.nlng != undefined) {
          this.showMap({ lat: parseFloat(this.nlat), lng: parseFloat(this.nlng) });
        }
      }
    }
  }

  showMap( location: any ) {
    console.log('showMap funcion');
    console.log(JSON.stringify(location));
    this.mapOptions = { center: location, zoom: 18, mapTypeControl: false };
    console.log( JSON.stringify(this.mapOptions) );
    console.log('start timeout');
    this.map = new google.maps.Map( this.mapElement.nativeElement, this.mapOptions );
    console.log('marker options');
    this.markerOptions.position = location;
    this.markerOptions.map = this.map;
    this.markerOptions.draggable = true;
    this.markerOptions.icon = 'https://pipecr.com/images/marker.gif',
    console.log(this.markerOptions);
    this.marker = new google.maps.Marker(this.markerOptions);

    // get coords origen
    this.crudService.crud({ sel: '', tbl: 99, where: this.impresa }).subscribe(suc => {
      console.log('suc origen');
      console.log(suc);
      // insert error
      if (suc[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + suc[0].ERROR + '","adddirection","showMap",99';
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      }
      this.origen = { lat: parseFloat(suc[0][0][15]), lng: parseFloat(suc[0][0][16]) };
      console.log(this.origen);

      // draw circle
      // const circle = new google.maps.Circle({
      //   strokeColor: '#808080',
      //   strokeOpacity: 0.4,
      //   strokeWeight: 2,
      //   fillColor: '#808080',
      //   fillOpacity: 0.2,
      //   map: this.map,
      //   center: this.origen,
      //   radius: parseFloat(suc[0][0][22])
      // });

      google.maps.event.addListener( this.marker, 'dragend', (resp: any) => {
        console.log(resp);
        this.newlat = resp.latLng.lat();
        this.newlng = resp.latLng.lng();
        const newdestino = { lat: parseFloat(this.newlat), lng: parseFloat(this.newlng) };
        this.calculateAndDisplayRoute( newdestino );
      });
      this.calculateAndDisplayRoute(0);
    }, err => {
      console.log('err origen');
      console.log(err);
    });
  }

  geocoder() {
    // console.log('geocoder');
    // let pass = 0;
    // const options: NativeGeocoderOptions = { useLocale: true, maxResults: 5 };
    // this.kms = this.kms.replace(',', '.');
    // if (this.newlng == undefined && this.newlng == undefined) {
    //   this.newlat = this.location.lat;
    //   this.newlng = this.location.lng;
    // }
    // console.log('lat: ' + this.newlat + ', lng: ' + this.newlng);
    // this.nativeGeocoder.reverseGeocode(this.newlat, this.newlng, options).then((result: NativeGeocoderResult[]) => {
    //   console.log('native geocode');
    //   console.log(JSON.stringify(result));
    //   console.log(result.length);
    //   result.forEach((suc: any) => {
    //     console.log('resultados');
    //     if (suc.subAdministrativeArea == 'Grecia') {
    //       pass = 1;
    //       console.log(suc.subAdministrativeArea);
    //       return false;
    //     }
    //   });
    //   if (pass == 1) {
    //     console.log('locality: ' + result[0].locality + 'thoroughfare: ' + result[0].thoroughfare + ' subAdministrativeArea: ' +
    //     result[0].subAdministrativeArea + ' administrativeArea: ' + result[0].administrativeArea.substring(13));
    //     this.ubication = result[0].subAdministrativeArea;
    //     if (result[0].thoroughfare != '') {
    //       this.otrasenas = result[0].thoroughfare + ', ';
    //     }
    //     if (result[0].subAdministrativeArea != '') {
    //       this.otrasenas = this.otrasenas + ', ' + result[0].subAdministrativeArea + ', ';
    //     }
    //     if (result[0].locality != '') {
    //       this.otrasenas = this.otrasenas + result[0].locality + ', ';
    //     }
    //     if (result[0].administrativeArea.substring(13) != '') {
    //       this.otrasenas = this.otrasenas + result[0].administrativeArea.substring(13);
    //     }
    //   } else {
    //     this.otrasenas = '';
    //     this.general.mostrar_alert('Entregas solamente en Grecia');
    //   }
    // }, error => {
    //   console.error('error then geocode');
    //   console.error(JSON.stringify(error));
    // }).catch((error: any) => {
    //   console.error('error catch geocode');
    //   console.error(error);
    // });
  }

  calculateAndDisplayRoute( newdestino: any ) {
    console.log('newdestino', newdestino);
    if (newdestino != 0) {
      this.destino = newdestino;
    }
    console.log('direction service');
    console.log(JSON.stringify(this.origen));
    console.log(JSON.stringify(this.destino));
    this.directionsService.route({
      origin: this.origen,
      destination: this.destino,
      travelMode: 'DRIVING'
    }, (response: any, status: any) => {
      console.log( 'status', status );
      const data = { sel: '', tbl: 99, where: this.impresa };
      this.crudService.crud( data ).subscribe(maxdist => {
        console.log('maxdist');
        console.log(maxdist[0][0][22]);
        this.maxrango = maxdist[0][0][22]/1000;
        this.kms = response.routes[0].legs[0].distance.text.substr(0, response.routes[0].legs[0].distance.text.indexOf(' '));
        console.log('kms');
        console.log( this.kms );
        const mkm = Number(this.kms.replace(',', '.')) * 1000;
        console.log('mkm:', mkm);
        if (mkm > maxdist[0][0][22]) {
          this.general.mostrar_error('Aún no ofrecemos el servicio express a esta dirección, el máximo de entrega es de ' + this.maxrango + 'km', 0);
        }
      }, err => {
        console.log('err max distance');
        console.log(err);
      });
      if (status === 'OK') {
        console.log('response');
        // this.geocoder();
        // console.log( JSON.stringify(response) );
        // this.directionsDisplay.setDirections(response);
      } else {
        console.log('Directions request failed due to ' + status);
      }
    });
  }

  openMap() {
    if (this.tipo != undefined) {
      this.modalCtrl.dismiss();
    }
    this.navCtrl.navigateBack('/googlemaps');
  }

  getDireccionById( vid: any ) {
    const data = {
      sel: '',
      tbl: 17,
      where: vid
    };

    this.crudService.crud( data ).subscribe(
      res => {
        // insert error
        if (res[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
          '"adddirection","getdireccionById",' + data.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        }
        this.direccion = res[0][4];
        this.otrasenas = res[0][5];
        this.phone = res[0][6];
      },
      err => {
        console.log( err );
      }
    );
  }

  regDireccion() {
    if (this.afAuth.auth.currentUser != null) {
      const regDir = document.getElementById('regDir') as HTMLInputElement;
      regDir.disabled = true;
      console.log('lat lng opt');
      console.log('data registro');
      // console.log(this.vopt + ',' + this.viddir + ',"' + this.direccion + '","' + this.otrasenas + '","' +
      // this.phone + '","' + this.userid + '","' + this.nlat + '","' + this.nlng + '",' + this.nkms);
      console.log(this.newlat, this.newlng, this.nlat, this.nlng);
      this.crudService.crud({ sel: '', tbl: 99, where: this.impresa }).subscribe(async res => {
        console.log(res);
        console.log(parseFloat(this.kms) * 1000, res[0][0][22]);
        // if ((this.kms * 1000) <= res[0][0][22]) { // calcular el diametro entre pira y la distancia asignada para validar
        if (this.viddir != undefined && this.newlng != null && this.newlng != null) {
            this.nlat = this.newlat;
            this.nlng = this.newlng;
            this.nkms = this.kms;
          }
        const loading = await this.loadingCtrl.create({
            message: 'Guardando dirección...'
          });
        await loading.present();
        const valdirecc = this.validateDirection();
        if (!valdirecc) {
          const mkm = Number(this.kms.replace(',', '.') * 1000);
          if (mkm <= res[0][0][22]) {
            console.log('vopt', this.vopt);
            if (this.vopt == 1) {
              const data = { sel: '', tbl: 15,
                where: '1,0,"' + this.direccion + '","' + this.otrasenas + '","' + this.phone + '","' + this.userid + '","' +
                this.newlat + '","' + this.newlng + '",' + this.kms.replace(',', '.')
              };
              console.log('data add');
              console.log(JSON.stringify(data));
              this.crudService.crud( data ).subscribe(suc => {
                console.log('result add');
                console.log(JSON.stringify(suc));
                if (suc[0].ERROR != undefined) {
                  this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + suc[0].ERROR + '",' +
                  '"adddirection","regDireccion",' + data.tbl;
                  this.crudService.crud(this.errsystem).subscribe(done => {
                    console.log(done);
                  }, err => {
                    console.log(err);
                  });
                } else {
                  if (this.tipo == 2) {
                    this.modalCtrl.dismiss({ dismissed: true });
                  } else {
                    this.navCtrl.navigateBack('/directions');
                  }
                }
              }, err => {
                console.log(err);
              });
              loading.dismiss();
            } else if ( this.vopt == 2 ) {
              const data = { sel: '', tbl: 15,
                where: '2,' + this.viddir + ',"' + this.direccion + '","' + this.otrasenas + '","' +
                this.phone + '","' + this.userid + '","' + this.nlat + '","' + this.nlng + '",' + this.kms.replace(',', '.')
              };
              console.log(data);
              this.crudService.crud( data ).subscribe(suc => {
                console.log(suc);
                if (suc[0].ERROR != undefined) {
                  this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + suc[0].ERROR + '",' +
                  '"adddirection","regDireccion",' + data.tbl;
                  this.crudService.crud(this.errsystem).subscribe(done => {
                    console.log(done);
                  }, err => {
                    console.log(err);
                  });
                } else {
                  if (this.tipo == 2) {
                    this.modalCtrl.dismiss({ dismissed: true });
                  } else {
                    this.navCtrl.navigateBack('/directions');
                  }
                }
              }, err => {
                console.log(err);
              });
              loading.dismiss();
            }
          } else {
            this.general.mostrar_error('En estos momentos no llegamos hasta su dirección', 0);
          }
        } else {
          this.general.mostrar_error(valdirecc, 0);
          regDir.disabled = false;
          loading.dismiss();
        }
        // } else {
        //   this.general.mostrar_error('En estos momentos no llegamos hasta su dirección', 0);
        // }
      });
    } else {
      this.general.mostrar_alert('Se necesita iniciar sesión para agregar una dirección');
      this.navCtrl.navigateBack('/signin');
    }

  }

  validateDirection() {
    if (this.direccion == undefined || this.direccion == '') {
      return 'Se necesita un nombre para la dirección'; }
    if (this.otrasenas == undefined || this.otrasenas == '') {
      return 'Se necesita una dirección exacta'; }
    if (this.phone == undefined || this.phone == '') {
      return 'Se necesita un teléfono'; }
    if (this.latitud == undefined && this.longitud == undefined && this.kms == undefined) {
      return 'Se necesita localizar la ubicación mediante el mapa'; }
    // if (this.ubication != 'Grecia') {
    //   return 'Entregas solamente en Grecia'; }
    return false;
  }

  // crud( data: any ) {
  //   console.log('crud tipo');
  //   console.log(this.tipo);
  //   this.crudService.crud( data ).subscribe(async res => {
  //     // insert error
  //     if (res[0].ERROR != undefined) {
  //       this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",';
  //       this.crudService.crud(this.errsystem).subscribe(done => {
  //         console.log(done);
  //       }, err => {
  //         console.log(err);
  //       });
  //     }
  //     if (this.tipo == 2) {
  //       this.modalCtrl.dismiss({ dismissed: true });
  //     } else {
  //       this.navCtrl.navigateBack('/directions');
  //       // this.modalCtrl.dismiss({
  //       //   dismissed: true
  //       // });
  //       // this.vaciaCampos();
  //       // return true;
  //     }
  //   }, err => {
  //     console.log( err );
  //   });
  // }

  vaciaCampos() {
    this.userid = '';
    this.direccion = '';
    this.otrasenas = '';
    this.phone = '';
  }

  goBack() {
    console.log('click back');
    this.modalCtrl.dismiss();
  }

}

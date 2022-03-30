import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../services/storage.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { FtpaymentService } from '../../services/ftpayment.service';

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.page.html',
  styleUrls: ['./sucursales.page.scss'],
})
export class SucursalesPage implements OnInit {
  listSucursales: any;
  madresucursal = environment.madreSucursal;
  walkState:any;

  slideOpts = {
    initialSlide: 0,
    speed: 400
  };

  constructor( private crudService: CrudService, private storage: StorageService,
               private afAuth: AngularFireAuth, private ft: FtpaymentService ) { }

  ngOnInit() {
    this.loadWalkState();
  }

  changewalkState() {
    this.loadWalkState();
    if (this.walkState == 0 || this.walkState == null) {
      this.storage.setWalkthrough('state', 1);
    } else {
      this.storage.setWalkthrough('state', 0);
    }
  }

  async ionViewWillEnter() {
    this.loadWalkState();
    const data = { sel: '*', tbl: 39, where: 'id > 0 and madre_sucursales = ' + this.madresucursal };
    this.crudService.crud( data ).subscribe(suc => {
      console.log('sucrsales');
      console.log(suc);
      this.listSucursales = suc[0];
    }, err => {
      console.log(err);
    });
  }

  async loadWalkState() {
    this.walkState = (await this.storage.getWalkthrough('state')).value;
    console.log('walkState', this.walkState);
  }

  selectSucursal(idsucursal: number) {
    console.log(idsucursal);
    this.storage.setItem('impresa', String(idsucursal));
  }

}

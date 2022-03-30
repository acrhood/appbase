import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GeneralComponent } from '../../components/general/general.component';
import { SMS } from '@ionic-native/sms/ngx';
declare var SMSReceive: any;

@Component({
  selector: 'app-sinpe',
  templateUrl: './sinpe.page.html',
  styleUrls: ['./sinpe.page.scss'],
})
export class SinpePage implements OnInit {
  // tslint:disable: triple-equals
  // tslint:disable: max-line-length
  @Input() payment: number;
  @Input() banknum: number;
  time: any;
  secnum: number;
  hours: number;
  minutes: number;
  seconds: number;
  reference: string;
  interval: any;

  constructor( private modalCtrl: ModalController,
               private general: GeneralComponent, ) { }

  ngOnInit() {
    console.log('this.payment', this.payment);
    console.log('this.banknum', this.banknum);
    this.start();
    this.startCountdown( 180 );
  }

  start() {
    console.log('START');
    SMSReceive.startWatch(
      () => {
        console.log('watch started');
        document.addEventListener('onSMSArrive', (e: any) => {
          console.log('onSMSArrive()');
          const IncomingSMS = e.data;
          console.log('IncomingSMS');
          console.log(JSON.stringify(IncomingSMS));
          this.processSMS(IncomingSMS);
        });
      },
      () => {
        console.log('watch start failed');
    });
  }

  stop() {
    SMSReceive.stopWatch(
      () => { console.log('watch stopped'); },
      () => { console.log('watch stop failed'); }
    );
  }

  processSMS( data: any ) {
    // Check SMS for a specific string sequence to identify it is you SMS
    // Design your SMS in a way so you can identify the OTP quickly i.e. first 6 letters
    // In this case, I am keeping the first 6 letters as OTP
    const address = data.address;
    console.log('address', address );
    const message = data.body;
    console.log('message', message );
    const date_sent = data.date_sent;
    console.log('date_sent', date_sent );
    const date = data.date;
    console.log('date', date );
    const service_center = data.service_center;
    console.log('service_center', service_center );
    if ( address == '+' + this.banknum) { // address == this.banknum
      console.log('MESSAGE OK');
      console.log('INCLUDE', message.slice(0, 10));
      // if ( message.includes('Ha pasado') && message.includes('NUMERO SINPE') && message.includes('NOMBRE COMERCIO SINPE')) {
      if ( message.includes('Ha pasado')) {
        // this.reference = message.slice(-8, -1);
        // const n = message.indexOf(' ');
        // this.reference = message.substring( n + 1, -1);
        const n = message.split(' ')[message.split(' ').length - 1];
        console.log('n:', n);
        this.reference = n.replace('.', '');
        console.log('REFERENCE', this.reference);
        // Puede validarse todo el cuerpo del mensaje:  Ha pasado MONTO colones al NUMERO de CLIENTE.
        this.stop();
        this.closeModal( this.reference );
        clearInterval(this.interval);
      } else if (message.includes('Estimado cliente En este momento no podemos procesar si transaccion, PASE no se pudo realizar. Favor intente mas tarde') ) {
        this.general.mostrar_error('Ha ocurrido un error al procesar su pago por medio de SINPE Móvil. Por favor intente mediante otro medio de pago', 0);
        this.stop();
        this.closeModal( undefined );
        clearInterval(this.interval);
      } else if ( message.includes('FONDOS INSUFICIENTES') ) {
        this.general.mostrar_error('Se ha producido un error al procesar pago por medio de SINPE Móvil a causa de <b>fondos insufucuentes</b>. Por favor intente mediante otro medio de pago', 0);
        this.stop();
        this.closeModal( undefined );
        clearInterval(this.interval);
      } else if ( message.includes('operacion PASE es desconocida') ) {
        this.general.mostrar_error('Hemos detectado que no cuenta con la afiliación al sistema SINPE Móvil de su banco. Afiliese a su servicio primero o por favor intente mediante otro método de pago', 0);
        this.stop();
        this.closeModal( undefined );
        clearInterval(this.interval);
      }
    }
    // if (message && message.indexOf('enappd_starters') != -1) {
    //   console.log('MESSAGE OK');
    //   // this.OTP = data.body.slice(0, 6);
    //   // this.OTPmessage = 'OTP received. Proceed to register';
    //   this.stop();
    // }
  }

  startCountdown( counter: number ) {
    console.log('startCountdown');
    this.interval = setInterval(() => {
      counter--;
      this.time = this.calculateTime( counter );

      if (counter <= 0 ) {
        clearInterval(this.interval);
        console.log('Se cumple el plazo de tiempo estimado');
        this.closeModal( 'timelimit' );
        this.general.mostrar_error('Se ha acabado el tiempo y no pudimos recibir confirmación del pago por medio de SINPE Móvil. Si su pago se realizó, por favor contactese con la sucursal de compra, si no, intente con otro medio de pago', 0);
      }
    }, 1000);
  }

  calculateTime( countdown: number ) {
    console.log('calculateTime');
    const secnum = parseInt(countdown.toString(), 10); // don't forget the second param
    const hours = Math.floor(secnum / 3600);
    const minutes = Math.floor((secnum - (hours * 3600)) / 60);
    const seconds = secnum - (hours * 3600) - (minutes * 60);
    let hoursString = '';
    let minutesString = '';
    let secondsString = '';
    hoursString = (hours < 10) ? '0' + hours : hours.toString();
    minutesString = (minutes < 10) ? '0' + minutes : minutes.toString();
    secondsString = (seconds < 10) ? '0' + seconds : seconds.toString();
    // hoursString + ':' +
    return minutesString + ':' + secondsString;
  }

  closeModal( reference: string ) {
    this.modalCtrl.dismiss({ reference, dismissed: false });
  }

}

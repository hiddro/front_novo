import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare let webkitSpeechRecognition: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  recognition: any;
  @ViewChild(MatStepper) stepper!: MatStepper;
  sToken!: boolean;
  sLoader!: boolean;
  sMessage!: boolean;

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });

  constructor(private _formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient) {
  }

  ngOnInit(): void {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.lang = 'es-ES';
    this.recognition.interimResult = false;
    this.sToken = false;
    this.sLoader = false;
    this.sMessage = false;
    this.onStart();
  }

  onLeerTexto(text: string) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1.5;
    speech.lang = 'es-ES'

    window.speechSynthesis.speak(speech);
  }

  onStart() {
    this.recognition.start();

    this.recognition.onresult = (event: any) => {
      let texto = event.results[event.results.length - 1][0].transcript;

      if(this.sToken == false){
        if(texto.trim().toLowerCase() === "siguiente" || texto.trim().toLowerCase() === "vuelve"){
          this.stepper.next();
          this.changeDetectorRef.detectChanges();
          return;
        }else if(texto.trim().toLowerCase() === "listo"){
          this.sToken = true;
          this.sLoader = true;
          this.loadComponents();
        }else if(texto.trim().toLowerCase() === "documento"){
          window.open("https://docs.google.com/presentation/d/1G1XK3y6svYSvfxKzi1rhE2IzQpOMULyxYkEsgVGBCd0/edit?usp=sharing");
          return;
        }

        let sData1 = this.firstFormGroup.get('firstCtrl')?.value;
        let sData2 = this.secondFormGroup.get('secondCtrl')?.value;

        if(sData1 === ''){
          this.firstFormGroup.get('firstCtrl')?.setValue(texto.trim());
        }else if(sData1 !== '' && sData2 === ''){
          this.secondFormGroup.get('secondCtrl')?.setValue(texto.trim());
        }

        this.changeDetectorRef.detectChanges();
      }else{
        if(texto.trim().toLowerCase() === "envía"){
          this.onSendMessage();
          return;
        }

        this.thirdFormGroup.get('thirdCtrl')?.setValue(this.onCompleteTextArea("- " + texto.trim())!);
        this.changeDetectorRef.detectChanges();
      }

    }
  }

  onCompleteTextArea(text: string){
    return this.thirdFormGroup.get('thirdCtrl')?.value == '' ? text :
          this.thirdFormGroup.get('thirdCtrl')?.value + "\n" + text;
  }

  onSendMessage(){
    const twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json';
    const accountSid = 'AC956dcee1d224d58aed323b28a0bfeb9d';
    const authToken = 'aa47d2ad28240c30008120d0898fa666';

    const headers = new HttpHeaders()
      .set('Authorization', 'Basic ' + btoa(`${accountSid}:${authToken}`))
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const sName = this.firstFormGroup.get('firstCtrl')?.value;
    const sCode = this.secondFormGroup.get('secondCtrl')?.value;
    const sBody = this.thirdFormGroup.get('thirdCtrl')?.value;

    const messageData = {
      From: 'whatsapp:+14155238886',
      Body: '*Usuario:* ' + `${sName}` + ' \n*Código:* ' + `${sCode}` + ' \n*Descripción:* _Ha generado la siguiente nota mediante NoVo:_ \n' + `${sBody}`,
      To: 'whatsapp:+51983478763'
    };

    const body = new URLSearchParams(messageData).toString();

    this.http.post(twilioUrl.replace('{ACCOUNT_SID}', accountSid), body, { headers })
      .subscribe({
        next: response => {
          window.location.reload();
          console.log(response);
        },
        error: error => {
          console.error(error);
        }
      });
  }

  onFinish() {
    this.recognition.abort();
  }

  loadComponents() {
    setTimeout(() => {
      this.sLoader = false;
      this.sMessage = true;
      this.changeDetectorRef.detectChanges();
    }, 2000);
  }
}

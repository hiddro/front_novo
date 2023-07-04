import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

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
    private changeDetectorRef: ChangeDetectorRef) {
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
    /* this.loadCharge(); */

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
        this.thirdFormGroup.get('thirdCtrl')?.setValue(texto.trim());
        this.changeDetectorRef.detectChanges();
      }

    }
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

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

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  constructor(private _formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.lang = 'es-ES';
    this.recognition.interimResult = false;

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
      if(texto.trim().toLowerCase() === "siguiente" || texto.trim().toLowerCase() === "vuelve"){
        this.stepper.next();
        this.changeDetectorRef.detectChanges();
        return;
      }

      let sData = this.firstFormGroup.get('firstCtrl')?.value;

      if(sData === ''){
        this.firstFormGroup.get('firstCtrl')?.setValue(texto.trim());
      }else{
        this.secondFormGroup.get('secondCtrl')?.setValue(texto.trim());
      }

      this.changeDetectorRef.detectChanges();

    }
  }

  onFinish() {
    this.recognition.abort();
  }

  /* loadCharge() {
    this.flagChargeSpinner = true;
    setTimeout(() => {
      this.flagChargeSpinner = false;
      this.flagChargeTextArea = true;
    }, 2000);
  } */
}

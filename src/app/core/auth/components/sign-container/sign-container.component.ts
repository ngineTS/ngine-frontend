import { Component } from '@angular/core';
import { SignInComponent } from '../sign-in/sign-in.component';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-sign-container',
  imports: [SignInComponent, SignUpComponent, MatButton],
  templateUrl: './sign-container.component.html',
  styleUrl: './sign-container.component.scss'
})
export class SignContainerComponent {

  isSignUpTab: boolean = false;

  ngOnInit(): void {

  }

  goToSignIn(){
    this.isSignUpTab = false;
  }

  goToSignUp(){
    this.isSignUpTab = true;
  }
}

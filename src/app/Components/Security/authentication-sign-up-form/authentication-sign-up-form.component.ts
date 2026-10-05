import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserCredentialsDTO } from '../../../Models/Security/securityDTO';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-authentication-sign-up-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatInputModule],
  templateUrl: './authentication-sign-up-form.component.html',
  styleUrl: './authentication-sign-up-form.component.css'
})
export class AuthenticationSignUpFormComponent {


  private formBuilder = inject(FormBuilder);


  form = this.formBuilder.group({
    email: ['', { validators: [Validators.required, Validators.email] }],
    password: ['', { validators: [Validators.required] }]
  });



  @Input()
  errors: string[] = [];

  @Output()
  submitForm = new EventEmitter<UserCredentialsDTO>();



  getEmailErrors(): string {
    let field = this.form.controls.email;

    if (field.hasError('required')) {
      return 'the field email is required';
    }

    if (field.hasError('email')) {
      return 'the field email is not valid'
    }


    return '';
  }

  getPasswordErrors(): string {
    let field = this.form.controls.password;

    if (field.hasError('required')) {
      return 'the field password is required'
    }

    return ''
  }



  saveChanges() {
    if (!this.form.valid) {
      return;
    }

    const creds = this.form.value as UserCredentialsDTO;
    this.submitForm.emit(creds);
  }

}

import { UntypedFormGroup } from '@angular/forms';

export const mustDifferent = (controlName: string, matchingControlName: string) =>
  (formGroup: UntypedFormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors['mustDifferent']) {
      return;
    }

    if (control.value === matchingControl.value) {
      matchingControl.setErrors({ mustDifferent: true });
    } else {
      matchingControl.setErrors(null);
    }
  };

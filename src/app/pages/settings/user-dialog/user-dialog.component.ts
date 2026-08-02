import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';

import { getAuthApiError } from '../../../auth/auth-error';
import { AuthUserListItem, SaveUserRequest, UserRole } from '../../../auth/auth.models';
import { AuthService } from '../../../auth/auth.service';

export interface UserDialogData {
  user?: AuthUserListItem;
}

@Component({
  selector: 'app-user-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDialogComponent {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<UserDialogComponent, boolean>);
  protected readonly data = inject<UserDialogData>(MAT_DIALOG_DATA);

  protected readonly isEditing = Boolean(this.data.user);
  protected readonly isSaving = signal(false);
  protected readonly hidePassword = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly roles: UserRole[] = ['ADMIN', 'REPORT_VIEW'];

  protected readonly userForm = new FormGroup({
    user_id: new FormControl(this.data.user?.user_id ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    role: new FormControl<UserRole>(this.data.user?.role ?? 'REPORT_VIEW', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(15)],
    }),
  });

  protected save(): void {
    if (this.userForm.invalid || this.isSaving()) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.userForm.disable();

    const request = this.userForm.getRawValue() as SaveUserRequest;
    const saveRequest = this.data.user
      ? this.authService.updateUser(this.data.user.id, request)
      : this.authService.registerUser(request);

    saveRequest
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
          this.userForm.enable();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (error: unknown) => {
          this.errorMessage.set(
            getAuthApiError(
              error,
              this.isEditing
                ? 'The user could not be updated. Please try again.'
                : 'The user could not be created. Please try again.',
            ),
          );
        },
      });
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }
}

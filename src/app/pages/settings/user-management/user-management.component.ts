import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { getAuthApiError } from '../../../auth/auth-error';
import { AuthUserListItem } from '../../../auth/auth.models';
import { AuthService } from '../../../auth/auth.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-management',
  imports: [
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly displayedColumns = ['userId', 'role', 'registerDate', 'updatedDate', 'action'];
  protected readonly users = signal<AuthUserListItem[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  protected openCreateDialog(): void {
    this.openDialog();
  }

  protected openEditDialog(user: AuthUserListItem): void {
    this.openDialog(user);
  }

  protected retry(): void {
    this.loadUsers();
  }

  private openDialog(user?: AuthUserListItem): void {
    this.dialog
      .open(UserDialogComponent, {
        autoFocus: 'first-tabbable',
        data: { user },
        disableClose: true,
        maxWidth: '95vw',
        panelClass: 'user-management-dialog',
        width: '560px',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved) => {
        if (saved) {
          this.snackBar.open(user ? 'User updated successfully.' : 'User created successfully.', 'Close', {
            duration: 4000,
          });
          this.loadUsers();
        }
      });
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.users.set([]);
          this.isLoading.set(false);
          this.errorMessage.set(
            getAuthApiError(error, 'Users could not be loaded. Please try again.'),
          );
        },
      });
  }
}

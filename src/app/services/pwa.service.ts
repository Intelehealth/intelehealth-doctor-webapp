import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PwaPromptComponent } from '../modal-components/pwa-prompt/pwa-prompt.component';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  private promptEvent: any;

  constructor(private platform: Platform, private bottomSheet: MatBottomSheet, private router: Router) { }

  public initPwaPrompt() {
    if (this.platform.ANDROID || this.platform.isBrowser) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.promptEvent = event;
        this.openPromptComponent('android');
      });
    }
    if (this.platform.IOS) {
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator['standalone']);
      if (!isInStandaloneMode) {
        this.openPromptComponent('ios');
      }
    }
  }

  private openPromptComponent(mobileType: 'ios' | 'android') {
    timer(3000)
      .pipe(take(1))
      .subscribe(() => {
        if (!this.router.url.includes('/i/')) {
          this.bottomSheet.open(PwaPromptComponent, { data: { mobileType, promptEvent: this.promptEvent } })
        }
      });
  }
}

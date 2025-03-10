import { Injectable } from '@angular/core';
import { TourGuideClient } from '@sjmc11/tourguidejs';
import { AppConfigService } from './app-config.service';
import { TranslateService } from '@ngx-translate/core';

export interface TourStep {
  content: string;
  title?: string;
  target?: HTMLElement | Element | HTMLInputElement | string;
  order?: number;
  group?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HelpTourService {
  tourIsActive = false;
  public tour: TourGuideClient | null = null;

  constructor(
    private appConfigSvc: AppConfigService,
    private translateService: TranslateService
  ) { }

  initHelpTour(steps: TourStep[] | null= this.appConfigSvc.tourConfig) {
    if(this.tourIsActive || !steps || Array.isArray(steps) && steps.length === 0) return;

    const currentLang = this.translateService.currentLang || this.translateService.defaultLang || 'ru';

    // Use the steps directly without translation service
    const translatedSteps = steps.map(step => {
      if (typeof step.content === 'string') {
        return {
          ...step,
          title: step.title || undefined,
          content: step.content
        };
      }
      
      return {
        ...step,
        title: step.title?.[currentLang] || step.title?.['en'] || step.title,
        content: step.content?.[currentLang] || step.content?.['en'] || step.content
      };
    });

    this.tourIsActive = true;
    this.tour = new TourGuideClient({
      steps: translatedSteps,
      showStepProgress: false,
      debug: false,
      dialogZ: 1100,
      dialogWidth: 300,
      dialogClass: 'help-tour-dialog',
      backdropClass: 'help-tour-backdrop',
      exitOnClickOutside: false,
      showStepDots: false,
      progressBar: '#0FD197',
      targetPadding: 0,
      autoScrollOffset: 30,
      autoScrollSmooth: false,
      nextLabel: this.translateService.instant('Next'),
      prevLabel: this.translateService.instant('Back'),
      finishLabel: this.translateService.instant('Finish')
    });

    this.tour.onAfterExit(()=>{
      this.tourIsActive = false;
      document.querySelector('.help-tour-backdrop')?.remove?.();
      document.querySelector('.tg-dialog')?.remove?.();
    });

    this.tour.onAfterStepChange(()=>{
      const btn = document.getElementById('tg-dialog-next-btn');
      if(btn){
        const isLastStep = btn?.textContent?.trim?.() === this.translateService.instant('Finish');
        if(isLastStep) {
          btn.classList.add('btn-finish');
        } else {
          btn.classList.remove('btn-finish');
        }
      }
    });

    this.translateService.onLangChange.subscribe(() => {
      if (this.tour) {
        this.tour.setOptions({
          nextLabel: this.translateService.instant('Next'),
          prevLabel: this.translateService.instant('Back'),
          finishLabel: this.translateService.instant('Finish')
        });
      }
    });

    setTimeout(() => {
      this.tour.start();
    }, 0);

    return this.tour;
  };

  closeTour(){
    this.tour?.exit();
  }
}

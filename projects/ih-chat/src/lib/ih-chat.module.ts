import { NgModule } from '@angular/core';
import { IhChatComponent } from './ih-chat.component';
import { IhChatService } from './ih-chat.service';



@NgModule({
  declarations: [
    IhChatComponent
  ],
  imports: [
  ],
  exports: [
    IhChatComponent
  ]
})
export class IhChatModule { 
  static forRoot(config: any): any {
    return {
      ngModule: IhChatModule,
      providers: [
        IhChatService,
        { provide: 'ChatConfig', useValue: config }
      ]
    };
  }
}

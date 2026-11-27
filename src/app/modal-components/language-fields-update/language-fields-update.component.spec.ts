import { FormBuilder } from '@angular/forms';

import { LanguageFieldUpdate } from './language-fields-update.component';

describe('LanguageFieldUpdate', () => {
  let component: LanguageFieldUpdate;
  let dialogRef: any;
  let configService: any;

  const data = {
    fieldName: 'Chief complaint',
    fields: [{ lang: 'en', value: 'Fever' }]
  } as any;

  beforeEach(() => {
    dialogRef = { close: jasmine.createSpy('close') };
    configService = {};

    component = new LanguageFieldUpdate(data, dialogRef, configService, new FormBuilder());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('takes the field name from the dialog data', () => {
    expect(component.fieldName).toBe('Chief complaint');
  });
});

import { of } from 'rxjs';

import { QmsComponent } from './qms.component';

describe('QmsComponent', () => {
  let component: QmsComponent;
  let configService: any;
  let toastr: any;

  const qms = { id: 7, key: 'qms_section', name: 'QMS Section', is_enabled: true };
  const other = { id: 8, key: 'abha_section', name: 'ABHA ID', is_enabled: true };

  beforeEach(() => {
    configService = {
      getFeatures: jasmine.createSpy('getFeatures').and.returnValue(of({ feature: [qms, other] })),
      updateFeatureEnabledStatus: jasmine.createSpy('updateFeatureEnabledStatus').and.returnValue(of({})),
      publishConfig: jasmine.createSpy('publishConfig').and.returnValue(of({}))
    };
    toastr = { success: jasmine.createSpy('success') };

    component = new QmsComponent(
      { setTitle: () => {} } as any,
      { use: () => {} } as any,
      configService,
      toastr
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows only the QMS feature row', () => {
    component.getQms();

    expect(configService.getFeatures).toHaveBeenCalled();
    expect(component.qmsData).toEqual([qms] as any);
    expect(component.dataSource.data).toEqual([qms]);
  });

  it('shows no rows when the QMS feature is not seeded', () => {
    configService.getFeatures.and.returnValue(of({ feature: [other] }));

    component.getQms();

    expect(component.qmsData).toEqual([]);
  });

  it('sends the new status and re-reads the features', () => {
    component.getQms();

    component.updateStatus(7, false);

    expect(configService.updateFeatureEnabledStatus).toHaveBeenCalledWith(7, false);
    expect(configService.getFeatures).toHaveBeenCalledTimes(2);
    expect(toastr.success).toHaveBeenCalled();
  });

  it('publishes and reports success', () => {
    component.getQms();

    component.onPublish();

    expect(configService.publishConfig).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalled();
  });
});

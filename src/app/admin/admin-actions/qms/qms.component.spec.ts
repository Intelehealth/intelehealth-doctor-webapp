import { of, throwError } from 'rxjs';

import { QmsComponent } from './qms.component';

describe('QmsComponent', () => {
  let component: QmsComponent;
  let configService: any;
  let toastr: any;

  const feature = { id: 7, key: 'qms_section', is_enabled: true };

  beforeEach(() => {
    configService = {
      getFeatureByKey: jasmine.createSpy('getFeatureByKey').and.returnValue(of({ feature })),
      updateFeatureEnabledStatus: jasmine.createSpy('updateFeatureEnabledStatus').and.returnValue(of({})),
      publishConfig: jasmine.createSpy('publishConfig').and.returnValue(of({}))
    };
    toastr = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error')
    };

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

  describe('getQmsFeature', () => {
    it('stores the feature and allows editing', () => {
      component.getQmsFeature();

      expect(configService.getFeatureByKey).toHaveBeenCalledWith('qms_section');
      expect(component.qmsFeature).toEqual(feature);
      expect(component.featureMissing).toBeFalse();
      expect(component.canEdit).toBeTrue();
    });

    it('flags the feature as missing when the row is not seeded', () => {
      configService.getFeatureByKey.and.returnValue(of({ feature: null }));

      component.getQmsFeature();

      expect(component.featureMissing).toBeTrue();
      expect(component.canEdit).toBeFalse();
    });

    it('flags the feature as missing and warns when the request fails', () => {
      configService.getFeatureByKey.and.returnValue(throwError(() => new Error('boom')));

      component.getQmsFeature();

      expect(component.featureMissing).toBeTrue();
      expect(component.canEdit).toBeFalse();
      expect(toastr.error).toHaveBeenCalled();
    });
  });

  describe('updateQmsStatus', () => {
    it('does not call the API before the feature id is known', () => {
      component.qmsFeature = {};

      component.updateQmsStatus(true);

      expect(configService.updateFeatureEnabledStatus).not.toHaveBeenCalled();
    });

    it('sends the new status and re-reads the feature', () => {
      component.getQmsFeature();

      component.updateQmsStatus(false);

      expect(configService.updateFeatureEnabledStatus).toHaveBeenCalledWith(7, false);
      expect(configService.getFeatureByKey).toHaveBeenCalledTimes(2);
      expect(toastr.success).toHaveBeenCalled();
      expect(component.isSaving).toBeFalse();
    });

    it('re-reads the feature and warns when the update fails', () => {
      component.getQmsFeature();
      configService.updateFeatureEnabledStatus.and.returnValue(throwError(() => new Error('boom')));

      component.updateQmsStatus(false);

      expect(toastr.error).toHaveBeenCalled();
      expect(configService.getFeatureByKey).toHaveBeenCalledTimes(2);
      expect(component.isSaving).toBeFalse();
    });

    it('ignores a second change while one is in flight', () => {
      component.getQmsFeature();
      component.isSaving = true;

      component.updateQmsStatus(true);

      expect(configService.updateFeatureEnabledStatus).not.toHaveBeenCalled();
    });
  });

  describe('onPublish', () => {
    it('publishes and reports success', () => {
      component.onPublish();

      expect(configService.publishConfig).toHaveBeenCalledTimes(1);
      expect(toastr.success).toHaveBeenCalled();
      expect(component.isSaving).toBeFalse();
    });

    it('reports a failed publish', () => {
      configService.publishConfig.and.returnValue(throwError(() => new Error('boom')));

      component.onPublish();

      expect(toastr.error).toHaveBeenCalled();
      expect(component.isSaving).toBeFalse();
    });

    it('ignores a second click while a publish is in flight', () => {
      component.isSaving = true;

      component.onPublish();

      expect(configService.publishConfig).not.toHaveBeenCalled();
    });
  });
});

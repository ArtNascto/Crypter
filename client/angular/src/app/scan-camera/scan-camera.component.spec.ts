import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanCameraComponent } from './scan-camera.component';

describe('ScanCameraComponent', () => {
  let component: ScanCameraComponent;
  let fixture: ComponentFixture<ScanCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanCameraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

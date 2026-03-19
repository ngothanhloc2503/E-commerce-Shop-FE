import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateSettingComponent } from './state-setting.component';

describe('StateSettingComponent', () => {
  let component: StateSettingComponent;
  let fixture: ComponentFixture<StateSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StateSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

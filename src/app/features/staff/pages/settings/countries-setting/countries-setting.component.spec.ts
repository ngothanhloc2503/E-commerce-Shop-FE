import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountriesSettingComponent } from './countries-setting.component';

describe('CountriesSettingComponent', () => {
  let component: CountriesSettingComponent;
  let fixture: ComponentFixture<CountriesSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountriesSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CountriesSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

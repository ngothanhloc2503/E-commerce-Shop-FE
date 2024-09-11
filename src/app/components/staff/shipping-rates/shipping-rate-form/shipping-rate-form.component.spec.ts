import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingRateFormComponent } from './shipping-rate-form.component';

describe('ShippingRateFormComponent', () => {
  let component: ShippingRateFormComponent;
  let fixture: ComponentFixture<ShippingRateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingRateFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShippingRateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

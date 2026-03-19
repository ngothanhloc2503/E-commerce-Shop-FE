import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingRateListComponent } from './shipping-rate-list.component';

describe('ShippingRateListComponent', () => {
  let component: ShippingRateListComponent;
  let fixture: ComponentFixture<ShippingRateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingRateListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShippingRateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

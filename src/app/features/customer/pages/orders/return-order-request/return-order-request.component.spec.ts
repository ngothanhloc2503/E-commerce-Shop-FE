import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnOrderRequestComponent } from './return-order-request.component';

describe('ReturnOrderRequestComponent', () => {
  let component: ReturnOrderRequestComponent;
  let fixture: ComponentFixture<ReturnOrderRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnOrderRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnOrderRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

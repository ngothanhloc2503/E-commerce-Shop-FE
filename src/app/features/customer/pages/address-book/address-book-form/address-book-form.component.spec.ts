import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressBookFormComponent } from './address-book-form.component';

describe('AddressFormComponent', () => {
  let component: AddressBookFormComponent;
  let fixture: ComponentFixture<AddressBookFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressBookFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddressBookFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailServerSettingComponent } from './mail-server-setting.component';

describe('MailServerSettingComponent', () => {
  let component: MailServerSettingComponent;
  let fixture: ComponentFixture<MailServerSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailServerSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MailServerSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

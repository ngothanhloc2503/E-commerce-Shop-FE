import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailTemplatesSettingComponent } from './mail-templates-setting.component';

describe('MailTemplatesSettingComponent', () => {
  let component: MailTemplatesSettingComponent;
  let fixture: ComponentFixture<MailTemplatesSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailTemplatesSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MailTemplatesSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { CommonModule } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import 'flowbite';
import { AlertService } from './core/services/alert/alert.service';
import { GeneralSettingService } from './core/services/general-setting/general-setting.service';
import { AlertComponent } from './shared/components/alert/alert.component';
import { Flowbite, InitFlowbiteFix } from './shared/components/flowbite.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavComponent } from './shared/components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavComponent, AlertComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

@Flowbite()
export class AppComponent {
  title='E-commerce';

  constructor(
    public alertService: AlertService,
    public settingService: GeneralSettingService, 
    private router: Router) {
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        InitFlowbiteFix();
      }
    });

    this.settingService.getSiteSettings();
  }
  
  @HostBinding('class.dark') get mode() {
    return JSON.parse(window.localStorage.getItem('darkMode') ?? 'false');
  }
}

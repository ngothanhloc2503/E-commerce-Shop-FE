import { Component, HostBinding } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavComponent } from './components/nav/nav.component';
import { initFlowbite } from 'flowbite';
import { AlertService } from './services/alert/alert.service';
import { AlertComponent } from './components/alert/alert.component';
import { FooterComponent } from './components/footer/footer.component';
import 'flowbite';
import { Flowbite, InitFlowbiteFix } from './flowbite.component';
import { GeneralSettingService } from './services/general-setting/general-setting.service';

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

import { Component, HostBinding } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import 'flowbite';
import { AlertService } from './core/services/alert/alert.service';
import { GeneralSettingService } from './core/services/general-setting/general-setting.service';
import { ThemeService } from './core/services/theme/theme.service';
import { AlertComponent } from './shared/components/alert/alert.component';
import { Flowbite, InitFlowbiteFix } from './shared/components/flowbite.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavComponent } from './shared/components/nav/nav.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavComponent, AlertComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})

@Flowbite()
export class AppComponent {
  title='E-commerce';

  constructor(
    public alertService: AlertService,
    private themeService: ThemeService,
    public settingService: GeneralSettingService, 
    private router: Router) {
  }

  // Reactive dark mode
  @HostBinding('class.dark') get mode() {
    return this.themeService.darkMode();
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        InitFlowbiteFix();
      }
    });
  }
}

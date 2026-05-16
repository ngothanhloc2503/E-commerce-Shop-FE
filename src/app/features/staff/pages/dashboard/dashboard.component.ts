import { Component, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import ApexCharts from 'apexcharts';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { ReportService } from '../../services/report/report.service';
import { round } from '../../../../shared/utils/number.util';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private reportService = inject(ReportService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);

  // ViewChild
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;
  private chart: ApexCharts | null = null;

  // UI signals
  activeTab = signal<'date' | 'category' | 'product'>('date');
  showCustomRange = signal(false);
  chartType = signal<'bar' | 'pie' | 'table'>('bar');
  chartTitle = signal('Sales By Date');
  tableHeader = signal('Total Orders');
  noSales = signal(false);

  // Data signals
  reportData = signal<any[]>([]);
  totalGrossSales = signal(0);
  totalNetSales = signal(0);
  avgGrossSales = signal(0);
  avgNetSales = signal(0);
  totalItemCount = signal(0);

  // Date range form
  dateRangeForm: FormGroup = this.fb.group({
    fromDate: new FormControl('', Validators.required),
    toDate: new FormControl('', Validators.required)
  });

  ngAfterViewInit() {
    this.triggerFetch('date', 'last-7-days');
  }

  triggerFetch(type: 'date' | 'category' | 'product', period: string) {
    this.activeTab.set(type);
    this.showCustomRange.set(false);
    this.reportService.getReportDataByPeriod('sales-by-' + type, period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res.data;
          if (!data || data.length === 0) {
            this.resetState();
          } else {
            this.processReportData(type, data, this.getDenominator(period));
          }
        },
      });
  }
  // Trigger Custom Date Range
  applyCustomDateRange() {
    const { fromDate, toDate } = this.dateRangeForm.value;
    
    if (!fromDate || !toDate) {
      this.alertService.showAndCloseAlertAfterXSecond('Both dates must be selected.', 'red', 3000);
      return;
    }
    if (!this.validateDates(fromDate, toDate)) return;

    this.reportService.getReportDataByDateRange(this.activeTab(), fromDate, toDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res.data;
          if (!data || data.length === 0) {
            this.resetState();
          } else {
            const diffDays = Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 3600 * 24));
            this.processReportData(this.activeTab(), data, diffDays);
          }
        },
      });
  }

  showCustomDateRangeForm() {
    this.showCustomRange.set(true);
  }

  private processReportData(type: string, response: any, denominator: number) {
    this.noSales.set(false);
    const identifiers = response.map((d: any) => d.identifier);
    const grossSales = response.map((d: any) => round(d.grossSales));
    const netSales = response.map((d: any) => round(d.netSales));
    const counts = response.map((d: any) => type === 'date' ? d.ordersCount : d.productsCount);

    // Chuẩn hóa dữ liệu cho bảng (dùng cho cả Bar, Pie, và Product Table)
    this.reportData.set(response.map((d: any, i: string | number) => ({
      identifier: identifiers[i],
      gross: grossSales[i],
      net: netSales[i],
      count: counts[i]
    })));

    this.calculateTotals(grossSales, netSales, counts, denominator);

    if (type === 'date') {
      this.chartType.set('bar');
      this.chartTitle.set('Sales By Date');
      this.tableHeader.set('Total Orders');
      this.renderBarChart(identifiers, grossSales, netSales, counts);
    } else if (type === 'category') {
      this.chartType.set('pie');
      this.chartTitle.set('Sales By Category');
      this.tableHeader.set('Total Products');
      this.renderPieChart(identifiers, grossSales);
    } else {
      this.chartType.set('table');
      this.chartTitle.set('Sales By Product');
      this.tableHeader.set('Total Products');
      if (this.chart) { this.chart.destroy(); this.chart = null; }
    }
  }

  private resetState() {
    this.noSales.set(true);
    this.reportData.set([]);
    if (this.chart) { this.chart.destroy(); this.chart = null; }
  }

  // --- APEX CHARTS RENDERING ---
  private initChart(options: any) {
    if (this.chart) this.chart.destroy();
    if (this.chartContainer?.nativeElement) {
      this.chart = new ApexCharts(this.chartContainer.nativeElement, options);
      this.chart.render();
    }
  }

  private renderBarChart(categories: string[], grossSales: number[], netSales: number[], ordersCount: number[]) {
    const options = {
      chart: { type: "bar", height: "320px", fontFamily: "Inter, sans-serif", toolbar: { show: true } },
      title: { text: this.chartTitle(), align: "left", style: { fontSize: "16px", color: "#666" } },
      colors: ["#FDBA8C", "#31C48D", "#1A56DB"],
      series: [
        { name: "Gross Sales", data: grossSales },
        { name: "Net Sales", data: netSales },
        { name: "Orders", data: ordersCount },
      ],
      xaxis: { categories: categories },
      yaxis: [
        { seriesName: "Gross Sales", title: { text: "Sales Amount" }, labels: { formatter: (value: number) => `$${value}` } },
        { seriesName: "Gross Sales", show: false },
        { opposite: true, title: { text: "Order Count" }, labels: { formatter: (value: number) => `${value}` } },
      ],
      tooltip: { y: [{ formatter: (value: number) => `$${value}` }, { formatter: (value: number) => `$${value}` }, { formatter: (value: number) => `${value} orders` }] },
      fill: { opacity: 1 },
    };
    this.initChart(options);
  }

  private renderPieChart(labels: string[], series: number[]) {
    const options = {
      chart: { type: "pie", height: 420, width: "100%", fontFamily: "Inter, sans-serif", toolbar: { show: true } },
      title: { text: this.chartTitle(), align: "left", style: { fontSize: "16px", color: "#666" } },
      series: series,
      labels: labels,
      yaxis: { labels: { formatter: (value: number) => `$${value}` } },
    };
    this.initChart(options);
  }

  private validateDates(fromDate: string, toDate: string): boolean {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const today = new Date(); today.setHours(0,0,0,0);

    if (to <= from) {
      this.alertService.showAndCloseAlertAfterXSecond('The "To Date" must be after the "From Date".', 'red', 3000); return false;
    }
    if (to >= today) {
      this.alertService.showAndCloseAlertAfterXSecond('The "To Date" must be before today\'s date.', 'red', 3000); return false;
    }
    const diffDays = Math.round((to.getTime() - from.getTime()) / (1000 * 3600 * 24));
    if (diffDays >= 30) {
      this.alertService.showAndCloseAlertAfterXSecond('The date range must be less than 30 days.', 'red', 3000); return false;
    }
    return true;
  }

  private getDenominator(period: string): number {
    const map: any = { "last-7-days": 7, "last-28-days": 28, "last-6-months": 6, "last-12-months": 12 };
    return map[period] || 1;
  }

  private calculateTotals(grossSales: number[], netSales: number[], totalItem: number[], denominator: number) {
    this.totalGrossSales.set(round(grossSales.reduce((a, b) => a + b, 0)));
    this.avgGrossSales.set(round(this.totalGrossSales() / denominator));
    this.totalNetSales.set(round(netSales.reduce((a, b) => a + b, 0)));
    this.avgNetSales.set(round(this.totalNetSales() / denominator));
    this.totalItemCount.set(totalItem.reduce((a, b) => a + b, 0));
  }
}

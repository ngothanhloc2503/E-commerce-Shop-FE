import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import ApexCharts from 'apexcharts';
import { ReportService } from '../../../services/staff/report/report.service';
import { UtilsService } from '../../../services/utils/utils.service';
import { AlertService } from '../../../services/alert/alert.service';
declare var $: any;

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(
    private reportService: ReportService,
    private utilsService: UtilsService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.getSalesReportByDate('last-7-days');
  }

  private chart: ApexCharts | null = null;
  getSalesReportByDate(period: string) {
    this.hiddenCustomDateRangeForm();
    this.reportService.getReportDataByPeriod('date', period).subscribe({
      next: (response: any) => {
        if (response == null) {
          this.renderNoSales();
        } else {
          this.renderSalesReportByDateChart(response);
        }
      },
      error: (err: any) => {
        this.utilsService.handleError(err);
      }
    });
  }

  getSalesReportByCategory(period: string) {
    this.hiddenCustomDateRangeForm();
    this.reportService.getReportDataByPeriod('category', period).subscribe({
      next: (response: any) => {
        if (response == null) {
          this.renderNoSales();
        } else {
          this.renderSalesReportByCategoryChart(response);
        }
      },
      error: (err: any) => {
        this.utilsService.handleError(err);
      }
    });
  }

  getSalesReportByProduct(period: string) {
    this.hiddenCustomDateRangeForm();
    this.reportService.getReportDataByPeriod('product', period).subscribe({
      next: (response: any) => {
        if (response == null) {
          this.renderNoSales();
        } else {
          this.renderSalesReportByProductChart(response);
        }
      },
      error: (err: any) => {
        this.utilsService.handleError(err);
      }
    });
  }

  getSalesReportByDateRange() {
    const groupBy = $('#customDateRangeForm button').attr('groupBy');
    const fromDate = $('#fromDate').val().trim();
    const toDate = $('#toDate').val().trim();

    if (!this.validateFromAndToDate()) return;

    this.reportService.getReportDataByDateRange(groupBy, fromDate, toDate).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.length === 0) {
          this.renderNoSales();
        } else {
          if (groupBy === 'date') {
            this.renderSalesReportByDateChart(response);
          } else if (groupBy === 'category') {
            this.renderSalesReportByCategoryChart(response);
          } else {
            this.renderSalesReportByProductChart(response);
          }
        }
      },
      error: (err: any) => {
        this.utilsService.handleError(err);
      }
    });
  }

  validateFromAndToDate() {
    const fromDate = $('#fromDate').val().trim();
    const toDate = $('#toDate').val().trim();
    if (!fromDate || !toDate) {
      this.alertService.showAndCloseAlertAfterXSecond('Both dates must be selected.', 'red', 3000);
      return false;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const today = new Date();

    // Check if toDate is after fromDate
    if (to <= from) {
      this.alertService.showAndCloseAlertAfterXSecond('The "To Date" must be after the "From Date".', 'red', 3000);
      return false;
    }

    // Check if toDate is before the current date (today)
    if (to >= today) {
      this.alertService.showAndCloseAlertAfterXSecond('The "To Date" must be before today\'s date.', 'red', 3000);
      return false;
    }

    // Check if date difference is less than 30 days
    const diffDays = (to.getTime() - from.getTime()) / (1000 * 3600 * 24);
    if (diffDays >= 30) {
      this.alertService.showAndCloseAlertAfterXSecond('The date range must be less than 30 days.', 'red', 3000);
      return false;
    }

    return true;
  }

  renderSalesReportByDateChart(response: any) {
    let identifier = response.map((d: any) => d.identifier);
    let grossSales = response.map((d: any) => this.utilsService.roundNumber(d.grossSales));
    let netSales = response.map((d: any) => this.utilsService.roundNumber(d.netSales));
    let ordersCount = response.map((d: any) => d.ordersCount);

    let options = {
      chart: {
        type: "bar",
        height: "320px",
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: true,
        },
      },
      title: {
        text: "Sales By Date",
        align: "left",
        style: {
          fontSize: "16px",
          color: "#666"
        }
      },
      colors: ["#FDBA8C", "#31C48D","#1A56DB"],
      series: [
        {
          name: "Gross Sales",
          data: grossSales.map((d: any) => d),
        },
        {
          name: "Net Sales",
          data: netSales.map((d: any) => d),
        },
        {
          name: "Orders",
          data: ordersCount,
        },
      ],
      xaxis: {
        categories: identifier,
      },
      yaxis: [
        {
          seriesName: "Gross Sales",
          title: { text: "Sales Amount" },
          labels: {
            formatter: (value: number) => `$${value}`,
          },
        },
        {
          seriesName: "Gross Sales",
          show: false,
        },
        {
          opposite: true,
          title: { text: "Order Count" },
          labels: {
            formatter: (value: number) => `${value}`,
          },
        },
      ],
      tooltip: {
        y: [
          {
            formatter: (value: number) => `$${value}`,
          },
          {
            formatter: (value: number) => `$${value}`,
          },
          {
            formatter: (value: number) => `${value} orders`,
          },
        ],
      },
      fill: {
        opacity: 1,
      },
    }

    const chartElement = document.getElementById("salesReportChart");
    if(chartElement && typeof ApexCharts !== 'undefined') {
      if (this.chart) this.chart.destroy();

      this.chart = new ApexCharts(chartElement, options);
      this.chart.render();
    }
  }

  renderSalesReportByCategoryChart(response: any) {
    let identifier = response.map((d: any) => d.identifier);
    let grossSales = response.map((d: any) => this.utilsService.roundNumber(d.grossSales));
    // let netSales = response.map((d: any) => this.utilsService.roundNumber(d.netSales));
    // let productsCount = response.map((d: any) => d.productsCount);

    let options = {
      chart: {
        type: "pie",
        height: 420,
        width: "100%",
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: true,
        },
      },
      title: {
        text: "Sales By Category",
        align: "left",
        style: {
          fontSize: "16px",
          color: "#666"
        }
      },
      series: grossSales,
      labels: identifier,
      yaxis: {
        labels: {
          formatter: (value: number) => `$${value}`,
        },
      },
    }

    const chartElement = document.getElementById("salesReportChart");
    if(chartElement && typeof ApexCharts !== 'undefined') {
      if (this.chart) this.chart.destroy();

      this.chart = new ApexCharts(chartElement, options);
      this.chart.render();
    }
  }

  renderSalesReportByProductChart(response: any) {
    let identifier = response.map((d: any) => d.identifier);
    let grossSales = response.map((d: any) => this.utilsService.roundNumber(d.grossSales));
    let netSales = response.map((d: any) => this.utilsService.roundNumber(d.netSales));
    let productsCount = response.map((d: any) => d.productsCount);

    const chartElement = document.getElementById("salesReportChart");
    if(chartElement && typeof ApexCharts !== 'undefined') {
      if (this.chart) this.chart.destroy();
      
      let chartTableElement = $("#salesReportChart");
      let tableContent = '';
      for (let i = 0; i < identifier.length; i++) {
        tableContent += `
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              ${identifier[i]}
            </th>
            <td class="px-6 py-4">
              ${productsCount[i]}
            </td>
            <td class="px-6 py-4">
              ${grossSales[i]}
            </td>
            <td class="px-6 py-4">
              ${netSales[i]}
            </td>
          </tr>
        `;
      }

      const htmlTable = `
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <caption class="pb-4 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
            Sales By Product
          </caption>
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">
                Product
              </th>
              <th scope="col" class="px-6 py-3">
                Quantity
              </th>
              <th scope="col" class="px-6 py-3">
                Gross Sales
              </th>
              <th scope="col" class="px-6 py-3">
                Net Sales
              </th>
            </tr>
          </thead>
          <tbody>
            ${tableContent}
          </tbody>
        </table>
      `;

      chartTableElement.html(htmlTable);
    }
  }

  renderNoSales() {
    const html = `
      <h4 class="text-center pt-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">No sales this period.</h4>
    `;
    $("#salesReportChart").html(html);
  }

  showCustomDateRangeForm(groupBy: string) {
    $('#customDateRangeForm').removeClass('hidden');
    $('#customDateRangeForm button').attr('groupBy', groupBy);
  }

  hiddenCustomDateRangeForm() {
    $('#customDateRangeForm').addClass('hidden');
  }
}

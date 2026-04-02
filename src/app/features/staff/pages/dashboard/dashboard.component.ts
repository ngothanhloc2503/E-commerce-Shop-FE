import { Component } from '@angular/core';
import ApexCharts from 'apexcharts';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { NumberUtilService } from '../../../../shared/utils/number-util.service';
import { ReportService } from '../../services/report/report.service';
declare var $: any;

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  totalGrossSales = 0;
  totalNetSales = 0;
  avgGrossSales = 0;
  avgNetSales = 0;
  totalItemCount = 0;

  constructor(
    private reportService: ReportService,
    private alertService: AlertService,
    private numberUtil: NumberUtilService
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
          this.renderSalesReportByDateChart(response, this.getDenominator(period));
        }
      },
    });
  }

  getSalesReportByCategory(period: string) {
    this.hiddenCustomDateRangeForm();
    this.reportService.getReportDataByPeriod('category', period).subscribe({
      next: (response: any) => {
        if (response == null) {
          this.renderNoSales();
        } else {
          this.renderSalesReportByCategoryChart(response, this.getDenominator(period));
        }
      },
    });
  }

  getSalesReportByProduct(period: string) {
    this.hiddenCustomDateRangeForm();
    this.reportService.getReportDataByPeriod('product', period).subscribe({
      next: (response: any) => {
        if (response == null) {
          this.renderNoSales();
        } else {
          this.renderSalesReportByProductChart(response, this.getDenominator(period));
        }
      },
    });
  }

  getSalesReportByDateRange() {
    const groupBy = $('#customDateRangeForm button').attr('groupBy');
    const fromDate = $('#fromDate').val().trim();
    const toDate = $('#toDate').val().trim();

    if (!this.validateFromAndToDate()) return;

    this.reportService.getReportDataByDateRange(groupBy, fromDate, toDate).subscribe({
      next: (response: any) => {
        if (response.length === 0) {
          this.renderNoSales();
        } else {
          const from = new Date(fromDate);
          const to = new Date(toDate);
          const diffDays = (to.getTime() - from.getTime()) / (1000 * 3600 * 24);

          if (groupBy === 'date') {
            this.renderSalesReportByDateChart(response, diffDays);
          } else if (groupBy === 'category') {
            this.renderSalesReportByCategoryChart(response, diffDays);
          } else {
            this.renderSalesReportByProductChart(response, diffDays);
          }
        }
      },
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

  renderSalesReportByDateChart(response: any, denominator: number) {
    let identifier = response.map((d: any) => d.identifier);
    let grossSales = response.map((d: any) => this.numberUtil.round(d.grossSales));
    let netSales = response.map((d: any) => this.numberUtil.round(d.netSales));
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

    this.calculateTotalAmount(grossSales, netSales, ordersCount, denominator);
    $('thead .totalItemCount').text('Total Orders');
    $('.tableTotalAmount').removeClass('hidden');
  }

  renderSalesReportByCategoryChart(response: any, denominator: number) {
    let identifier = response.map((d: any) => d.identifier);
    let grossSales = response.map((d: any) => this.numberUtil.round(d.grossSales));
    let netSales = response.map((d: any) => this.numberUtil.round(d.netSales));
    let productsCount = response.map((d: any) => d.productsCount);

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

    this.calculateTotalAmount(grossSales, netSales, productsCount, denominator);
    $('thead .totalItemCount').text('Total Products');
    $('.tableTotalAmount').removeClass('hidden');
  }

  renderSalesReportByProductChart(response: any, denominator: number) {
    let identifier = response.map((d: any) => d.identifier);
    let grossSales = response.map((d: any) => this.numberUtil.round(d.grossSales));
    let netSales = response.map((d: any) => this.numberUtil.round(d.netSales));
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

    this.calculateTotalAmount(grossSales, netSales, productsCount, denominator);
    $('thead .totalItemCount').text('Total Products');
    $('.tableTotalAmount').removeClass('hidden');
  }

  renderNoSales() {
    const html = `
      <h4 class="text-center pt-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">No sales this period.</h4>
    `;
    $("#salesReportChart").html(html);

    $('.tableTotalAmount').addClass('hidden');
  }

  showCustomDateRangeForm(groupBy: string) {
    $('#customDateRangeForm').removeClass('hidden');
    $('#customDateRangeForm button').attr('groupBy', groupBy);
  }

  hiddenCustomDateRangeForm() {
    $('#customDateRangeForm').addClass('hidden');
  }

  getDenominator(period: string) {
    if (period == "last-7-days") return 7;
    if (period == "last-28-days") return 28;
    if (period == "last-6-months") return 6;
    if (period == "last-12-months") return 12;
    return 1;
  }

  calculateTotalAmount(grossSales: any, netSales: any, totalItem: any, denominator: number) {
    this.totalGrossSales = this.numberUtil.round(
      grossSales.reduce((accumulator: number, currentValue: number) => accumulator + currentValue));
    this.avgGrossSales = this.numberUtil.round(this.totalGrossSales / denominator);

    this.totalNetSales = this.numberUtil.round(
      netSales.reduce((accumulator: number, currentValue: number) => accumulator + currentValue));
    this.avgNetSales = this.numberUtil.round(this.totalNetSales / denominator);

    this.totalItemCount = totalItem.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
  }
}

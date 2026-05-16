import { Injectable, TemplateRef, createComponent, EnvironmentInjector } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalNotifier?: Subject<string>;
  private hostElement?: HTMLElement;

  constructor(private environmentInjector: EnvironmentInjector) {}

  open(content: TemplateRef<any>, options?: { title?: string }) {
    // 1. Tạo một thẻ div ảo làm nơi chứa Modal
    this.hostElement = document.createElement('div');
    document.body.appendChild(this.hostElement);

    // 2. Dùng createComponent gắn thẳng vào thẻ div ảo
    const componentRef = createComponent(ModalComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: this.hostElement,
    });

    // 3. Truyền dữ liệu vào Modal
    componentRef.instance.title = options?.title || 'Modal title';
    componentRef.instance.contentTemplate = content;

    // 4. Lắng nghe sự kiện đóng từ bên trong Modal
    componentRef.instance.closeEvent.subscribe(() => this.destroyModal());
    componentRef.instance.submitEvent.subscribe(() => {
      this.modalNotifier?.next('yes');
      this.destroyModal();
    });

    // 5. Báo cho Angular cập nhật giao diện (do tạo bằng code chứ không qua HTML)
    componentRef.changeDetectorRef.detectChanges();

    // 6. Khởi tạo Subject để trả về Observable cho component cha subscribe
    this.modalNotifier = new Subject<string>();
    return this.modalNotifier.asObservable();
  }

  private destroyModal() {
    this.modalNotifier?.complete(); // Close Observable
  
    if (this.hostElement) {
      this.hostElement.remove();
      this.hostElement = undefined;
    }
  }
}
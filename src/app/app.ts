import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppComponent {
  selectedProduct = '👕 მაისური';
  selectedColor = '#1E3B2B'; // Default Dark Green
  selectedSize = 'A4';
  basePrice = 18;
  uploadedImageUrl: string | null = null;
  activeTab = 'quick';
  
  // Order Form Data
  fullName = '';
  phone = '';
  address = '';
  email = '';
  promoCode = '';
  comment = '';
  
  // Modal state
  isOrderModalOpen = false;

  colors = [
    { name: 'ტყისფერი', hex: '#1E3B2B' },
    { name: 'თეთრი', hex: '#FFFFFF', border: true },
    { name: 'შავი', hex: '#0F172A' },
    { name: 'წითელი', hex: '#DC2626' },
    { name: 'ლურჯი', hex: '#2563EB' }
  ];

  selectProduct(name: string, price: number) {
    this.selectedProduct = name;
    this.basePrice = price;
  }

  selectColor(hex: string) {
    this.selectedColor = hex;
  }

  selectPrintSize(size: string) {
    this.selectedSize = size;
  }

  get finalPrice(): number {
    return this.selectedSize === 'A3' ? this.basePrice + 5 : this.basePrice;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearUploadedImage(event: Event) {
    event.stopPropagation();
    this.uploadedImageUrl = null;
  }

  submitOrder() {
    if (!this.fullName || !this.phone || !this.address) {
      alert('გთხოვთ შეავსოთ სავალდებულო ველები (*)');
      return;
    }
    this.isOrderModalOpen = true;
  }

  closeModal() {
    this.isOrderModalOpen = false;
    // Reset Form
    this.fullName = '';
    this.phone = '';
    this.address = '';
    this.email = '';
    this.promoCode = '';
    this.comment = '';
    this.uploadedImageUrl = null;
  }
}
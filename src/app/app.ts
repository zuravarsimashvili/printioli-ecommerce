import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  rating: number;
  releaseDate: string;
  image: string;
  reviewsCount: number;
}

export interface Review {
  id: number;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  cartItemId?: number;
  id: string;
  title: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  customNote?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  readonly BACKEND_URL = 'http://localhost:3000';
  readonly API_URL = 'http://localhost:3000/api';

  activePage: 'home' | 'studio' | 'details' | 'cart' | 'admin' = 'home';

  // კატალოგი და ფილტრები
  products: Product[] = [];
  allReviews: Review[] = [];
  searchQuery = '';
  selectedCategory = 'All';
  selectedBrand = 'All';
  maxPrice = 150;
  minRating = 0;
  cardSizes: Record<string, string> = {};

  // დეტალური გვერდი და რევიუს მოდალი
  selectedProduct: Product | null = null;
  detailSize = 'L';
  detailTab: 'details' | 'reviews' = 'details';
  isReviewModalOpen = false;
  reviewAuthor = '';
  reviewRating = 5;
  reviewComment = '';

  // 2D CUSTOM PRINT STUDIO
  studioGarment: 'tee' | 'hoodie' | 'tote' | 'mug' = 'tee';
  studioColor = '#141416';
  studioText = 'PRINTIOLI 26';
  studioTextColor = '#ffffff';
  studioFontSize = 22;
  studioVerticalPos = 46;
  studioSize = 'L';
  studioUploadedImage: string | null = null;

  readonly studioGarments = [
    { id: 'tee' as const, name: 'Classic Heavy Tee', price: 55 },
    { id: 'hoodie' as const, name: 'Urban Oversize Hoodie', price: 95 },
    { id: 'tote' as const, name: 'Minimal Canvas Tote', price: 32 },
    { id: 'mug' as const, name: 'Artisan Ceramic Mug', price: 25 }
  ];

  readonly studioColors = [
    { name: 'Onyx Black', hex: '#141416' },
    { name: 'Pure White', hex: '#f8fafc' },
    { name: 'Warm Sand', hex: '#e5dac3' },
    { name: 'Forest Sage', hex: '#374c42' },
    { name: 'Studio Indigo', hex: '#312e81' }
  ];

  // კალათა და შეკვეთის ფორმა
  cart: CartItem[] = [];
  checkoutName = '';
  checkoutEmail = '';
  checkoutPhone = '';
  checkoutAddress = '';

  // ავტორიზაცია
  user: User | null = null;
  token: string | null = null;
  isAuthModalOpen = false;
  authMode: 'login' | 'register' = 'login';
  authFirstName = '';
  authLastName = '';
  authEmail = '';
  authPassword = '';

  // ADMIN PANEL
  adminTab: 'products' | 'users' | 'orders' | 'reviews' = 'products';
  adminStats: any = { productsCount: 0, totalStock: 0, usersCount: 0, ordersCount: 0, revenue: 0, reviewsCount: 0 };
  adminUsers: User[] = [];
  adminOrders: any[] = [];
  editingProductId: string | null = null;
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  productForm = {
    title: '',
    description: '',
    price: 49,
    category: 'T-Shirts',
    brand: 'Printioli',
    stock: 15,
    releaseDate: new Date().toISOString().split('T')[0]
  };

  toastMessage = '';

  ngOnInit(): void {
    const savedToken = localStorage.getItem('printioli_token');
    const savedUser = localStorage.getItem('printioli_user');
    if (savedToken && savedUser) {
      this.token = savedToken;
      this.user = JSON.parse(savedUser);
      this.checkoutName = `${this.user!.firstName} ${this.user!.lastName}`;
      this.checkoutEmail = this.user!.email;
    }

    this.loadProducts();
    if (this.token) {
      this.loadServerCart();
      if (this.isAdmin) this.loadAdminData();
    } else {
      this.loadGuestCart();
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:') || imagePath.startsWith('http')) return imagePath;
    return `${this.BACKEND_URL}${imagePath}`;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  get categories(): string[] {
    return ['All', ...new Set(this.products.map(p => p.category))];
  }

  get brands(): string[] {
    return ['All', ...new Set(this.products.map(p => p.brand))];
  }

  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(this.searchQuery.trim().toLowerCase());
      const matchesCategory = this.selectedCategory === 'All' || p.category === this.selectedCategory;
      const matchesBrand = this.selectedBrand === 'All' || p.brand === this.selectedBrand;
      const matchesPrice = p.price <= this.maxPrice;
      const matchesRating = p.rating >= this.minRating;
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating;
    });
  }

  get selectedProductReviews(): Review[] {
    if (!this.selectedProduct) return [];
    return this.allReviews.filter(r => r.product_id === this.selectedProduct!.id);
  }

  get cartTotalCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartTotalPrice(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get currentStudioGarment() {
    return this.studioGarments.find(g => g.id === this.studioGarment) || this.studioGarments[0];
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.toastMessage === msg) {
        this.toastMessage = '';
        this.cdr.detectChanges();
      }
    }, 3200);
  }

  private getAuthHeaders(isJson = true): Record<string, string> {
    return {
      ...(isJson ? { 'Content-Type': 'application/json' } : {}),
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
    };
  }

  // ==================== მონაცემების ჩატვირთვა ====================

  async loadProducts(): Promise<void> {
    try {
      const res = await fetch(`${this.API_URL}/products`);
      const data = await res.json();
      this.products = data.products || [];
      this.allReviews = data.reviews || [];

      for (const p of this.products) {
        if (!this.cardSizes[p.id]) this.cardSizes[p.id] = 'L';
      }

      if (this.selectedProduct) {
        const updated = this.products.find(p => p.id === this.selectedProduct!.id);
        if (updated) this.selectedProduct = updated;
      }
      this.cdr.detectChanges();
    } catch {
      this.showToast('ბექენდი არ არის ჩართული (გაუშვით node server.js)');
    }
  }

  private loadGuestCart(): void {
    const raw = localStorage.getItem('printioli_guest_cart');
    this.cart = raw ? JSON.parse(raw) : [];
    this.cdr.detectChanges();
  }

  private saveGuestCart(): void {
    localStorage.setItem('printioli_guest_cart', JSON.stringify(this.cart));
    this.cdr.detectChanges();
  }

  async loadServerCart(): Promise<void> {
    if (!this.token) return;
    try {
      const res = await fetch(`${this.API_URL}/cart`, { headers: this.getAuthHeaders() });
      if (res.ok) {
        const serverItems: CartItem[] = await res.json();
        const customLocalItems = this.cart.filter(i => i.id.startsWith('custom-'));
        this.cart = [...serverItems, ...customLocalItems];
        this.cdr.detectChanges();
      }
    } catch {
      // ignore
    }
  }

  // ==================== ნავიგაცია & ფილტრები ====================

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.selectedBrand = 'All';
    this.maxPrice = 150;
    this.minRating = 0;
  }

  openProductDetails(product: Product): void {
    this.selectedProduct = product;
    this.detailSize = this.cardSizes[product.id] || 'L';
    this.detailTab = 'details';
    this.activePage = 'details';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== 2D CUSTOM PRINT STUDIO ====================

  onStudioGraphicUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.studioUploadedImage = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  addCustomStudioToCart(): void {
    const base = this.currentStudioGarment;
    const colorName = this.studioColors.find(c => c.hex === this.studioColor)?.name || this.studioColor;
    const customItem: CartItem = {
      id: 'custom-' + Date.now(),
      title: `Custom ${base.name}`,
      price: base.price,
      image: this.studioUploadedImage || '/uploads/tee-classic.svg',
      size: this.studioSize,
      quantity: 1,
      stock: 99,
      rating: 5.0,
      reviewsCount: 1,
      customNote: `ფერი: ${colorName} | ტექსტი: "${this.studioText || 'გრაფიკა'}"${this.studioUploadedImage ? ' + ატვირთული ლოგო' : ''}`
    };

    this.cart.push(customItem);
    if (!this.token) this.saveGuestCart();
    this.showToast(`თქვენი დიზაინი (${customItem.title}) დაემატა კალათაში!`);
    this.activePage = 'cart';
  }

  // ==================== კალათა & შეკვეთა (Guest + User) ====================

  async addToCart(product: Product, size = 'L'): Promise<void> {
    if (product.stock <= 0) {
      this.showToast('ნივთი ამოწურულია საწყობში');
      return;
    }

    if (this.token) {
      try {
        const res = await fetch(`${this.API_URL}/cart`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ product_id: product.id, size, quantity: 1 })
        });
        if (res.ok) {
          await this.loadServerCart();
          this.showToast(`„${product.title}“ (${size}) დაემატა კალათაში`);
        }
      } catch {
        this.showToast('კალათაში დამატება ვერ მოხერხდა');
      }
    } else {
      const existing = this.cart.find(i => i.id === product.id && i.size === size);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          size,
          quantity: 1,
          stock: product.stock,
          rating: product.rating,
          reviewsCount: product.reviewsCount
        });
      }
      this.saveGuestCart();
      this.showToast(`„${product.title}“ (${size}) დაემატა კალათაში`);
    }
  }

  async changeCartQuantity(item: CartItem, delta: number): Promise<void> {
    const newQty = item.quantity + delta;
    if (newQty > item.stock) {
      this.showToast(`საწყობში მხოლოდ ${item.stock} ერთეულია`);
      return;
    }

    if (this.token && item.cartItemId) {
      const res = await fetch(`${this.API_URL}/cart/${item.cartItemId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ quantity: newQty })
      });
      if (res.ok) await this.loadServerCart();
    } else {
      if (newQty <= 0) {
        this.cart = this.cart.filter(i => i !== item);
      } else {
        item.quantity = newQty;
      }
      if (!this.token) this.saveGuestCart();
      this.cdr.detectChanges();
    }
  }

  async removeCartItem(item: CartItem): Promise<void> {
    if (this.token && item.cartItemId) {
      const res = await fetch(`${this.API_URL}/cart/${item.cartItemId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        await this.loadServerCart();
        this.showToast('ნივთი წაიშალა კალათიდან');
      }
    } else {
      this.cart = this.cart.filter(i => i !== item);
      if (!this.token) this.saveGuestCart();
      this.showToast('ნივთი წაიშალა კალათიდან');
    }
  }

  async submitOrder(): Promise<void> {
    if (!this.checkoutName.trim() || !this.checkoutEmail.trim()) {
      this.showToast('შეიყვანეთ სახელი, გვარი და ელ.ფოსტა');
      return;
    }

    try {
      const res = await fetch(`${this.API_URL}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          customer_name: this.checkoutName,
          customer_email: this.checkoutEmail,
          customer_phone: this.checkoutPhone,
          shipping_address: this.checkoutAddress,
          items: this.cart
        })
      });
      const data = await res.json();
      if (res.ok) {
        this.cart = [];
        localStorage.removeItem('printioli_guest_cart');
        await this.loadProducts();
        if (this.isAdmin) await this.loadAdminData();
        this.showToast(data.message);
      } else {
        this.showToast(data.message || 'შეკვეთის შეცდომა');
      }
    } catch {
      this.showToast('სერვერთან კავშირი ვერ დამყარდა');
    }
  }

  // ==================== შეფასებები ====================

  openReviewModal(): void {
    this.reviewAuthor = this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
    this.reviewRating = 5;
    this.reviewComment = '';
    this.isReviewModalOpen = true;
  }

  async submitReview(): Promise<void> {
    if (!this.selectedProduct || !this.reviewAuthor.trim()) {
      this.showToast('შეიყვანეთ შემფასებლის სახელი და გვარი');
      return;
    }

    const res = await fetch(`${this.API_URL}/products/${this.selectedProduct.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_name: this.reviewAuthor,
        rating: this.reviewRating,
        comment: this.reviewComment
      })
    });

    if (res.ok) {
      this.isReviewModalOpen = false;
      this.detailTab = 'reviews';
      await this.loadProducts();
      this.showToast('შეფასება შეინახა SQL ბაზაში!');
    }
  }

  // ==================== ავტორიზაცია ====================

  async handleAuthSubmit(): Promise<void> {
    const endpoint = this.authMode === 'login' ? '/auth/login' : '/auth/register';
    const payload =
      this.authMode === 'login'
        ? { email: this.authEmail, password: this.authPassword }
        : { firstName: this.authFirstName, lastName: this.authLastName, email: this.authEmail, password: this.authPassword };

    try {
      const res = await fetch(`${this.API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        this.showToast(data.message || 'შეცდომა');
        return;
      }

      this.token = data.token;
      this.user = data.user;
      this.checkoutName = `${data.user.firstName} ${data.user.lastName}`;
      this.checkoutEmail = data.user.email;
      localStorage.setItem('printioli_token', data.token);
      localStorage.setItem('printioli_user', JSON.stringify(data.user));

      this.isAuthModalOpen = false;
      this.authPassword = '';
      await this.loadServerCart();
      if (this.isAdmin) await this.loadAdminData();
      this.showToast(`მოგესალმებით, ${data.user.firstName}!`);
    } catch {
      this.showToast('სერვერთან კავშირი ვერ დამყარდა');
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('printioli_token');
    localStorage.removeItem('printioli_user');
    this.loadGuestCart();
    if (this.activePage === 'admin') this.activePage = 'home';
    this.showToast('სისტემიდან გამოხვედით');
  }

  // ==================== ADMIN PANEL (FILE UPLOAD + CRUD) ====================

  openAdminPage(): void {
    if (!this.isAdmin) return;
    this.loadAdminData();
    this.activePage = 'admin';
  }

  async loadAdminData(): Promise<void> {
    if (!this.isAdmin) return;
    try {
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        fetch(`${this.API_URL}/admin/stats`, { headers: this.getAuthHeaders() }),
        fetch(`${this.API_URL}/admin/users`, { headers: this.getAuthHeaders() }),
        fetch(`${this.API_URL}/admin/orders`, { headers: this.getAuthHeaders() })
      ]);
      if (statsRes.ok) this.adminStats = await statsRes.json();
      if (usersRes.ok) this.adminUsers = await usersRes.json();
      if (ordersRes.ok) this.adminOrders = await ordersRes.json();
      this.cdr.detectChanges();
    } catch {
      // ignore
    }
  }

  onProductImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  editProduct(p: Product): void {
    this.editingProductId = p.id;
    this.selectedImageFile = null;
    this.imagePreviewUrl = this.getImageUrl(p.image);
    this.productForm = {
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      brand: p.brand,
      stock: p.stock,
      releaseDate: p.releaseDate
    };
  }

  cancelEditProduct(): void {
    this.editingProductId = null;
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.productForm = {
      title: '',
      description: '',
      price: 49,
      category: 'T-Shirts',
      brand: 'Printioli',
      stock: 15,
      releaseDate: new Date().toISOString().split('T')[0]
    };
  }

  async saveProduct(): Promise<void> {
    const formData = new FormData();
    formData.append('title', this.productForm.title);
    formData.append('description', this.productForm.description);
    formData.append('price', String(this.productForm.price));
    formData.append('category', this.productForm.category);
    formData.append('brand', this.productForm.brand);
    formData.append('stock', String(this.productForm.stock));
    formData.append('releaseDate', this.productForm.releaseDate);
    if (this.selectedImageFile) {
      formData.append('imageFile', this.selectedImageFile);
    }

    const isEdit = Boolean(this.editingProductId);
    const url = isEdit
      ? `${this.API_URL}/admin/products/${this.editingProductId}`
      : `${this.API_URL}/admin/products`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: this.getAuthHeaders(false),
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        this.showToast(data.message);
        this.cancelEditProduct();
        await this.loadProducts();
        await this.loadAdminData();
      } else {
        this.showToast(data.message || 'შეცდომა');
      }
    } catch {
      this.showToast('შენახვა ვერ მოხერხდა');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${this.API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (res.ok) {
      this.showToast('პროდუქტი წაიშალა SQL ბაზიდან');
      await this.loadProducts();
      await this.loadAdminData();
    }
  }

  async toggleUserRole(u: User): Promise<void> {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    const res = await fetch(`${this.API_URL}/admin/users/${u.id}/role`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      this.showToast(`როლი შეიცვალა: ${newRole}`);
      await this.loadAdminData();
    }
  }

  async deleteUser(id: number): Promise<void> {
    const res = await fetch(`${this.API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    this.showToast(data.message);
    if (res.ok) await this.loadAdminData();
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    const res = await fetch(`${this.API_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      this.showToast('შეკვეთის სტატუსი განახლდა');
      await this.loadAdminData();
    }
  }

  async deleteReview(id: number): Promise<void> {
    const res = await fetch(`${this.API_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (res.ok) {
      this.showToast('შეფასება წაიშალა');
      await this.loadProducts();
      await this.loadAdminData();
    }
  }
}
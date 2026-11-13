import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  brand: string;
  issueDate: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  description: string;
  fabric: string;
  technology: string;
  fit: string;
  care: string;
  sizes: string[];
  printPlacements: string[];
  images: string[];
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  printPlacement: string;
  quantity: number;
}

export interface PrintPreset {
  id: string;
  name: string;
  text: string;
  color: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    _id: 'pr-101',
    title: 'NEO-TBILISI Heavyweight Studio Tee',
    price: 68,
    category: 'მაისურები',
    brand: 'Printioli Atelier',
    issueDate: '2026-03-20',
    stock: 12,
    rating: 4.9,
    reviewsCount: 28,
    badge: 'STUDIO EDITION',
    description:
      'პრემიუმ ოვერსაიზ ჭრის მაისური თბილისის ნეონური არქიტექტურის ილუსტრაციით. დამზადებულია 240 GSM ორგანული სავარცხლიანი ბამბისგან. ბეჭდვა შესრულებულია იაპონური Kornit HD DTG ტექნოლოგიით.',
    fabric: '100% ორგანული სავარცხლიანი ბამბა (240 GSM)',
    technology: 'Kornit HD Direct-to-Garment (DTG)',
    fit: 'Apple Oversized Fit (შეკერილი კალიბრაცია)',
    care: 'ნაზი რეცხვა 30°C-ზე, შიგნითა მხრიდან. არ გამოიყენოთ საშრობი.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    printPlacements: ['წინ (მკერდზე)', 'ზურგზე', 'მკერდი + ზურგი'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    _id: 'pr-102',
    title: 'THINK DIFFERENT Minimalist Typography Tee',
    price: 55,
    category: 'მაისურები',
    brand: 'Jobs Monogram',
    issueDate: '2026-02-14',
    stock: 19,
    rating: 4.8,
    reviewsCount: 16,
    badge: 'MINIMALIST',
    description:
      'მინიმალისტური ტიპოგრაფიული დიზაინი შემოქმედებისთვის. Acid-wash დამუშავება აძლევს უნიკალურ, დროისგან დამოუკიდებელ იერსახეს.',
    fabric: '95% ბამბა, 5% ელასტანი (220 GSM)',
    technology: 'Soft-Touch Screen Printing',
    fit: 'Regular Fit (სტანდარტული ჭრა)',
    care: 'რეცხვა 30-40°C-ზე. დაუთოება დაბალ ტემპერატურაზე.',
    sizes: ['S', 'M', 'L', 'XL'],
    printPlacements: ['წინ (მკერდზე)', 'ზურგზე'],
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    _id: 'pr-103',
    title: 'KATANA SPIRIT Obsidian Graphic Tee',
    price: 62,
    category: 'მაისურები',
    brand: 'Printioli Atelier',
    issueDate: '2026-01-28',
    stock: 5,
    rating: 4.9,
    reviewsCount: 31,
    badge: 'LIMITED RELEASE',
    description:
      'იაპონური ტრადიციული ილუსტრაციისა და თანამედროვე ქუჩის სტილის სინთეზი. დიდი ზომის დეტალური პრინტი ზურგზე.',
    fabric: '100% Heavy Premium Cotton (250 GSM)',
    technology: 'Hybrid DTG + Screen Print',
    fit: 'Relaxed Boxy Fit',
    care: 'გადააბრუნეთ რეცხვის წინ. არ დააუთოოთ უშუალოდ პრინტზე.',
    sizes: ['M', 'L', 'XL', 'XXL'],
    printPlacements: ['ზურგზე', 'მკერდი + ზურგი'],
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    _id: 'pr-104',
    title: 'GEORGIA MONOGRAM Line Art Tee',
    price: 48,
    category: 'მაისურები',
    brand: 'Vintage Raw',
    issueDate: '2026-04-02',
    stock: 28,
    rating: 4.7,
    reviewsCount: 11,
    badge: 'ECO-LUXURY',
    description:
      'დახვეწილი ხაზოვანი მონოგრამა მკერდზე. დამზადებულია ეკოლოგიურად სუფთა წყლის ბაზაზე დამზადებული საღებავებით.',
    fabric: '100% GOTS Certified Eco-Cotton (200 GSM)',
    technology: 'Water-based Eco Ink',
    fit: 'Standard Fit',
    care: 'ნაზი რეცხვა ცივ წყალში.',
    sizes: ['S', 'M', 'L', 'XL'],
    printPlacements: ['წინ (მკერდზე)'],
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    _id: 'pr-105',
    title: 'ZERO BUGS Heavyweight Fleece Hoodie',
    price: 110,
    category: 'ჰუდები',
    brand: 'Oversize Atelier',
    issueDate: '2026-03-05',
    stock: 8,
    rating: 5.0,
    reviewsCount: 42,
    badge: 'BESTSELLER',
    description:
      'სქელი, ორფენიანი ქუდიანი ჰუდი რბილი ფლისის შიდა შრით. ემბლემა შესრულებულია მაღალი სიმკვრივის ქარგვით.',
    fabric: '85% Organic Cotton, 15% Recycled Fleece (360 GSM)',
    technology: 'High-density Embroidery & Print',
    fit: 'Heavy Oversized Fit',
    care: 'რეცხვა 30°C-ზე. არ გააშროთ მზის პირდაპირ სხივებზე.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    printPlacements: ['წინ (მკერდზე)', 'ზურგზე'],
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    _id: 'pr-106',
    title: 'RETRO SUNSET Cyberpunk Oversize Tee',
    price: 59,
    category: 'მაისურები',
    brand: 'Printioli Atelier',
    issueDate: '2026-02-25',
    stock: 14,
    rating: 4.8,
    reviewsCount: 18,
    badge: 'CYBERPUNK',
    description:
      '80-იანი წლების სინთვეივ ესთეტიკა ჩამოშლილი მხრების ჭრით (Drop Shoulder). კაშკაშა ნეონური გრადიენტი.',
    fabric: '100% Ultra Soft Cotton (230 GSM)',
    technology: 'High-Density DTG',
    fit: 'Drop Shoulder Fit',
    care: 'ნაზი რეცხვა 30°C-ზე.',
    sizes: ['S', 'M', 'L', 'XL'],
    printPlacements: ['წინ (მკერდზე)'],
    images: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    _id: 'pr-107',
    title: 'CYBER DRAGON Pixel Art Fleece Hoodie',
    price: 115,
    category: 'ჰუდები',
    brand: 'Oversize Atelier',
    issueDate: '2026-03-18',
    stock: 6,
    rating: 4.9,
    reviewsCount: 29,
    badge: 'NEW ARRIVAL',
    description:
      'პიქსელ არტის სტილში შესრულებული კიბერ დრაკონის პრინტი. კომფორტული კენგურუს ჯიბითა და სქელი შნურებით.',
    fabric: '80% Heavy Cotton, 20% Polyester (340 GSM)',
    technology: 'Thermal Transfer & Silk Screen',
    fit: 'Relaxed Fit',
    care: 'რეცხვა 30°C-ზე.',
    sizes: ['M', 'L', 'XL', 'XXL'],
    printPlacements: ['ზურგზე'],
    images: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    _id: 'pr-108',
    title: 'TBILISI URBAN Eco Canvas Tote Bag',
    price: 35,
    category: 'ეკო-ჩანთები',
    brand: 'Vintage Raw',
    issueDate: '2026-01-10',
    stock: 35,
    rating: 4.9,
    reviewsCount: 15,
    badge: 'ESSENTIAL',
    description:
      'სქელი 340 GSM ტილოს (Canvas) ეკო-ჩანთა თბილისის ილუსტრაციით. გაძლიერებული სახელურებითა და შიდა ელვა-ჯიბით.',
    fabric: '100% Recycled Cotton Canvas (340 GSM)',
    technology: 'Silk Screen Print',
    fit: 'One Size (40x42 cm)',
    care: 'ხელით რეცხვა ცივ წყალში.',
    sizes: ['One Size'],
    printPlacements: ['ცენტრალური პრინტი'],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
    ]
  }
];

const INITIAL_REVIEWS: Record<string, Review[]> = {
  'pr-101': [
    {
      id: 'r1',
      name: 'გიორგი ბერიძე',
      rating: 5,
      comment:
        'ქსოვილის ხარისხი არის წარმოუდგენლად კარგი! 240 GSM ნამდვილად იგრძნობა, პრინტი რეცხვის შემდეგაც კი ახალივითაა.',
      date: '2026-03-22',
      verified: true
    },
    {
      id: 'r2',
      name: 'ნინო კაპანაძე',
      rating: 5,
      comment:
        'ოვერსაიზ ჭრა ზუსტად ისეთია, როგორსაც ვეძებდი. შეკვეთა მეორე დღესვე მომიტანეს.',
      date: '2026-03-21',
      verified: true
    }
  ],
  'pr-102': [
    {
      id: 'r3',
      name: 'დავით მახარაძე',
      rating: 5,
      comment: 'Acid-wash ფერი ძალიან უნიკალურია. კოდირებისას საუკეთესო კომფორტია.',
      date: '2026-02-18',
      verified: true
    }
  ],
  'pr-103': [
    {
      id: 'r4',
      name: 'სანდრო წერეთელი',
      rating: 5,
      comment: 'ზურგის პრინტის დეტალიზაცია არის 10/10. ანიმეს მოყვარულებისთვის სუპერ ნივთია.',
      date: '2026-02-05',
      verified: true
    }
  ]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  private readonly API_URL = 'https://api.everrest.educata.dev';

  // Navigation State: 'catalog' | 'detail' | 'studio' | 'cart'
  activePage: 'catalog' | 'detail' | 'studio' | 'cart' = 'catalog';
  selectedProductId = 'pr-101';

  // Products & API
  products: Product[] = [...INITIAL_PRODUCTS];
  loading = false;

  // User Authentication
  user: { name: string; email: string } | null = null;
  token: string | null = null;
  isLoginOpen = false;
  isRegisterOpen = false;
  authEmail = '';
  authPassword = '';
  authName = '';

  // Cart Management
  cart: CartItem[] = [];

  // Review Management
  reviewsMap: Record<string, Review[]> = { ...INITIAL_REVIEWS };
  activeTab: 'details' | 'review' = 'details';
  isReviewModalOpen = false;
  newRating = 5;
  newReviewerName = '';
  newReviewComment = '';

  // Filtering & Search Controls
  searchQuery = '';
  selectedCategory = 'All';
  selectedBrand = 'All';
  maxPrice = 150;
  minRating = 0;
  sortBy = 'popular';
  mobileFilterOpen = false;

  // Product Detail Selection
  selectedSize = 'L';
  selectedPlacement = 'წინ (მკერდზე)';

  // Custom Studio Canvas Controls
  printPresets: PrintPreset[] = [
    { id: 'p1', name: 'Cyber Tbilisi', text: 'TBILISI // 2026', color: '#3B82F6' },
    { id: 'p2', name: 'Think Different', text: 'THINK CANVAS', color: '#F59E0B' },
    { id: 'p3', name: 'Georgian Monogram', text: 'პრინტიოლი • 100% ORGANIC', color: '#10B981' },
    { id: 'p4', name: 'Minimal Line', text: 'LESS IS MORE', color: '#EC4899' }
  ];
  shirtColors = [
    { name: 'Obsidian', hex: '#000000' },
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Slate', hex: '#3F3F46' },
    { name: 'Navy', hex: '#1E293B' }
  ];
  studioColor = '#000000';
  studioText = 'THINK CANVAS';
  studioPreset: PrintPreset = this.printPresets[1];
  studioSize = 'L';

  // Promo Code & Checkout Modals
  couponInput = '';
  appliedDiscount = 0;
  toastMessage: string | null = null;
  isCheckoutOpen = false;

  ngOnInit(): void {
    this.syncWithEverrestApi();
  }

  // Everrest API ინტეგრაცია
  async syncWithEverrestApi(): Promise<void> {
    try {
      const res = await fetch(`${this.API_URL}/shop/products/all?page_index=1&page_size=10`);
      if (res.ok) {
        const data = await res.json();
        if (data?.products?.length) {
          this.products = this.products.map((p, i) => ({
            ...p,
            _id: data.products[i % data.products.length]._id || p._id
          }));
        }
      }
    } catch {
      // Fallback აქტიურია
    }
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      if (this.toastMessage === msg) {
        this.toastMessage = null;
      }
    }, 3200);
  }

  get categories(): string[] {
    return ['All', ...Array.from(new Set(this.products.map(p => p.category)))];
  }

  get brands(): string[] {
    return ['All', ...Array.from(new Set(this.products.map(p => p.brand)))];
  }

  get filteredProducts(): Product[] {
    const list = this.products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategory === 'All' || product.category === this.selectedCategory;
      const matchesBrand = this.selectedBrand === 'All' || product.brand === this.selectedBrand;
      const matchesPrice = product.price <= this.maxPrice;
      const matchesRating = product.rating >= this.minRating;
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating;
    });

    if (this.sortBy === 'rating') {
      return [...list].sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }

  get selectedProduct(): Product {
    return this.products.find(p => p._id === this.selectedProductId) || this.products[0];
  }

  get selectedProductReviews(): Review[] {
    return this.reviewsMap[this.selectedProductId] || [];
  }

  get cartTotalCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  get cartTotalPrice(): number {
    return this.cartSubtotal * (1 - this.appliedDiscount);
  }

  get shippingProgressWidth(): number {
    return Math.min(100, (this.cartTotalPrice / 60) * 100);
  }

  get finalCheckoutTotal(): number {
    return Math.round(this.cartTotalPrice + (this.cartTotalPrice >= 60 ? 0 : 5));
  }

  openDetail(product: Product): void {
    this.selectedProductId = product._id;
    this.selectedSize = product.sizes[0] || 'L';
    this.selectedPlacement = product.printPlacements[0] || 'წინ (მკერდზე)';
    this.activeTab = 'details';
    this.activePage = 'detail';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // კალათაში დამატება (ავტორიზაციის შემოწმებით PDF მოთხოვნის შესაბამისად)
  addToCart(product: Product, size = 'L', placement = 'წინ (მკერდზე)', qty = 1): void {
    if (!this.user) {
      this.isLoginOpen = true;
      this.showToast('კალათაში დასამატებლად გაიარეთ ავტორიზაცია');
      return;
    }

    const existing = this.cart.find(
      item =>
        item.product._id === product._id &&
        item.size === size &&
        item.printPlacement === placement
    );

    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + qty);
    } else {
      this.cart.push({
        product,
        size,
        printPlacement: placement,
        quantity: Math.min(product.stock, qty)
      });
    }

    // Everrest API cart sync
    if (this.token) {
      fetch(`${this.API_URL}/shop/cart/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({ id: product._id, quantity: 1 })
      }).catch(() => {});
    }

    this.showToast(`"${product.title}" (${size}) დაემატა კალათაში`);
  }

  addCustomStudioToCart(): void {
    const customProduct: Product = {
      _id: `custom-${Date.now()}`,
      title: `Bespoke Studio Tee (${this.studioPreset.name})`,
      price: 75,
      category: 'მაისურები',
      brand: 'Printioli Studio',
      issueDate: '2026-11-13',
      stock: 10,
      rating: 5.0,
      reviewsCount: 1,
      description: `ინდივიდუალური დიზაინი: "${this.studioText}"`,
      fabric: '100% ორგანული ბამბა (240 GSM)',
      technology: 'Kornit HD DTG',
      fit: 'Apple Oversized Fit',
      care: 'ნაზი რეცხვა 30°C-ზე.',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      printPlacements: ['Custom Studio Print'],
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'
      ]
    };
    this.addToCart(customProduct, this.studioSize, `Custom: "${this.studioText}"`, 1);
  }

  updateCartQuantity(item: CartItem, newQty: number): void {
    if (newQty <= 0) {
      this.removeFromCart(item);
      return;
    }
    item.quantity = Math.min(item.product.stock, newQty);
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(
      c =>
        !(
          c.product._id === item.product._id &&
          c.size === item.size &&
          c.printPlacement === item.printPlacement
        )
    );
    this.showToast('ნივთი წაიშალა კალათიდან');
  }

  getCartItemReviewsCount(product: Product): number {
    return product.reviewsCount + (this.reviewsMap[product._id]?.length || 0);
  }

  // ავტორიზაცია (Everrest API + Fallback)
  async handleLogin(): Promise<void> {
    if (!this.authEmail || !this.authPassword) {
      this.showToast('გთხოვთ შეავსოთ ელ.ფოსტა და პაროლი');
      return;
    }

    try {
      const res = await fetch(`${this.API_URL}/auth/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.authEmail, password: this.authPassword })
      });
      if (res.ok) {
        const data = await res.json();
        this.token = data.access_token || null;
      }
    } catch {}

    const name = this.authName || this.authEmail.split('@')[0];
    this.user = { name, email: this.authEmail };
    this.isLoginOpen = false;
    this.authEmail = '';
    this.authPassword = '';
    this.showToast(`მოგესალმებით, ${name}!`);
  }

  // რეგისტრაცია (Everrest API + Fallback)
  async handleRegister(): Promise<void> {
    if (!this.authEmail || !this.authPassword || !this.authName) {
      this.showToast('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    const parts = this.authName.trim().split(' ');
    try {
      await fetch(`${this.API_URL}/auth/sign_up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: parts[0],
          lastName: parts[1] || 'User',
          age: 22,
          email: this.authEmail,
          password: this.authPassword,
          address: 'Tbilisi',
          phone: '+995555123456',
          zipcode: '0101',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Printioli',
          gender: 'MALE'
        })
      });
    } catch {}

    this.user = { name: this.authName, email: this.authEmail };
    this.isRegisterOpen = false;
    this.authEmail = '';
    this.authPassword = '';
    this.authName = '';
    this.showToast(`ანგარიში შექმნილია! მოგესალმებით, ${this.user.name}!`);
  }

  handleLogout(): void {
    this.user = null;
    this.token = null;
    this.showToast('თქვენ გამოხვედით სისტემიდან');
  }

  // შეფასების დამატება (Rating + სახელი გვარი + OK)
  handleAddReview(): void {
    const reviewerName = this.newReviewerName.trim() || (this.user ? this.user.name : 'სტუმარი');
    if (!this.newReviewComment.trim()) {
      this.showToast('გთხოვთ ჩაწეროთ კომენტარი');
      return;
    }

    const newRevObj: Review = {
      id: `rev-${Date.now()}`,
      name: reviewerName,
      rating: Number(this.newRating),
      comment: this.newReviewComment,
      date: new Date().toISOString().split('T')[0],
      verified: true
    };

    const currentList = this.reviewsMap[this.selectedProductId] || [];
    this.reviewsMap[this.selectedProductId] = [newRevObj, ...currentList];

    // საშუალო რეიტინგის და რაოდენობის ავტომატური განახლება
    this.products = this.products.map(p => {
      if (p._id === this.selectedProductId) {
        const totalCount = p.reviewsCount + 1;
        const currentSum = p.rating * p.reviewsCount;
        const newAvg = Number(((currentSum + this.newRating) / totalCount).toFixed(1));
        return { ...p, rating: newAvg, reviewsCount: totalCount };
      }
      return p;
    });

    if (this.token) {
      fetch(`${this.API_URL}/shop/products/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({
          productId: this.selectedProductId,
          rate: Number(this.newRating)
        })
      }).catch(() => {});
    }

    this.isReviewModalOpen = false;
    this.activeTab = 'review';
    this.newReviewComment = '';
    this.newReviewerName = '';
    this.newRating = 5;
    this.showToast('შეფასება წარმატებით დაემატა!');
  }

  applyPromo(): void {
    if (this.couponInput.trim().toUpperCase() === 'PRINTIOLI20') {
      this.appliedDiscount = 0.2;
      this.showToast("პრომო კოდი 'PRINTIOLI20' გააქტიურებულია! (-20%)");
    } else {
      this.showToast('არასწორი პრომო კოდი');
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.selectedBrand = 'All';
    this.maxPrice = 150;
    this.minRating = 0;
    this.sortBy = 'popular';
  }

  selectPreset(p: PrintPreset): void {
    this.studioPreset = p;
    this.studioText = p.text;
  }

  completeCheckout(): void {
    this.cart = [];
    this.isCheckoutOpen = false;
    this.activePage = 'catalog';
    this.showToast('შეკვეთა წარმატებით გაფორმდა!');
  }
}
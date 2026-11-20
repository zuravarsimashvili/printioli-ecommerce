# Printioli Studio — Full-Stack E-Commerce & 2D Custom Print Platform

სრულფასოვანი ონლაინ მაღაზია და ინტერაქტიული 2D პრინტ-სტუდია, აგებული **Angular**-ის ფრონტენდსა და **Node.js / Express / SQLite** რელაციურ ბექენდზე.

## ტექნოლოგიური სტეკი
- **Frontend:** Angular (Standalone Components, Reactive State, Custom CSS)
- **Backend:** Node.js, Express.js, JWT Authentication, Multer (ლოკალური ფაილების ატვირთვა)
- **Database:** SQLite3 (`backend/printioli.db`) — 6 რელაციური ცხრილი `FOREIGN KEY` კავშირებით

## SQL მონაცემთა ბაზის სტრუქტურა
1. `users` — მომხმარებლები და როლები (`admin`, `user`)
2. `products` — პროდუქტების კატალოგი, მარაგები (`stock`) და ატვირთული ფოტოები (`/uploads/...`)
3. `reviews` — პროდუქტის შეფასებები (`1:N` კავშირი `products` ცხრილთან, ავტომატური `AVG(rating)` გადათვლით)
4. `cart_items` — ავტორიზებული მომხმარებლის კალათა (`INNER JOIN` პროდუქტებთან)
5. `orders` — გაფორმებული შეკვეთები (მხარს უჭერს როგორც რეგისტრირებულ, ისე სტუმარ მომხმარებელს)
6. `order_items` — შეკვეთის დეტალური პოზიციები და Custom Studio-ს დიზაინის პარამეტრები

## გაშვების ინსტრუქცია
1. **ბექენდი:**
   ```bash
   cd backend
   npm install
   node server.js
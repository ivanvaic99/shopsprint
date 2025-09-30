# ShopSprint – E‑commerce Storefront (Mock)

ShopSprint is a mock e‑commerce SPA that demonstrates product browsing, a simple shopping cart, checkout and order management – all without a backend. Products are defined statically and orders are persisted in `localStorage` so the app works offline.

## Live Demo

The live site will be hosted at:

```
https://ivanvaic99.github.io/shopsprint/
```

![ShopSprint desktop](./screenshots/shopsprint/shopsprint_home_desktop_1440x900.png)

## Features

* **Product catalogue** – Browse a handful of sample products with search and category filters.
* **Product details** – Click on a product to view more information and add it to your cart.
* **Cart and checkout** – Adjust quantities, remove items and fill out a simple form to complete your purchase.
* **Order generation** – Each order generates a unique ID and is saved to localStorage along with customer details and items.
* **Order history** – View past orders and export them as CSV for record keeping.
* **Offline capable** – Everything is stored locally so the app functions without a network.

## Tech Stack

| Category    | Libraries / Tools               |
|-----------:|----------------------------------|
| Framework   | React 18                         |
| Styling     | TailwindCSS                      |
| State       | React Hooks (useState)           |
| Persistence | localStorage                     |
| Build       | Vite                             |
| Deployment  | GitHub Pages + Actions         |

## Getting Started

Install dependencies and run the development server:

```sh
npm install
npm run dev
```

Build for production:

```sh
npm run build
```

## Orders CSV Format

Exported orders include the header `id,total,date,name,email,address,items` where `items` contains a pipe‑separated list of product‑ID/quantity pairs (e.g. `p1:2|p3:1`).

## License

Released under the MIT License.
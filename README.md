# FreshTrack Pro – Advanced Product Expiry Tracker

A sophisticated, dashboard-style React application for professional product inventory management with real-time statistics, advanced filtering, and modern UI/UX design.

<div align="center">

![FreshTrack Pro Dashboard](https://img.shields.io/badge/Dashboard-Modern%20UI-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## ✨ Key Features

### 🎯 **Dashboard Overview**
- **Real-time Statistics**: Live counters for total, fresh, expiring, and expired products
- **Visual Status Cards**: Color-coded statistics with animated hover effects
- **Quick Insights**: Instant overview of your inventory health

### 🔍 **Advanced Product Management**
- **Smart Search**: Real-time filtering across all products
- **Status Filtering**: Filter by Fresh, Expiring Soon, or Expired status
- **Card-based Display**: Modern product cards with visual status indicators
- **Inline Editing**: Double-click to edit product names or expiry dates

### 🎨 **Modern Interface Design**
- **Sidebar Navigation**: Professional dashboard layout with smooth animations
- **Glass-morphism UI**: Premium frosted glass effects throughout
- **Dark Theme**: Sophisticated dark gradient backgrounds with accent colors
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices

### 🔔 **Smart Notifications**
- **Browser Notifications**: Native browser alerts for expiring products
- **No Backend Required**: All notifications work client-side
- **Customizable Settings**: Toggle notifications on/off with modern switches

### 🚀 **Enhanced User Experience**
- **Autocomplete**: Smart suggestions for 90+ common products
- **Accessibility**: Full keyboard navigation and screen reader support
- **Professional Animations**: Smooth transitions and hover effects
- **Status Badges**: Color-coded badges with icons for each product status

---

## 🖥️ Interface Highlights

- **📊 Statistics Dashboard**: Visual overview of your inventory
- **🔍 Advanced Search Bar**: Real-time product filtering
- **📱 Responsive Grid Layout**: Adapts to any screen size
- **⚡ Quick Add Form**: Streamlined product addition
- **🎛️ Settings Panel**: Modern notification preferences
- **💫 Animated Interactions**: Professional hover and transition effects

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 14+ and npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Skumarbn/products-expiry-tracker.git
   cd products-expiry-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   
4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📱 Usage Guide

### Adding Products
1. Use the **Quick Add** form in the dashboard
2. Type product name (autocomplete will suggest common items)
3. Select expiry date
4. Click **"Add Product"** button

### Managing Products
- **Search**: Use the search bar to filter products instantly
- **Filter by Status**: Use the dropdown to show specific status types
- **Edit Products**: Double-click any product name or date to edit inline
- **Delete Products**: Click the delete button on any product card

### Enabling Notifications
1. Navigate to **Settings** in the sidebar
2. Toggle **"Get notified before products expire"**
3. Click **"Enable Notifications"** when prompted by browser
4. Receive alerts 3 days before expiry

### Dashboard Navigation
- **Dashboard**: Overview with statistics and recent activity
- **Products**: Full product management interface
- **Analytics**: Visual insights (future feature)
- **Settings**: Notification preferences and app settings

---

## 🏗️ Build for Production

```bash
# Create optimized production build
npm run build

# Serve locally to test production build
npx serve -s build
```

---

## 🧪 Testing

```bash
# Run test suite
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3b82f6 → #8b5cf6)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Background**: Dark slate gradients

### Typography
- **Font Family**: Inter, system fonts
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Layout
- **Sidebar**: 280px fixed navigation
- **Grid System**: CSS Grid with responsive breakpoints
- **Spacing**: 8px base unit system

---

## 🧑‍💻 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI Framework |
| **FontAwesome** | 6.4.0 | Icons & Visual Elements |
| **CSS Grid/Flexbox** | - | Layout System |
| **CSS Custom Properties** | - | Theming & Variables |
| **Browser APIs** | - | Notifications & Storage |

---

## 📂 Project Structure

```
src/
├── App.js              # Main application component
├── App.css             # Dashboard styles & layout
├── index.js            # React entry point
├── index.css           # Global styles & theme
└── assets/             # Static assets
```

---

## 🌟 Features Roadmap

- [ ] **Data Export**: CSV/JSON export functionality
- [ ] **Bulk Operations**: Select and manage multiple products
- [ ] **Advanced Analytics**: Charts and insights dashboard
- [ ] **Categories**: Product categorization system
- [ ] **Barcode Scanning**: Mobile barcode integration
- [ ] **Cloud Sync**: Optional cloud backup
- [ ] **Team Collaboration**: Multi-user support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📬 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Skumarbn/products-expiry-tracker/issues)
- **Email**: [support@freshtrackpro.com](mailto:support@freshtrackpro.com)
- **Documentation**: See README and inline code comments

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FontAwesome** for beautiful icons
- **React Community** for excellent tooling
- **Modern CSS** techniques for glassmorphism effects
- **Open Source Community** for inspiration and resources

---

<div align="center">

**Made with ❤️ by [Skumarbn](https://github.com/Skumarbn)**

*FreshTrack Pro - Transforming inventory management with modern design*

</div>
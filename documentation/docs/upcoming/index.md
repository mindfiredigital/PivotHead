---
title: Upcoming Features
description: What's coming next in PivotHead - exciting features in development
keywords: [roadmap, upcoming, features, angular, high-volume, performance]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# **What's New & Coming Soon**

<div style={{
  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  color: 'white',
  textAlign: 'center',
  marginBottom: '2rem',
  animation: 'fadeIn 0.6s ease-in'
}}>
  <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '2rem' }}> Current Version: v2.0</h2>
  <p style={{ fontSize: '1.2rem', margin: 0, opacity: 0.95 }}>Major feature release with powerful new capabilities!</p>
</div>

---

<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
  gap: '1.5rem',
  marginTop: '2rem' 
}}>

{/_ Feature Card 1 _/}

<div style={{
  background: 'linear-gradient(135deg, #fecaca 0%, #f87171 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  color: '#991b1b',
  boxShadow: '0 10px 30px rgba(248, 113, 113, 0.3)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden'
}} 
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-8px)';
  e.currentTarget.style.boxShadow = '0 20px 40px rgba(248, 113, 113, 0.4)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 10px 30px rgba(248, 113, 113, 0.3)';
}}>
  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
  <h3 style={{ color: '#991b1b', marginBottom: '0.75rem', fontSize: '1.5rem' }}>Advanced Filtering</h3>
  <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0, opacity: 0.95 }}>
    Apply custom filters to your data with an intuitive UI. Filter by any field, combine conditions, and see instant results!
  </p>
  <div style={{
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600'
  }}>
    ✓ Core • WebComponent • React • Vue
  </div>
</div>

{/_ Feature Card 2 _/}

<div style={{
  background: 'linear-gradient(135deg, #fecaca 0%, #f87171 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  color: '#991b1b',
  boxShadow: '0 10px 30px rgba(248, 113, 113, 0.3)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden'
}} 
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-8px)';
  e.currentTarget.style.boxShadow = '0 20px 40px rgba(248, 113, 113, 0.4)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 10px 30px rgba(248, 113, 113, 0.3)';
}}>
  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
  <h3 style={{ color: '#991b1b', marginBottom: '0.75rem', fontSize: '1.5rem' }}>File Upload & Import</h3>
  <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0, opacity: 0.95 }}>
    Upload CSV or JSON files and watch your data instantly populate the pivot table. Drag & drop or browse!
  </p>
  <div style={{
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600'
  }}>
    ✓ CSV & JSON Support
  </div>
</div>

{/_ Feature Card 3 _/}

<div style={{
  background: 'linear-gradient(135deg, #fecaca 0%, #f87171 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  color: '#991b1b',
  boxShadow: '0 10px 30px rgba(248, 113, 113, 0.3)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden'
}} 
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-8px)';
  e.currentTarget.style.boxShadow = '0 20px 40px rgba(248, 113, 113, 0.4)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 10px 30px rgba(248, 113, 113, 0.3)';
}}>
  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
  <h3 style={{ color: '#991b1b', marginBottom: '0.75rem', fontSize: '1.5rem' }}>Export Anywhere</h3>
  <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0, opacity: 0.95 }}>
    Export your pivot tables to PDF, Excel, or HTML with one click. Perfect formatting, ready to share!
  </p>
  <div style={{
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600'
  }}>
    ✓ PDF • Excel • HTML
  </div>
</div>

</div>

---

## **Feature Highlights**

<Tabs>
<TabItem value="filtering" label="🔍 Advanced Filtering" default>

<div style={{
  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  marginTop: '1rem'
}}>

### Filter Your Way

**What's New:**

- **Multiple Filter Types** - Text, number, date, and custom filters
- **Instant Results** - See filtered data in real-time
- **Save Filter Sets** - Save and reuse your favorite filters

**How It Works:**

<div style={{
  background: 'white',
  padding: '1.5rem',
  borderRadius: '0.75rem',
  marginTop: '1rem',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
}}>

**1.** Select your field → **2.** Choose condition → **3.** Enter value → **4.** Click Apply

</div>

**Available in:**

- **@pivothead/core** - Core filtering engine
- **@pivothead/webcomponent** - Native web component
- **@pivothead/react** - React hooks
- **@pivothead/vue** - Vue composables

</div>

</TabItem>

<TabItem value="import" label="📤 File Import">

<div style={{
  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  marginTop: '1rem'
}}>

### Upload & Visualize

**What's New:**

- **Drag & Drop** - Simple file upload interface
- **Auto-Detection** - Automatically parse CSV/JSON structure
- **Data Preview** - See your data before loading
- **Smart Mapping** - Intelligent column detection

**Supported Formats:**

<div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
  <div style={{
    background: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontWeight: '600',
    fontSize: '1.1rem'
  }}>
    📄 CSV Files
  </div>
  <div style={{
    background: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontWeight: '600',
    fontSize: '1.1rem'
  }}>
    📋 JSON Files
  </div>
</div>

**Maximum file size:** Up to 100MB with progressive loading!

</div>

</TabItem>

<TabItem value="export" label="📥 Export Options">

<div style={{
  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  marginTop: '1rem'
}}>

### Export Anywhere

**What's New:**

- **PDF Export** - Publication-ready documents
- **Excel Export** - Fully formatted spreadsheets
- **HTML Export** - Web-ready tables
- **Styled Output** - Preserve your custom styling

**Export Features:**

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
  <div style={{
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</div>
    <strong>PDF</strong>
    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>Print-ready format</div>
  </div>
  <div style={{
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
    <strong>Excel</strong>
    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>With formulas</div>
  </div>
  <div style={{
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌐</div>
    <strong>HTML</strong>
    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>Interactive web</div>
  </div>
</div>

**One-click export with all your filters and formatting intact!**

</div>

</TabItem>
</Tabs>

---

## **Coming Soon {#upcoming-features}**

<div style={{
  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  border: '3px dashed #dc2626',
  marginBottom: '2rem',
  textAlign: 'center'
}}>
  <h2 style={{ marginBottom: '0.5rem', color: '#991b1b' }}>Next Release: v2.1</h2>
  <p style={{ fontSize: '1.1rem', color: '#7f1d1d', margin: 0 }}>Exciting new features in development!</p>
</div>

<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
  gap: '1.5rem',
  marginTop: '2rem' 
}}>

{/_ Angular Support _/}

<div style={{
  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  border: '2px solid #dc2626',
  position: 'relative',
  boxShadow: '0 10px 30px rgba(220, 38, 38, 0.2)',
  transition: 'transform 0.3s ease',
  cursor: 'pointer'
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'scale(1.05)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'scale(1)';
}}>
  <div style={{
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: '#dc2626',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase'
  }}>
    In Development
  </div>
  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🅰️</div>
  <h3 style={{ color: '#7f1d1d', marginBottom: '1rem', fontSize: '1.5rem' }}>Angular Support</h3>
  <p style={{ color: '#991b1b', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
    Full Angular integration with reactive services, directives, and standalone components!
  </p>
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  }}>
    <span style={{
      background: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.85rem',
      color: '#991b1b',
      fontWeight: '600'
    }}>@pivothead/angular</span>
    <span style={{
      background: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.85rem',
      color: '#991b1b',
      fontWeight: '600'
    }}>TypeScript-first</span>
    <span style={{
      background: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.85rem',
      color: '#991b1b',
      fontWeight: '600'
    }}>Zone.js ready</span>
  </div>
</div>

{/_ High-Volume Processing _/}

<div style={{
  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  border: '2px solid #dc2626',
  position: 'relative',
  boxShadow: '0 10px 30px rgba(220, 38, 38, 0.2)',
  transition: 'transform 0.3s ease',
  cursor: 'pointer'
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'scale(1.05)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'scale(1)';
}}>
  <div style={{
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: '#dc2626',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase'
  }}>
    Coming Soon
  </div>
  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚡</div>
  <h3 style={{ color: '#7f1d1d', marginBottom: '1rem', fontSize: '1.5rem' }}>High-Volume Data</h3>
  <p style={{ color: '#991b1b', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
    Handle massive CSV and JSON files without freezing or crashing. Process millions of rows smoothly!
  </p>
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  }}>
    <span style={{
      background: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.85rem',
      color: '#991b1b',
      fontWeight: '600'
    }}>100MB+ files</span>
    <span style={{
      background: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.85rem',
      color: '#991b1b',
      fontWeight: '600'
    }}>No freezing</span>
    <span style={{
      background: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.85rem',
      color: '#991b1b',
      fontWeight: '600'
    }}>WebAssembly</span>
  </div>
</div>

</div>

---

## **Feature Comparison**

<div style={{
  background: 'white',
  padding: '2rem',
  borderRadius: '1rem',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  marginTop: '2rem',
  overflow: 'auto'
}}>

| Feature                      |                                                                                                                    Current (v2.0)                                                                                                                     |                                                                                    Next (v2.1)                                                                                     |
| ---------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| **Advanced Filtering**       |                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg>                                   | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg> |
| **File Upload (CSV/JSON)**   |                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg>                                   | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg> |
| **Export (PDF/Excel/HTML)**  |                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg>                                   | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg> |
| **React Support**            |                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg>                                   | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg> |
| **Vue Support**              |                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg>                                   | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg> |
| **Angular Support**          | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" style={{display: 'inline-block'}}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="12" r="8"></circle><path d="M12 3v18M3 12h18"></path></svg> | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg> |
| **High-Volume Processing**   | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" style={{display: 'inline-block'}}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="12" r="8"></circle><path d="M12 3v18M3 12h18"></path></svg> | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg> |
| **WebAssembly Acceleration** | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" style={{display: 'inline-block'}}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="12" r="8"></circle><path d="M12 3v18M3 12h18"></path></svg> | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg> |
| **Progressive Loading**      | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" style={{display: 'inline-block'}}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="12" r="8"></circle><path d="M12 3v18M3 12h18"></path></svg> | <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{display: 'inline-block'}}><polyline points="20 6 9 17 4 12"></polyline></svg> |

<div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>Available</span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="12" r="8"></circle><path d="M12 3v18M3 12h18"></path></svg>
    <span>Coming Soon</span>
  </div>
</div>

</div>

---

## **Stay Updated**

<div style={{
  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
  padding: '2rem',
  borderRadius: '1rem',
  marginTop: '2rem',
  textAlign: 'center'
}}>

### Never Miss an Update!

<div style={{
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
  marginTop: '1.5rem'
}}>
  <a 
    href="https://github.com/mindfiredigital/PivotHead" 
    target="_blank"
    style={{
      background: 'white',
      color: '#991b1b',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: '600',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}
  >
    ⭐ Star on GitHub
  </a>
  
</div>

<p style={{ marginTop: '1.5rem', color: '#7f1d1d', fontSize: '0.95rem' }}>
  Get notified about new releases, beta programs, and exclusive features!
</p>

</div>

---

<div style={{
  textAlign: 'center',
  padding: '3rem 1rem',
  background: 'linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%)',
  borderRadius: '1rem',
  marginTop: '3rem'
}}>
  <svg
    viewBox="0 0 120 180"
    style={{
      width: '5rem',
      height: '7.5rem',
      marginBottom: '1rem',
      display: 'inline-block',
      filter: 'drop-shadow(0 4px 12px rgba(220, 38, 38, 0.25))',
      animation: 'rocketLift 3s ease-in-out infinite'
    }}
  >
    {/* Rocket body - main tube */}
    <rect x="45" y="40" width="30" height="90" rx="4" fill="#dc2626" />
    
    {/* Rocket body - upper section with gradient appearance */}
    <rect x="48" y="45" width="24" height="25" rx="3" fill="#991b1b" />
    
    {/* Nose cone - pointed tip */}
    <polygon points="60,15 48,40 72,40" fill="#fbbf24" />
    
    {/* Window - circular viewport */}
    <circle cx="60" cy="50" r="5" fill="#60a5fa" />
    <circle cx="60" cy="50" r="3" fill="#bfdbfe" opacity="0.6" />
    
    {/* Left fin */}
    <polygon points="45,110 20,145 45,125" fill="#7f1d1d" />
    
    {/* Right fin */}
    <polygon points="75,110 100,145 75,125" fill="#7f1d1d" />
    
    {/* Bottom thruster section */}
    <rect x="50" y="125" width="20" height="15" rx="2" fill="#ea580c" />
    
    {/* Flame - outer (large) */}
    <polygon points="48,140 60,170 72,140" fill="#f97316" opacity="0.9" />
    
    {/* Flame - middle */}
    <polygon points="52,148 60,162 68,148" fill="#fbbf24" opacity="0.8" />
    
    {/* Flame - inner (bright core) */}
    <polygon points="55,152 60,160 65,152" fill="#fef3c7" />
  </svg>
  
  <h2 style={{ marginBottom: '1rem' }}>Excited About What's Coming?</h2>
  <p style={{ fontSize: '1.2rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto 2rem' }}>
    Try the current version today and experience the power of PivotHead!
  </p>
  <a 
    href="/PivotHead/docs/getting-started/Why-we-use-pivothead"
    style={{
      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      color: 'white',
      padding: '1rem 2.5rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: '700',
      fontSize: '1.2rem',
      display: 'inline-block',
      boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.5)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.4)';
    }}
  >
    Get Started Now →
  </a>
</div>

<style>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes rocketLift {
    0%, 100% {
      transform: translateY(0px) scaleY(1);
    }
    50% {
      transform: translateY(-20px) scaleY(1.02);
    }
  }
`}</style>

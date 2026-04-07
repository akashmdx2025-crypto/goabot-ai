require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Business = require('./models/Business');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const { DEFAULT_SYSTEM_PROMPT } = require('./config/constants');

const TENANT_ID = 'tenant_demo_001';

const seedData = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding database...\n');

    // Clear existing demo data
    await Business.deleteMany({ tenantId: TENANT_ID });
    await User.deleteMany({ tenantId: TENANT_ID });
    await Booking.deleteMany({ tenantId: TENANT_ID });
    await Customer.deleteMany({ tenantId: TENANT_ID });

    // Create demo business
    const business = await Business.create({
      tenantId: TENANT_ID,
      name: 'Sunset Beach Shack',
      type: 'shack',
      description: 'A cozy beach shack in Goa with the best seafood and sunsets. Live music every Friday!',
      phone: '+919876543210',
      whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'demo-phone-id',
      whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'demo-access-token',
      location: {
        address: 'Tito\'s Lane, Baga Beach, North Goa, 403516',
        googleMapsUrl: 'https://maps.google.com/?q=15.5514,73.7545',
        coordinates: { lat: 15.5514, lng: 73.7545 },
      },
      timings: {
        monday: { open: '11:00', close: '23:00', closed: false },
        tuesday: { open: '11:00', close: '23:00', closed: false },
        wednesday: { open: '11:00', close: '23:00', closed: false },
        thursday: { open: '11:00', close: '23:00', closed: false },
        friday: { open: '11:00', close: '00:00', closed: false },
        saturday: { open: '10:00', close: '00:00', closed: false },
        sunday: { open: '10:00', close: '23:00', closed: false },
      },
      contact: {
        email: 'hello@sunsetbeachshack.com',
        phone: '+919876543210',
        instagram: '@sunsetbeachgoa',
        website: 'https://sunsetbeachshack.com',
      },
      menu: {
        type: 'text',
        items: [
          // Starters
          { category: 'Starters', name: 'Prawn Koliwada', description: 'Crispy fried prawns with Goan spices', price: 350, isVeg: false, isAvailable: true },
          { category: 'Starters', name: 'Fish Rawa Fry', description: 'Kingfish coated in semolina, pan-fried', price: 320, isVeg: false, isAvailable: true },
          { category: 'Starters', name: 'Veg Spring Rolls', description: 'Crispy rolls with mixed veggies', price: 220, isVeg: true, isAvailable: true },
          { category: 'Starters', name: 'Paneer Tikka', description: 'Marinated cottage cheese, tandoor-grilled', price: 280, isVeg: true, isAvailable: true },
          { category: 'Starters', name: 'Calamari Rings', description: 'Golden fried squid rings with tartar sauce', price: 380, isVeg: false, isAvailable: true },

          // Main Course
          { category: 'Main Course', name: 'Goan Fish Curry Rice', description: 'Traditional coconut curry with local fish', price: 420, isVeg: false, isAvailable: true },
          { category: 'Main Course', name: 'Butter Garlic Prawns', description: 'Jumbo prawns sautéed in butter garlic', price: 550, isVeg: false, isAvailable: true },
          { category: 'Main Course', name: 'Chicken Xacuti', description: 'Classic Goan chicken curry with roasted spices', price: 380, isVeg: false, isAvailable: true },
          { category: 'Main Course', name: 'Pork Vindaloo', description: 'Spicy Goan pork curry with potatoes', price: 400, isVeg: false, isAvailable: true },
          { category: 'Main Course', name: 'Paneer Butter Masala', description: 'Creamy tomato-based paneer curry', price: 300, isVeg: true, isAvailable: true },
          { category: 'Main Course', name: 'Dal Tadka', description: 'Yellow lentils with garlic tempering', price: 200, isVeg: true, isAvailable: true },

          // Drinks
          { category: 'Drinks', name: 'Fresh Coconut Water', description: 'Straight from the palm tree', price: 80, isVeg: true, isAvailable: true },
          { category: 'Drinks', name: 'Mango Lassi', description: 'Thick mango yogurt smoothie', price: 150, isVeg: true, isAvailable: true },
          { category: 'Drinks', name: 'Goan Feni Cocktail', description: 'Cashew feni with tropical fruits', price: 250, isVeg: true, isAvailable: true },
          { category: 'Drinks', name: 'Kingfisher Beer', description: 'Chilled pint', price: 180, isVeg: true, isAvailable: true },
          { category: 'Drinks', name: 'Sol Kadhi', description: 'Refreshing kokum-coconut milk drink', price: 100, isVeg: true, isAvailable: true },

          // Desserts
          { category: 'Desserts', name: 'Bebinca', description: 'Traditional Goan layered pudding', price: 200, isVeg: true, isAvailable: true },
          { category: 'Desserts', name: 'Chocolate Lava Cake', description: 'Warm gooey chocolate cake', price: 250, isVeg: true, isAvailable: true },
          { category: 'Desserts', name: 'Kulfi', description: 'Indian ice cream — mango & pistachio', price: 120, isVeg: true, isAvailable: true },
        ],
        pdfUrl: '',
        imageUrls: [],
      },
      chatbotEnabled: true,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      subscription: {
        plan: 'pro',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('✅ Business created:', business.name);

    // Create demo admin user
    const user = await User.create({
      tenantId: TENANT_ID,
      email: 'admin@sunsetbeach.com',
      passwordHash: 'admin123', // Will be hashed by pre-save hook
      name: 'Ravi Naik',
      role: 'owner',
    });
    console.log('✅ Admin user created:', user.email);

    // Create sample bookings
    const today = new Date();
    const bookings = await Booking.insertMany([
      {
        tenantId: TENANT_ID,
        customerName: 'Sarah Johnson',
        customerPhone: '14155551234',
        date: today,
        time: '19:00',
        peopleCount: 4,
        status: 'confirmed',
        source: 'whatsapp',
      },
      {
        tenantId: TENANT_ID,
        customerName: 'Amit Patel',
        customerPhone: '919876512345',
        date: today,
        time: '20:30',
        peopleCount: 2,
        status: 'confirmed',
        source: 'whatsapp',
      },
      {
        tenantId: TENANT_ID,
        customerName: 'Lisa Chen',
        customerPhone: '44712345678',
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        time: '19:30',
        peopleCount: 6,
        status: 'pending',
        source: 'whatsapp',
      },
      {
        tenantId: TENANT_ID,
        customerName: 'Marco Silva',
        customerPhone: '351912345678',
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        time: '21:00',
        peopleCount: 3,
        status: 'completed',
        source: 'whatsapp',
      },
      {
        tenantId: TENANT_ID,
        customerName: 'Priya Sharma',
        customerPhone: '919123456789',
        date: today,
        time: '18:00',
        peopleCount: 5,
        status: 'cancelled',
        source: 'dashboard',
      },
    ]);
    console.log(`✅ ${bookings.length} bookings created`);

    // Create sample customers
    await Customer.insertMany([
      { tenantId: TENANT_ID, phone: '14155551234', name: 'Sarah Johnson', messageCount: 12 },
      { tenantId: TENANT_ID, phone: '919876512345', name: 'Amit Patel', messageCount: 5 },
      { tenantId: TENANT_ID, phone: '44712345678', name: 'Lisa Chen', messageCount: 3 },
    ]);
    console.log('✅ Customers created');

    console.log(`
  🌱 Seed complete!
  =================
  Business: ${business.name}
  Admin Login:
    Email: admin@sunsetbeach.com
    Password: admin123
  
  Menu Items: ${business.menu.items.length}
  Bookings: ${bookings.length}
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();

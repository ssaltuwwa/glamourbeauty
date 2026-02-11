const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const app = express();
// ===== ФРОНТЕНД =====
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/index.html')));
// ====================

// Mongoose safety/compat settings
try {
  mongoose.set('strictQuery', false);
} catch (e) {
  // noop for older mongoose versions
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));
app.use(helmet());
app.use(express.json());

// Add test services and admin on startup
async function seedDatabase() {
    try {
        const Service = require('./models/Service');
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        
        // Check if services exist
        const serviceCount = await Service.countDocuments();
        if (serviceCount === 0) {
            await Service.create([
                {
                    name: "Signature Haircut & Styling",
                    description: "Professional haircut with expert styling and finishing",
                    category: "hair",
                    duration: 90,
                    price: 85,
                    isActive: true
                },
                {
                    name: "Luxury Manicure",
                    description: "Premium manicure with gel polish and hand treatment",
                    category: "nails",
                    duration: 75,
                    price: 65,
                    isActive: true
                },
                {
                    name: "HydraFacial Treatment",
                    description: "Advanced facial treatment for glowing skin",
                    category: "face",
                    duration: 60,
                    price: 120,
                    isActive: true
                },
                {
                    name: "Professional Makeup",
                    description: "Full makeup application for special occasions",
                    category: "makeup",
                    duration: 90,
                    price: 95,
                    isActive: true
                },
                {
                    name: "Deep Tissue Massage",
                    description: "Therapeutic massage for muscle relaxation",
                    category: "body",
                    duration: 60,
                    price: 110,
                    isActive: true
                },
                {
                    name: "Brazilian Blowout",
                    description: "Smoothing treatment for frizzy hair",
                    category: "hair",
                    duration: 120,
                    price: 250,
                    isActive: true
                }
            ]);
            console.log('✅ Premium beauty services added to database!');
        } else {
            console.log('✅ Services already exist in database');
        }
        
        // Create admin user if none exists
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            // Create admin
            await User.create({
                username: 'Admin',
                email: 'admin@glamourbeauty.com',
                password: hashedPassword,
                role: 'admin',
                phone: '+1 (555) 123-4567'
            });
            
            // Create test users
            await User.create({
                username: 'Sarah Johnson',
                email: 'sarah@example.com',
                password: await bcrypt.hash('password123', 10),
                role: 'user',
                phone: '+1 (555) 111-2222'
            });
            
            await User.create({
                username: 'Michael Chen',
                email: 'michael@example.com',
                password: await bcrypt.hash('password123', 10),
                role: 'user',
                phone: '+1 (555) 333-4444'
            });
            
            console.log('✅ Test users created!');
            console.log('👑 Admin: admin@glamourbeauty.com / admin123');
            console.log('👤 User: sarah@example.com / password123');
        } else {
            console.log('✅ Users already exist in database');
        }
        
    } catch (error) {
        console.log('⚠️ Note: Could not seed database -', error.message);
        console.log('This is normal if the database already has data');
    }
}

// Connect to MongoDB and seed database
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/glamour-beauty';

function maskUri(uri) {
  try {
    // Mask credentials if present
    return uri.replace(/:(.*?)@/, ':*****@');
  } catch (e) {
    return uri;
  }
}

const connectionOptions = {
  // Let serverSelectionTimeoutMS fail fast if Atlas isn't reachable (ms)
  serverSelectionTimeoutMS: 10000
};

console.log(`🔗 Attempting MongoDB connection to ${maskUri(mongoUri)}`);

mongoose.connect(mongoUri, connectionOptions)
  .then(async () => {
    console.log('✅ MongoDB connected successfully to Glamour Beauty database');
    console.log('✨ Luxury Beauty Services Database ✨');

    // Seed the database with initial data
    await seedDatabase();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);

    if (mongoUri && mongoUri.startsWith('mongodb+srv://')) {
      console.log('⚠️ Using MongoDB Atlas. Common causes:');
      console.log('- Your current IP address is not added to the Atlas Network Access whitelist.');
      console.log('- The username/password in the connection string are incorrect.');
      console.log('- DNS/SRV resolution issues on your machine or network.');
      console.log('👉 To allow access temporarily, add 0.0.0.0/0 in Atlas Network Access (not recommended for production).');
      console.log('📘 Atlas docs: https://www.mongodb.com/docs/atlas/security-whitelist/');
    } else {
      console.log('💡 Tip: Make sure MongoDB is running on localhost:27017');
    }

    // Print stack trace for deeper debugging
    console.error(err.stack || err);
    process.exit(1);
  });

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Glamour Beauty Salon API is running!',
    tagline: 'Luxury Beauty Services',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Glamour Beauty Salon API!',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      appointments: '/api/appointments',
      services: '/api/services',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'Page not found',
    path: req.originalUrl,
    suggestion: 'Try /api/health to check if the API is running'
  });
});

// Global error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 Glamour Beauty Salon Server launched!`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`💅 Services: http://localhost:${PORT}/api/services`);
  console.log(`\n✨ Ready to serve luxury beauty needs! ✨`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Glamour Beauty Salon server...');
  mongoose.connection.close();
  process.exit(0);
});
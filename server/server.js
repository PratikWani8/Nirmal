const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const CommunityReport = require('./models/CommunityReport');

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_location', (city) => {
    socket.join(city);
    console.log(`[Socket.IO] Client ${socket.id} joined room: ${city}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Broadcast helper for community reports / smog alerts
app.set('io', io);

// Seed initial demo data
async function seedInitialData() {
  try {
    const existingUser = await User.findOne({ email: 'demo@nirmal.eco' });
    if (!existingUser) {
      await User.create({
        name: 'Aarav Sharma',
        email: 'demo@nirmal.eco',
        password: 'password123',
        preferredLanguage: 'en',
        location: {
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          coordinates: [77.2090, 28.6139],
        },
        lifestyle: {
          wakeupTime: '06:30',
          workSchedule: '09:00 - 18:00',
          commuteMode: 'metro_train',
          outdoorExercise: 'morning_walk',
          householdSize: 4,
          indoorVentilation: 'intermittent',
          hasAirPurifier: true,
          cookingFuel: 'lpg',
          sensitivities: ['elderly', 'children'],
        },
        points: 240,
        badges: ['Clean Air Pioneer', 'Metro Commuter', 'Community Watch'],
        onboardingCompleted: true,
      });
      console.log('[Seed] Demo user created: demo@nirmal.eco / password123');
    }

    const reportCount = await CommunityReport.countDocuments();
    if (reportCount === 0) {
      const demoUser = await User.findOne({ email: 'demo@nirmal.eco' });
      await CommunityReport.insertMany([
        {
          userId: demoUser?._id,
          userName: 'Priya K.',
          category: 'garbage_burning',
          description: 'Open biomass and dry leaves burning near municipal park perimeter. Heavy smoke drifting into residential lanes.',
          location: {
            address: 'Sector 14 Park, Rohini, New Delhi',
            city: 'New Delhi',
            coordinates: [77.1320, 28.7180],
          },
          verificationStatus: 'verified',
          verifiedBy: 'Municipal Environmental Dispatcher',
          actionTaken: 'Misting team dispatched; burning extinguished.',
          upvotes: 18,
        },
        {
          userId: demoUser?._id,
          userName: 'Vikram Mehta',
          category: 'construction_dust',
          description: 'Commercial construction site operating without green dust curtains or water sprinklers on sand piles.',
          location: {
            address: 'Ring Road Crossing, New Delhi',
            city: 'New Delhi',
            coordinates: [77.2280, 28.5820],
          },
          verificationStatus: 'investigating',
          actionTaken: 'Notice issued for inspection.',
          upvotes: 11,
        },
        {
          userId: demoUser?._id,
          userName: 'Rajesh G.',
          category: 'heavy_traffic',
          description: 'Severe diesel truck tailpipe congestion and black smoke at border toll plaza during morning rush hour.',
          location: {
            address: 'Anand Vihar ISBT, Delhi',
            city: 'New Delhi',
            coordinates: [77.3150, 28.6460],
          },
          verificationStatus: 'verified',
          upvotes: 24,
        },
      ]);
      console.log('[Seed] Sample community reports created.');
    }
  } catch (err) {
    console.warn('[Seed] Warning during initial seed:', err.message);
  }
}

// Start Server
const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  Nirmal - Urban Air Quality Assistant Server  `);
      console.log(`  Running on: http://localhost:${PORT}        `);
      console.log(`  Environment: ${env.NODE_ENV}                 `);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };

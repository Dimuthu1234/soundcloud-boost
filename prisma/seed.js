require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@soundcloudboost.com' },
    update: {},
    create: {
      email: 'admin@soundcloudboost.com',
      password: hashedPassword,
      name: 'Admin',
    },
  });
  console.log('Admin created:', admin.email);

  // Create sample packages
  const packages = [
    {
      title: '1000 SoundCloud Plays',
      description: 'Get 1000 high-quality plays on your SoundCloud track. Boost your visibility and reach more listeners.',
      price: 5.99,
      deliveryDays: 2,
      category: 'SoundcloudBoost',
    },
    {
      title: '5000 SoundCloud Plays',
      description: 'Get 5000 premium plays on your SoundCloud track. Great for new releases and gaining traction.',
      price: 19.99,
      deliveryDays: 3,
      category: 'SoundcloudBoost',
    },
    {
      title: '100 SoundCloud Followers',
      description: 'Gain 100 real SoundCloud followers to grow your audience and build credibility.',
      price: 9.99,
      deliveryDays: 3,
      category: 'SoundcloudBoost',
    },
    {
      title: '500 SoundCloud Likes',
      description: 'Get 500 likes on your SoundCloud track. Increase engagement and social proof.',
      price: 12.99,
      deliveryDays: 2,
      category: 'SoundcloudBoost',
    },
    {
      title: '1000 SoundCloud Reposts',
      description: 'Get 1000 reposts on your track. Expand your reach across SoundCloud.',
      price: 14.99,
      deliveryDays: 4,
      category: 'SoundcloudBoost',
    },
    {
      title: 'Album Cover Design',
      description: 'Professional album cover design for your SoundCloud release. High quality, unique artwork.',
      price: 29.99,
      deliveryDays: 5,
      category: 'GraphicDesign',
    },
    {
      title: 'Artist Logo Design',
      description: 'Custom logo design for your artist brand. Includes 3 revisions.',
      price: 39.99,
      deliveryDays: 7,
      category: 'GraphicDesign',
    },
    {
      title: 'Social Media Banner Pack',
      description: 'Complete set of social media banners for all platforms. Perfect for music promotion.',
      price: 24.99,
      deliveryDays: 4,
      category: 'GraphicDesign',
    },
    {
      title: 'Music Visualizer Video',
      description: 'Animated music visualizer video for your track. Perfect for YouTube and social media.',
      price: 19.99,
      deliveryDays: 3,
      category: 'VideoEditing',
    },
    {
      title: 'Lyric Video',
      description: 'Professional lyric video with custom animations and typography.',
      price: 49.99,
      deliveryDays: 7,
      category: 'VideoEditing',
    },
    {
      title: 'Promo Video (30s)',
      description: '30-second promotional video clip for your upcoming release.',
      price: 34.99,
      deliveryDays: 5,
      category: 'VideoEditing',
    },
  ];

  const existingCount = await prisma.package.count();
  if (existingCount === 0) {
    for (const pkg of packages) {
      await prisma.package.create({ data: pkg });
    }
    console.log(`${packages.length} packages created.`);
  } else {
    console.log(`Skipping seed: ${existingCount} packages already exist.`);
  }
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

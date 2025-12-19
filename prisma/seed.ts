import { ConditionType, DiagnosisStatus, Severity } from '@prisma/client'
import { prisma } from '../infrastructure/database/prisma.client.js'

// Real-ish plant data to make the app look good
const COMMON_SPECIES = [
  {
    commonName: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    family: 'Araceae',
    description: 'The Swiss Cheese Plant, famous for its fenestrated leaves.',
    origin: 'Central America',
    waterRequirement: 'MODERATE',
    lightRequirement: 'PARTIAL_SHADE',
    growthRate: 'FAST',
    imageUrl:
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80',
  },
  {
    commonName: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    family: 'Moraceae',
    description: 'Popular indoor tree with large, violin-shaped leaves.',
    origin: 'West Africa',
    waterRequirement: 'MODERATE',
    lightRequirement: 'FULL_SUN', // or bright indirect
    growthRate: 'MODERATE',
    imageUrl:
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80',
  },
  {
    commonName: 'Snake Plant',
    scientificName: 'Dracaena trifasciata',
    family: 'Asparagaceae',
    description: 'Indestructible succulent that purifies air.',
    origin: 'West Africa',
    waterRequirement: 'LOW',
    lightRequirement: 'FULL_SHADE', // Tolerate
    growthRate: 'SLOW',
    imageUrl:
      'https://images.unsplash.com/photo-1599598425947-630e60882772?auto=format&fit=crop&q=80',
  },
  {
    commonName: 'Basil',
    scientificName: 'Ocimum basilicum',
    family: 'Lamiaceae',
    description: 'Culinary herb essential for Italian cuisine.',
    origin: 'Central Africa / Southeast Asia',
    waterRequirement: 'HIGH',
    lightRequirement: 'FULL_SUN',
    growthRate: 'FAST',
    imageUrl:
      'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&q=80',
  },
  {
    commonName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    family: 'Solanaceae',
    description: 'Edible berry used as a vegetable.',
    origin: 'South America',
    waterRequirement: 'HIGH',
    lightRequirement: 'FULL_SUN',
    growthRate: 'FAST',
    imageUrl:
      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80',
  },
]

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Clean Database
  // Delete in order of foreign key constraints
  await prisma.careCompletion.deleteMany()
  await prisma.careSchedule.deleteMany()
  await prisma.diagnosis.deleteMany()
  await prisma.plant.deleteMany()
  await prisma.garden.deleteMany()
  await prisma.species.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // 2. Create Species Catalog
  const speciesMap = new Map()
  for (const s of COMMON_SPECIES) {
    const species = await prisma.species.create({
      data: {
        ...s,
        nativeRegions: [s.origin],
        waterRequirement: s.waterRequirement as any,
        lightRequirement: s.lightRequirement as any,
        growthRate: s.growthRate as any,
      },
    })
    speciesMap.set(s.commonName, species)
  }
  console.log(`🌿 Seeded ${speciesMap.size} species`)

  // 3. Create Users
  // Admin User
  await prisma.user.create({
    data: {
      email: 'admin@homegarden.com',
      password: 'managed_by_supabase',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      preferences: { theme: 'dark', notifications: true },
    },
  })

  // Test User (Standard)
  const user = await prisma.user.create({
    data: {
      email: 'test@homegarden.com',
      password: 'managed_by_supabase',
      firstName: 'Test',
      lastName: 'Gardener',
      role: 'USER',
      preferences: { theme: 'system', notifications: true },
    },
  })

  console.log('👤 Seeded users (admin@homegarden.com, test@homegarden.com)')

  // 4. Create Gardens for Test User
  const indoorGarden = await prisma.garden.create({
    data: {
      name: 'Living Room Jungle',
      userId: user.id,
      latitude: 48.8566,
      longitude: 2.3522,
      climate: 'Indoor',
      description: 'My cozy indoor plant collection',
    },
  })

  const balconyGarden = await prisma.garden.create({
    data: {
      name: 'Balcony Herbs',
      userId: user.id,
      latitude: 48.8566,
      longitude: 2.3522,
      climate: 'Outdoor',
      description: 'Fresh herbs for cooking',
    },
  })

  // 5. Add Plants
  // Monstera in Living Room
  await prisma.plant.create({
    data: {
      gardenId: indoorGarden.id,
      speciesId: speciesMap.get('Monstera Deliciosa')?.id,
      nickname: 'Monty',
      commonName: 'Monstera',
      acquiredDate: new Date('2024-01-15'),
      imageUrl: speciesMap.get('Monstera Deliciosa')?.imageUrl,
      watering: 'Every 7 days',
    },
  })

  // Fiddle Leaf
  await prisma.plant.create({
    data: {
      gardenId: indoorGarden.id,
      speciesId: speciesMap.get('Fiddle Leaf Fig')?.id,
      nickname: 'Figgy',
      commonName: 'Fiddle Leaf Fig',
      acquiredDate: new Date('2024-03-10'),
      imageUrl: speciesMap.get('Fiddle Leaf Fig')?.imageUrl,
      careNotes: "Don't move him, he gets dramatic.",
    },
  })

  // Basil on Balcony
  const basil = await prisma.plant.create({
    data: {
      gardenId: balconyGarden.id,
      speciesId: speciesMap.get('Basil')?.id,
      nickname: 'Pesto Source',
      commonName: 'Basil',
      acquiredDate: new Date(),
      imageUrl: speciesMap.get('Basil')?.imageUrl,
    },
  })

  // 6. Create Diagnosis (Dr. Plant History)
  await prisma.diagnosis.create({
    data: {
      userId: user.id,
      plantId: basil.id,
      imageUrl:
        'https://images.unsplash.com/photo-1611566026373-c6c8ddb6c9b8?auto=format&fit=crop&q=80',
      status: DiagnosisStatus.COMPLETED,
      conditionName: 'Downy Mildew',
      conditionType: ConditionType.DISEASE,
      confidence: 0.95,
      severity: Severity.MODERATE,
      description: 'Yellowing leaves with gray fuzz on undersides.',
      treatmentSteps: [
        'Remove infected leaves',
        'Improve air circulation',
        'Apply fungicide if spreading',
      ],
      aiModel: 'gemini-1.5-flash',
      processingMs: 1200,
    },
  })

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

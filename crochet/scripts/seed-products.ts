/**
 * One-time seed script: inserts all static products & categories into Supabase.
 *
 * Prerequisites:
 *  1. Run the SQL schema in the Supabase SQL editor (see docs/admin-setup.md)
 *  2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment
 *
 * Run with:
 *   npx ts-node --project tsconfig.json -e "require('./scripts/seed-products.ts')"
 * Or via the npm script:
 *   npm run seed
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') })
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const categories = [
  { slug: 'amigurumi', name: 'Amigurumi', description: 'Adorable stuffed friends, handcrafted with love', image: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=600&h=400&fit=crop', emoji: '🧸', sort_order: 1 },
  { slug: 'accessories', name: 'Accessories', description: 'Scrunchies, headbands, and more to style your day', image: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=600&h=400&fit=crop', emoji: '🎀', sort_order: 2 },
  { slug: 'home-decor', name: 'Home Decor', description: 'Cozy touches for every corner of your home', image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=400&fit=crop', emoji: '🏡', sort_order: 3 },
  { slug: 'clothing', name: 'Tops & Wearables', description: 'Handknit tops, vests, and cozy layers', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=400&fit=crop', emoji: '👚', sort_order: 4 },
  { slug: 'keychains', name: 'Keychains', description: 'Tiny treasures to carry everywhere', image: 'https://images.unsplash.com/photo-1578898395127-3ba9c05ac1b1?w=600&h=400&fit=crop', emoji: '🔑', sort_order: 5 },
  { slug: 'custom', name: 'Custom Orders', description: "Tell us what you dream, we'll stitch it real", image: 'https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=600&h=400&fit=crop', emoji: '✨', sort_order: 6 },
]

const products = [
  {
    id: 'ami-001', name: 'Benny the Bear', slug: 'benny-the-bear',
    description: 'Meet Benny, a cuddly crochet bear standing 12 inches tall. Made with premium cotton yarn in a warm honey shade, Benny features hand-embroidered eyes and a sweet smile. Perfect as a nursery companion or a heartfelt gift for someone special. Each bear takes about 8 hours to handcraft.',
    short_description: 'A cuddly 12-inch handmade crochet bear',
    price: 899, compare_at_price: 1099, currency: 'INR', category: 'amigurumi',
    tags: ['bestseller', 'gift'],
    images: [
      { src: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=600&h=600&fit=crop', alt: 'Benny the Bear front view', isPrimary: true },
      { src: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600&h=600&fit=crop', alt: 'Benny the Bear side view', isPrimary: false },
      { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', alt: 'Benny the Bear detail', isPrimary: false },
    ],
    variants: [
      { id: 'ami-001-honey', name: 'Honey', color: 'Honey', colorHex: '#D4A574', inStock: true },
      { id: 'ami-001-blush', name: 'Blush Pink', color: 'Blush Pink', colorHex: '#F4A4B4', inStock: true },
      { id: 'ami-001-sage', name: 'Sage', color: 'Sage', colorHex: '#A8C4A2', inStock: false },
    ],
    featured: true, is_new: false, in_stock: true, created_at: '2025-12-15',
  },
  {
    id: 'ami-002', name: 'Luna the Bunny', slug: 'luna-the-bunny',
    description: 'Luna is a sweet crochet bunny with floppy ears and a tiny flower crown. Standing 10 inches tall, she is made with soft acrylic yarn and stuffed with hypoallergenic filling. Her flower crown is detachable and comes in matching colors.',
    short_description: 'Sweet crochet bunny with a flower crown',
    price: 749, currency: 'INR', category: 'amigurumi',
    tags: ['new', 'gift'],
    images: [
      { src: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600&h=600&fit=crop', alt: 'Luna the Bunny', isPrimary: true },
      { src: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=600&h=600&fit=crop', alt: 'Luna the Bunny side', isPrimary: false },
    ],
    variants: [
      { id: 'ami-002-white', name: 'White', color: 'White', colorHex: '#F5F5F0', inStock: true },
      { id: 'ami-002-lavender', name: 'Lavender', color: 'Lavender', colorHex: '#C4A8D8', inStock: true },
    ],
    featured: true, is_new: true, in_stock: true, created_at: '2026-02-01',
  },
  {
    id: 'ami-003', name: 'Ollie the Octopus', slug: 'ollie-the-octopus',
    description: 'Ollie is a cheerful little octopus with eight curly tentacles. Made from soft cotton yarn, each tentacle has a different texture to provide sensory stimulation. A great toy for babies and toddlers. Measures 7 inches.',
    short_description: 'Cheerful crochet octopus with curly tentacles',
    price: 549, currency: 'INR', category: 'amigurumi',
    tags: ['baby', 'gift'],
    images: [{ src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', alt: 'Ollie the Octopus', isPrimary: true }],
    variants: [
      { id: 'ami-003-coral', name: 'Coral', color: 'Coral', colorHex: '#FF7F7F', inStock: true },
      { id: 'ami-003-ocean', name: 'Ocean Blue', color: 'Ocean Blue', colorHex: '#6CA6CD', inStock: true },
      { id: 'ami-003-mint', name: 'Mint', color: 'Mint', colorHex: '#98D4BB', inStock: true },
    ],
    featured: false, is_new: true, in_stock: true, created_at: '2026-01-20',
  },
  {
    id: 'acc-001', name: 'Peach Blossom Scrunchie Set', slug: 'peach-blossom-scrunchie-set',
    description: 'A set of 3 beautifully crocheted scrunchies in peach, cream, and dusty rose. Made with soft cotton blend yarn that is gentle on hair. Each scrunchie has a slightly different stitch pattern for a charming mix-and-match look.',
    short_description: 'Set of 3 soft crochet scrunchies',
    price: 299, currency: 'INR', category: 'accessories',
    tags: ['bestseller'],
    images: [
      { src: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=600&h=600&fit=crop', alt: 'Peach Blossom Scrunchie Set', isPrimary: true },
      { src: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=600&fit=crop', alt: 'Scrunchie detail', isPrimary: false },
    ],
    variants: [], featured: true, is_new: false, in_stock: true, created_at: '2025-11-10',
  },
  {
    id: 'acc-002', name: 'Daisy Chain Headband', slug: 'daisy-chain-headband',
    description: 'A delicate crochet headband adorned with tiny daisy flowers. Stretchy and comfortable to wear all day. Available in two widths. Perfect for both casual outings and special occasions.',
    short_description: 'Delicate crochet headband with tiny daisies',
    price: 349, compare_at_price: 449, currency: 'INR', category: 'accessories',
    tags: ['bestseller', 'gift'],
    images: [{ src: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=600&fit=crop', alt: 'Daisy Chain Headband', isPrimary: true }],
    variants: [
      { id: 'acc-002-slim', name: 'Slim', size: 'Slim', inStock: true },
      { id: 'acc-002-wide', name: 'Wide', size: 'Wide', inStock: true },
    ],
    featured: false, is_new: false, in_stock: true, created_at: '2025-10-05',
  },
  {
    id: 'acc-003', name: 'Boho Bucket Hat', slug: 'boho-bucket-hat',
    description: 'A trendy crochet bucket hat with an open-weave pattern. Lightweight and breathable, perfect for sunny days. Adjustable drawstring inside for a snug fit. Made with 100% cotton yarn.',
    short_description: 'Trendy open-weave crochet bucket hat',
    price: 599, currency: 'INR', category: 'accessories',
    tags: ['new', 'trending'],
    images: [{ src: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=600&fit=crop', alt: 'Boho Bucket Hat', isPrimary: true }],
    variants: [
      { id: 'acc-003-natural', name: 'Natural', color: 'Natural', colorHex: '#E8DCC8', inStock: true },
      { id: 'acc-003-terracotta', name: 'Terracotta', color: 'Terracotta', colorHex: '#C86B4E', inStock: true },
    ],
    featured: true, is_new: true, in_stock: true, created_at: '2026-02-10',
  },
  {
    id: 'hd-001', name: 'Cloud Coaster Set', slug: 'cloud-coaster-set',
    description: 'A set of 4 cloud-shaped crochet coasters that add a whimsical touch to your coffee table. Made with thick cotton yarn for excellent absorbency. Each coaster measures approximately 5 inches.',
    short_description: 'Set of 4 whimsical cloud-shaped coasters',
    price: 399, currency: 'INR', category: 'home-decor',
    tags: ['gift', 'bestseller'],
    images: [{ src: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=600&fit=crop', alt: 'Cloud Coaster Set', isPrimary: true }],
    variants: [
      { id: 'hd-001-white', name: 'Cloud White', color: 'White', colorHex: '#FFFFFF', inStock: true },
      { id: 'hd-001-peach', name: 'Sunset Peach', color: 'Peach', colorHex: '#FFDAB9', inStock: true },
    ],
    featured: false, is_new: false, in_stock: true, created_at: '2025-09-20',
  },
  {
    id: 'hd-002', name: 'Macrame Wall Hanging', slug: 'macrame-wall-hanging',
    description: 'A gorgeous macrame-style crochet wall hanging featuring intricate knot patterns and tassel fringe. Mounted on a natural driftwood branch. Measures 18 x 24 inches. A statement piece for any room.',
    short_description: 'Intricate crochet wall hanging on driftwood',
    price: 1299, compare_at_price: 1499, currency: 'INR', category: 'home-decor',
    tags: ['premium'],
    images: [
      { src: 'https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=600&h=600&fit=crop', alt: 'Macrame Wall Hanging', isPrimary: true },
      { src: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=600&fit=crop', alt: 'Wall hanging detail', isPrimary: false },
    ],
    variants: [], featured: true, is_new: false, in_stock: true, created_at: '2025-08-15',
  },
  {
    id: 'hd-003', name: 'Plant Hanger Trio', slug: 'plant-hanger-trio',
    description: 'A set of 3 crochet plant hangers in different lengths and patterns. Made with sturdy jute-blend yarn that holds up beautifully indoors and outdoors. Fits pots up to 6 inches in diameter.',
    short_description: 'Set of 3 crochet plant hangers',
    price: 799, currency: 'INR', category: 'home-decor',
    tags: ['trending'],
    images: [{ src: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop', alt: 'Plant Hanger Trio', isPrimary: true }],
    variants: [], featured: false, is_new: true, in_stock: true, created_at: '2026-01-25',
  },
  {
    id: 'clo-001', name: 'Sunflower Crop Top', slug: 'sunflower-crop-top',
    description: 'A stunning crochet crop top with a sunflower motif on the front. Features adjustable tie straps and a comfortable fit. Made with soft cotton yarn that breathes beautifully in warm weather.',
    short_description: 'Crochet crop top with sunflower motif',
    price: 999, currency: 'INR', category: 'clothing',
    tags: ['trending', 'summer'],
    images: [{ src: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop', alt: 'Sunflower Crop Top', isPrimary: true }],
    variants: [
      { id: 'clo-001-s', name: 'Small', size: 'S', inStock: true },
      { id: 'clo-001-m', name: 'Medium', size: 'M', inStock: true },
      { id: 'clo-001-l', name: 'Large', size: 'L', inStock: true },
    ],
    featured: true, is_new: false, in_stock: true, created_at: '2025-12-01',
  },
  {
    id: 'clo-002', name: 'Cozy Granny Square Vest', slug: 'cozy-granny-square-vest',
    description: 'A retro-inspired granny square vest in a warm color palette. Each square is handmade and joined together with invisible seams. Features a relaxed, oversized fit perfect for layering.',
    short_description: 'Retro granny square vest for layering',
    price: 1199, currency: 'INR', category: 'clothing',
    tags: ['new', 'winter'],
    images: [{ src: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=600&fit=crop', alt: 'Granny Square Vest', isPrimary: true }],
    variants: [
      { id: 'clo-002-s', name: 'Small', size: 'S', inStock: true },
      { id: 'clo-002-m', name: 'Medium', size: 'M', inStock: true },
      { id: 'clo-002-l', name: 'Large', size: 'L', inStock: false },
    ],
    featured: false, is_new: true, in_stock: true, created_at: '2026-02-05',
  },
  {
    id: 'kc-001', name: 'Mini Cactus Keychain', slug: 'mini-cactus-keychain',
    description: 'An adorable mini crochet cactus keychain in a tiny terracotta pot. Stands about 3 inches tall and clips onto bags, keys, or zippers. Each one is slightly unique due to handmade nature.',
    short_description: 'Adorable mini crochet cactus keychain',
    price: 199, currency: 'INR', category: 'keychains',
    tags: ['bestseller', 'gift'],
    images: [{ src: 'https://images.unsplash.com/photo-1578898395127-3ba9c05ac1b1?w=600&h=600&fit=crop', alt: 'Mini Cactus Keychain', isPrimary: true }],
    variants: [
      { id: 'kc-001-green', name: 'Classic Green', color: 'Green', colorHex: '#6B8E63', inStock: true },
      { id: 'kc-001-pink', name: 'Pink Bloom', color: 'Pink', colorHex: '#F4A4B4', inStock: true },
    ],
    featured: false, is_new: false, in_stock: true, created_at: '2025-10-15',
  },
  {
    id: 'kc-002', name: 'Strawberry Charm', slug: 'strawberry-charm',
    description: 'A sweet little crochet strawberry charm that works as a keychain, bag charm, or zipper pull. Features tiny seed details and a green leaf top. Approximately 2.5 inches.',
    short_description: 'Sweet crochet strawberry keychain charm',
    price: 149, currency: 'INR', category: 'keychains',
    tags: ['gift'],
    images: [{ src: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop', alt: 'Strawberry Charm', isPrimary: true }],
    variants: [], featured: false, is_new: true, in_stock: true, created_at: '2026-02-15',
  },
  {
    id: 'kc-003', name: 'Mushroom Keychain Duo', slug: 'mushroom-keychain-duo',
    description: 'A pair of adorable crochet mushroom keychains - one red with white spots and one pink with cream spots. Each mushroom is about 2 inches tall. A fun gift for mushroom lovers.',
    short_description: 'Pair of cute crochet mushroom keychains',
    price: 249, currency: 'INR', category: 'keychains',
    tags: ['new', 'gift'],
    images: [{ src: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=600&h=600&fit=crop', alt: 'Mushroom Keychain Duo', isPrimary: true }],
    variants: [], featured: false, is_new: true, in_stock: true, created_at: '2026-01-30',
  },
  {
    id: 'cus-001', name: 'Custom Amigurumi Portrait', slug: 'custom-amigurumi-portrait',
    description: "Get a custom crochet amigurumi made to look like you, your loved one, or even your pet! Send us a photo and we will craft a one-of-a-kind keepsake. Typically 8-10 inches tall. Please allow 2-3 weeks for creation.",
    short_description: 'Custom crochet amigurumi made from your photo',
    price: 1499, currency: 'INR', category: 'custom',
    tags: ['premium', 'gift'],
    images: [
      { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', alt: 'Custom Amigurumi Portrait', isPrimary: true },
      { src: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=600&h=600&fit=crop', alt: 'Custom portrait examples', isPrimary: false },
    ],
    variants: [], featured: true, is_new: false, in_stock: true, created_at: '2025-11-01',
  },
]

const siteSettings = [
  { key: 'shop_name', value: 'Crochet Ya' },
  { key: 'shop_tagline', value: 'Handmade with love' },
  { key: 'contact_phone', value: '' },
  { key: 'contact_email', value: '' },
  { key: 'instagram_handle', value: '' },
  { key: 'announcement_banner', value: '' },
]

async function seed() {
  console.log('🌱 Seeding Supabase...\n')

  // Seed categories
  console.log('📁 Inserting categories...')
  const { error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
  if (catError) {
    console.error('❌ Categories failed:', catError.message)
    process.exit(1)
  }
  console.log(`✅ ${categories.length} categories seeded`)

  // Seed products
  console.log('\n🧶 Inserting products...')
  const { error: prodError } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'id' })
  if (prodError) {
    console.error('❌ Products failed:', prodError.message)
    process.exit(1)
  }
  console.log(`✅ ${products.length} products seeded`)

  // Seed site settings
  console.log('\n⚙️  Inserting site settings...')
  const { error: settingsError } = await supabase
    .from('site_settings')
    .upsert(siteSettings, { onConflict: 'key' })
  if (settingsError) {
    console.error('❌ Settings failed:', settingsError.message)
    process.exit(1)
  }
  console.log(`✅ ${siteSettings.length} settings seeded`)

  console.log('\n🎉 Seeding complete!')
}

seed()

// Vercel Edge Middleware — randomize og:image on every request
// Social crawlers (Discord, iMessage, Twitter, Facebook) will each get a random artwork thumbnail

const OG_IMAGES = [
  // Broken Keys
  'broken-keys-web/the_void.jpg',
  'broken-keys-web/god_of_light.jpg',
  'broken-keys-web/serendipity.jpg',
  'broken-keys-web/the_rose_labyrinth.jpg',
  'broken-keys-web/rage.jpg',
  'broken-keys-web/the_looming_unknown.jpg',
  'broken-keys-web/the_chosen_one.jpg',
  'broken-keys-web/love_transcended.jpg',
  'broken-keys-web/the_first_piano.jpg',
  'broken-keys-web/self_portrait.jpg',
  'broken-keys-web/chaos.jpg',
  'broken-keys-web/a_space_odyssey,_2023.jpg',
  'broken-keys-web/i_dreamt_of_you_again_last_night.jpg',
  'broken-keys-web/ackstract_concerto.jpg',
  'broken-keys-web/god_of_shadows.jpg',
  'broken-keys-web/here_lies_the_king.jpg',
  'broken-keys-web/blue_birds.jpg',
  'broken-keys-web/the_collector.jpg',
  'broken-keys-web/skullpture_in_red_noise.jpg',
  'broken-keys-web/the_mad_pianist.jpg',
  // Piano Blossoms
  'piano_blossoms/web/self_portrait_physical_web.jpg',
  'piano_blossoms/web/muse_blossoms_physical_web.jpg',
  'piano_blossoms/web/wonderland_physical_web.jpg',
  'piano_blossoms/web/golden_afternoon_physical_web.jpg',
  'piano_blossoms/web/flower_demons_physical_web.jpg',
  'piano_blossoms/web/interblossom_physical_web.jpg',
  // Tempted in the Garden
  'piano_blossoms/web/tempted_physical_web.jpg',
  // Clown Party
  'clownparty/web/tinman_physical_web.jpg',
  'clownparty/web/heavy_mettle_physical_web.jpg',
  'clownparty/web/showtime_physical_web.jpg',
  'clownparty/web/spectackular_physical_web.jpg',
  'clownparty/web/pink_carousel_physical_web.jpg',
  // ACK Editions
  'ackeditions_gallery/web/void_engine_thumb.jpg',
];

export const config = {
  matcher: '/',
};

export default async function middleware(request) {
  const response = await fetch(request);

  // Only modify HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const pick = OG_IMAGES[Math.floor(Math.random() * OG_IMAGES.length)];
  const fullUrl = 'https://ack.art/' + pick;

  let html = await response.text();

  // Replace og:image and twitter:image content with the random pick
  html = html.replace(
    /(<meta\s+property="og:image"[^>]*content=")[^"]*(")/i,
    '$1' + fullUrl + '$2'
  );
  html = html.replace(
    /(<meta\s+name="twitter:image"[^>]*content=")[^"]*(")/i,
    '$1' + fullUrl + '$2'
  );

  return new Response(html, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'content-type': 'text/html; charset=utf-8',
      // Prevent caching so each share gets a fresh random pick
      'cache-control': 'no-cache, no-store, must-revalidate',
    },
  });
}

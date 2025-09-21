const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const axios = require('axios');
const handlebars = require('handlebars');

// Workers API Base URL
const WORKERS_API_BASE = 'https://arenastreams-api.enea-scalper.workers.dev';

// Register Handlebars helpers
handlebars.registerHelper('json', function(context) {
  return new handlebars.SafeString(JSON.stringify(context));
});

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.tailwindcss.com",
        "https://fpyf8.com",
        "https://kt.restowelected.com",
        "https://np.mournersamoa.com",
        "https://madurird.com",
        "https://al5sm.com",
        "https://shoukigaigoors.net",
        "https://tzegilo.com",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com"
      ],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "http:"],
      frameSrc: ["'self'", "https:", "http:"]
    }
  }
}));

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// SEO Configuration
const seoConfig = {
  siteName: 'ArenaStreams',
  siteDescription: 'Watch live sports streaming online free. Football, Basketball, Tennis, UFC, Rugby, Baseball, American Football, Cricket, Motor Sports, Hockey live streams in HD quality.',
  siteUrl: 'https://arenastreams.com',
  defaultImage: 'https://arenastreams.com/images/og-default.jpg',
  twitterHandle: '@ArenaStreams',
  sports: {
    football: {
      name: 'Football',
      description: 'Watch football live streams online free. Premier League, Champions League, La Liga, Serie A, Bundesliga matches.',
      keywords: 'football live stream, soccer streaming, premier league live, champions league stream, football matches online',
      image: 'https://arenastreams.com/images/football-og.jpg'
    },
    basketball: {
      name: 'Basketball',
      description: 'Watch basketball live streams online free. NBA games, college basketball, international basketball matches.',
      keywords: 'basketball live stream, NBA streaming, basketball games live, NBA live stream free',
      image: 'https://arenastreams.com/images/basketball-og.jpg'
    },
    tennis: {
      name: 'Tennis',
      description: 'Watch tennis live streams online free. Grand Slam tournaments, ATP, WTA matches, Wimbledon, US Open.',
      keywords: 'tennis live stream, tennis streaming, grand slam live, Wimbledon live stream',
      image: 'https://arenastreams.com/images/tennis-og.jpg'
    },
    ufc: {
      name: 'UFC',
      description: 'Watch UFC live streams online free. MMA fights, UFC events, boxing matches, combat sports.',
      keywords: 'UFC live stream, MMA streaming, UFC fights live, MMA fights free',
      image: 'https://arenastreams.com/images/ufc-og.jpg'
    },
    rugby: {
      name: 'Rugby',
      description: 'Watch rugby live streams online free. Six Nations, Rugby World Cup, Premiership, international rugby.',
      keywords: 'rugby live stream, rugby streaming, six nations live, rugby world cup stream',
      image: 'https://arenastreams.com/images/rugby-og.jpg'
    },
    baseball: {
      name: 'Baseball',
      description: 'Watch baseball live streams online free. MLB games, World Series, baseball matches, baseball streaming.',
      keywords: 'baseball live stream, MLB streaming, baseball games live, MLB live stream free',
      image: 'https://arenastreams.com/images/baseball-og.jpg'
    },
    'american-football': {
      name: 'American Football',
      description: 'Watch American Football live streams online free. NFL games, Super Bowl, college football, NFL streaming.',
      keywords: 'NFL live stream, American football streaming, NFL games live, Super Bowl live stream, college football live',
      image: 'https://arenastreams.com/images/americanfootball-og.jpg'
    },
    cricket: {
      name: 'Cricket',
      description: 'Watch cricket live streams online free. IPL, World Cup, Test matches, ODI, T20 cricket matches.',
      keywords: 'cricket live stream, cricket streaming, IPL live stream, cricket world cup, test match live, ODI cricket',
      image: 'https://arenastreams.com/images/cricket-og.jpg'
    },
    'motor-sports': {
      name: 'Motor Sports',
      description: 'Watch motor sports live streams online free. Formula 1, MotoGP, NASCAR, IndyCar, Rally racing live streams.',
      keywords: 'motor sports live stream, F1 live stream, MotoGP live stream, NASCAR live stream, Formula 1 streaming, racing live',
      image: 'https://arenastreams.com/images/motorsports-og.jpg'
    },
    hockey: {
      name: 'Hockey',
      description: 'Watch hockey live streams online free. NHL games, Stanley Cup, college hockey, international hockey matches.',
      keywords: 'hockey live stream, NHL streaming, hockey games live, NHL live stream free, Stanley Cup live, college hockey',
      image: 'https://arenastreams.com/images/hockey-og.jpg'
    }
  }
};

function getSportConfig(sport) {
  return seoConfig.sports[sport] || {
    name: sport.charAt(0).toUpperCase() + sport.slice(1),
    description: `Watch ${sport} live streams online free.`,
    keywords: `${sport} live stream, ${sport} streaming`
  }
}

// Simple template rendering without file system
function renderTemplate(templateName, data) {
  // For Vercel, we'll use a simple HTML response
  // In production, you might want to use a template engine that doesn't require file system
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.seo?.title || 'ArenaStreams - Live Sports Streaming'}</title>
        <meta name="description" content="${data.seo?.description || seoConfig.siteDescription}">
        <meta name="keywords" content="${data.seo?.keywords || 'live sports streaming'}">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="${data.seo?.canonical || seoConfig.siteUrl}">
        
        <!-- Open Graph -->
        <meta property="og:title" content="${data.seo?.ogTitle || data.seo?.title || 'ArenaStreams - Live Sports Streaming'}">
        <meta property="og:description" content="${data.seo?.ogDescription || data.seo?.description || seoConfig.siteDescription}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="${data.seo?.canonical || seoConfig.siteUrl}">
        <meta property="og:image" content="${data.seo?.ogImage || seoConfig.defaultImage}">
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="${data.seo?.twitterCard || 'summary_large_image'}">
        <meta name="twitter:title" content="${data.seo?.twitterTitle || data.seo?.title || 'ArenaStreams - Live Sports Streaming'}">
        <meta name="twitter:description" content="${data.seo?.twitterDescription || data.seo?.description || seoConfig.siteDescription}">
        <meta name="twitter:image" content="${data.seo?.twitterImage || seoConfig.defaultImage}">
        
        <!-- TailwindCSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            primary: '#ffcc00',
                            dark: '#1a1a1a',
                            darker: '#0f0f0f'
                        }
                    }
                }
            }
        </script>
        
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TM2J2414Z9"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TM2J2414Z9');
        </script>
    </head>
    <body class="bg-darker text-white min-h-screen">
        <!-- Header -->
        <header class="bg-dark border-b border-gray-800">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <h1 class="text-2xl font-bold text-primary">🏟️ ArenaStreams</h1>
                        <span class="text-gray-400 text-sm">Live Sports Streaming</span>
                    </div>
                    <nav class="hidden md:flex space-x-6">
                        <a href="/" class="text-white hover:text-primary transition-colors">Home</a>
                        <a href="/football" class="text-gray-400 hover:text-primary transition-colors">⚽ Football</a>
                        <a href="/basketball" class="text-gray-400 hover:text-primary transition-colors">🏀 Basketball</a>
                        <a href="/tennis" class="text-gray-400 hover:text-primary transition-colors">🎾 Tennis</a>
                        <a href="/ufc" class="text-gray-400 hover:text-primary transition-colors">🥊 UFC</a>
                        <a href="/rugby" class="text-gray-400 hover:text-primary transition-colors">🏉 Rugby</a>
                        <a href="/baseball" class="text-gray-400 hover:text-primary transition-colors">⚾ Baseball</a>
                        <a href="/american-football" class="text-gray-400 hover:text-primary transition-colors">🏈 American Football</a>
                        <a href="/cricket" class="text-gray-400 hover:text-primary transition-colors">🏏 Cricket</a>
                        <a href="/motor-sports" class="text-gray-400 hover:text-primary transition-colors">🏁 Motor Sports</a>
                        <a href="/hockey" class="text-gray-400 hover:text-primary transition-colors">🏒 Hockey</a>
                    </nav>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
            <section class="text-center mb-12">
                <h2 class="text-4xl md:text-6xl font-bold mb-4">
                    Live Sports <span class="text-primary">Streaming</span>
                </h2>
                <p class="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
                    Watch live football, basketball, tennis, UFC, rugby, baseball, American football and hockey matches in HD quality. 
                    Free streaming with no registration required.
                </p>
                
                <div class="bg-primary text-dark px-6 py-3 rounded-lg inline-block font-bold text-lg mb-6">
                    🎯 Select Your Sport Below
                </div>
            </section>

            <!-- Choose Your Sport -->
            <section class="mb-12">
                <div class="text-center mb-8">
                    <h3 class="text-3xl font-bold mb-4">
                        Choose Your <span class="text-primary">Sport</span>
                    </h3>
                    <p class="text-gray-400 text-lg">Click on any sport below to view live matches and streams</p>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
                    <a href="/football" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚽</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">Football</h4>
                        <p class="text-sm text-gray-400 mt-2">Premier League, Champions League</p>
                    </a>
                    <a href="/basketball" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🏀</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">Basketball</h4>
                        <p class="text-sm text-gray-400 mt-2">NBA, EuroLeague</p>
                    </a>
                    <a href="/tennis" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎾</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">Tennis</h4>
                        <p class="text-sm text-gray-400 mt-2">Grand Slams, ATP, WTA</p>
                    </a>
                    <a href="/ufc" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🥊</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">UFC</h4>
                        <p class="text-sm text-gray-400 mt-2">Fights, Championships</p>
                    </a>
                    <a href="/rugby" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🏉</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">Rugby</h4>
                        <p class="text-sm text-gray-400 mt-2">Six Nations, World Cup</p>
                    </a>
                    <a href="/baseball" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚾</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">Baseball</h4>
                        <p class="text-sm text-gray-400 mt-2">MLB, World Series</p>
                    </a>
                    <a href="/american-football" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🏈</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">American Football</h4>
                        <p class="text-sm text-gray-400 mt-2">NFL, Super Bowl</p>
                    </a>
                    <a href="/cricket" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🏏</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">Cricket</h4>
                        <p class="text-sm text-gray-400 mt-2">IPL, World Cup</p>
                    </a>
                    <a href="/motor-sports" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🏁</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">Motor Sports</h4>
                        <p class="text-sm text-gray-400 mt-2">F1, MotoGP, NASCAR</p>
                    </a>
                    <a href="/hockey" class="bg-dark border-2 border-gray-800 rounded-xl p-8 text-center hover:border-primary hover:bg-gray-800 transition-all duration-300 group transform hover:scale-105">
                        <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🏒</div>
                        <h4 class="font-bold text-lg group-hover:text-primary transition-colors">Hockey</h4>
                        <p class="text-sm text-gray-400 mt-2">NHL, Stanley Cup</p>
                    </a>
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="bg-dark border-t border-gray-800 mt-16">
            <div class="container mx-auto px-4 py-8">
                <div class="text-center text-gray-400 text-sm">
                    <p>&copy; 2025 ArenaStreams. All rights reserved. | Live sports streaming platform</p>
                </div>
            </div>
        </footer>

        <!-- JavaScript -->
        <script src="/js/main.js"></script>
    </body>
    </html>
  `;
}

// Routes
app.get('/', (req, res) => {
  const html = renderTemplate('homepage', {
    seo: {
      title: 'ArenaStreams - Live Sports Streaming | Football, Basketball, Tennis, UFC, American Football, Hockey',
      description: seoConfig.siteDescription,
      keywords: 'live sports streaming, football live stream, basketball streaming, tennis live, UFC fights, rugby streaming, baseball live, NFL live stream, American football streaming, hockey live stream',
      canonical: seoConfig.siteUrl,
      ogTitle: 'ArenaStreams - Live Sports Streaming',
      ogDescription: seoConfig.siteDescription,
      ogImage: seoConfig.defaultImage,
      twitterCard: 'summary_large_image',
      twitterTitle: 'ArenaStreams - Live Sports Streaming',
      twitterDescription: seoConfig.siteDescription,
      twitterImage: seoConfig.defaultImage
    }
  });
  res.send(html);
});

// Sport pages
app.get('/:sport', (req, res) => {
  const { sport } = req.params;
  const sportConfig = getSportConfig(sport);
  
  const html = renderTemplate('sport', {
    seo: {
      title: `${sportConfig.name} Live Streams | ArenaStreams - Free ${sportConfig.name} Streaming`,
      description: sportConfig.description,
      keywords: sportConfig.keywords,
      canonical: `${seoConfig.siteUrl}/${sport}`,
      ogTitle: `${sportConfig.name} Live Streams | ArenaStreams`,
      ogDescription: sportConfig.description,
      ogImage: sportConfig.image,
      twitterCard: 'summary_large_image',
      twitterTitle: `${sportConfig.name} Live Streams | ArenaStreams`,
      twitterDescription: sportConfig.description,
      twitterImage: sportConfig.image
    }
  });
  res.send(html);
});

// Workers API proxy endpoints (for backward compatibility)
app.get('/api/streamed/sports', async (req, res) => {
  try {
    const response = await axios.get(`${WORKERS_API_BASE}/api/sports`, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
});

app.get('/api/streamed/matches/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const response = await axios.get(`${WORKERS_API_BASE}/api/matches/${sport}`, {
      timeout: 15000
    });
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching ${sport} matches:`, error);
    res.status(500).json({ error: `Failed to fetch ${sport} matches` });
  }
});

app.get('/api/streamed/matches/live', async (req, res) => {
  try {
    const response = await axios.get(`${WORKERS_API_BASE}/api/matches/live`, {
      timeout: 15000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching live matches:', error);
    res.status(500).json({ error: 'Failed to fetch live matches' });
  }
});

app.get('/api/streamed/matches/all-today', async (req, res) => {
  try {
    const response = await axios.get(`${WORKERS_API_BASE}/api/matches/all-today`, {
      timeout: 15000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching today\'s matches:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s matches' });
  }
});

app.get('/api/streamed/stream/:source/:id', async (req, res) => {
  try {
    const { source, id } = req.params;
    const response = await axios.get(`${WORKERS_API_BASE}/api/stream/${source}/${id}`, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching stream ${source}/${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch stream' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Export for Vercel
module.exports = app;

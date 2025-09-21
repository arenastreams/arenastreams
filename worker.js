addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Handle different routes
  if (url.pathname === '/') {
    return handleHomepage(request)
  } else if (url.pathname.startsWith('/api/')) {
    return handleAPI(request)
  } else if (url.pathname.startsWith('/match/')) {
    return handleMatchPage(request)
  } else if (url.pathname.startsWith('/football')) {
    return handleSportPage(request, 'football')
  } else if (url.pathname.startsWith('/basketball')) {
    return handleSportPage(request, 'basketball')
  } else if (url.pathname.startsWith('/tennis')) {
    return handleSportPage(request, 'tennis')
  } else if (url.pathname.startsWith('/ufc')) {
    return handleSportPage(request, 'ufc')
  } else if (url.pathname.startsWith('/rugby')) {
    return handleSportPage(request, 'rugby')
  } else if (url.pathname.startsWith('/baseball')) {
    return handleSportPage(request, 'baseball')
  } else if (url.pathname.startsWith('/american-football')) {
    return handleSportPage(request, 'american-football')
  } else if (url.pathname.startsWith('/cricket')) {
    return handleSportPage(request, 'cricket')
  } else if (url.pathname.startsWith('/motor-sports')) {
    return handleSportPage(request, 'motor-sports')
  } else if (url.pathname.startsWith('/hockey')) {
    return handleSportPage(request, 'hockey')
  }
  
  return new Response('Not found', { status: 404 })
}

// Homepage handler
async function handleHomepage(request) {
  const sports = ['football', 'basketball', 'tennis', 'ufc', 'rugby', 'baseball', 'american-football', 'cricket', 'motor-sports', 'hockey']
  
  const html = renderTemplate('homepage', {
    seo: {
      title: 'ArenaStreams - Live Sports Streaming | Football, Basketball, Tennis, UFC, American Football, Hockey',
      description: 'Watch live sports streaming online free. Football, Basketball, Tennis, UFC, Rugby, Baseball, American Football, Cricket, Motor Sports, Hockey live streams in HD quality.',
      keywords: 'live sports streaming, football live stream, basketball streaming, tennis live, UFC fights, rugby streaming, baseball live, NFL live stream, American football streaming, hockey live stream',
      canonical: 'https://arenastreams.com',
      ogTitle: 'ArenaStreams - Live Sports Streaming',
      ogDescription: 'Watch live sports streaming online free. Football, Basketball, Tennis, UFC, Rugby, Baseball, American Football, Cricket, Motor Sports, Hockey live streams in HD quality.',
      ogImage: 'https://arenastreams.com/images/og-default.jpg',
      twitterCard: 'summary_large_image',
      twitterTitle: 'ArenaStreams - Live Sports Streaming',
      twitterDescription: 'Watch live sports streaming online free. Football, Basketball, Tennis, UFC, Rugby, Baseball, American Football, Cricket, Motor Sports, Hockey live streams in HD quality.',
      twitterImage: 'https://arenastreams.com/images/og-default.jpg'
    },
    sports: sports,
    timestamp: Date.now()
  })
  
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300'
    }
  })
}

// Sport page handler
async function handleSportPage(request, sport) {
  const sportConfig = getSportConfig(sport)
  
  const html = renderTemplate('sport', {
    title: `${sportConfig.name} Live Streams | ArenaStreams - Free ${sportConfig.name} Streaming`,
    description: sportConfig.description,
    keywords: sportConfig.keywords,
    sport: sportConfig
  })
  
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300'
    }
  })
}

// Match page handler
async function handleMatchPage(request) {
  const url = new URL(request.url)
  const slug = url.pathname.split('/match/')[1]
  
  // Fetch match data from Streamed.pk
  const matchData = await fetchMatchData(slug)
  
  if (!matchData) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>Match Not Found</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>Match Not Found</h1>
        <p>The match you're looking for doesn't exist or has expired.</p>
        <a href="/" style="color: #ffcc00;">← Back to Home</a>
      </body>
      </html>
    `, { status: 404 })
  }
  
  const html = renderTemplate('match', {
    title: `${matchData.teamA} vs ${matchData.teamB} - Live Stream | ArenaStreams`,
    description: `Watch ${matchData.teamA} vs ${matchData.teamB} live stream in HD quality. Free streaming with no registration required.`,
    keywords: `${matchData.teamA}, ${matchData.teamB}, live stream, ${matchData.sport}`,
    match: matchData
  })
  
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=60'
    }
  })
}

// API handler
async function handleAPI(request) {
  const url = new URL(request.url)
  
  // Streamed.pk API proxy endpoints
  if (url.pathname.startsWith('/api/streamed/matches/')) {
    const sport = url.pathname.split('/api/streamed/matches/')[1]
    return handleStreamedMatches(request, sport)
  }
  
  if (url.pathname === '/api/streamed/sports') {
    return handleStreamedSports(request)
  }
  
  if (url.pathname.startsWith('/api/streamed/stream/')) {
    const pathParts = url.pathname.split('/api/streamed/stream/')[1]
    const [source, id] = pathParts.split('/')
    return handleStreamedStream(request, source, id)
  }
  
  return new Response('API endpoint not found', { status: 404 })
}

// Streamed.pk matches handler
async function handleStreamedMatches(request, sport) {
  try {
    const response = await fetch(`https://streamed.pk/api/matches/${sport}`, {
      headers: {
        'User-Agent': 'ArenaStreams/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Apply filtering for american-football and rugby
    let matches = data
    if (Array.isArray(data)) {
      matches = data
    } else if (data.value && Array.isArray(data.value)) {
      matches = data.value
    } else {
      matches = []
    }
    
    if (sport === 'american-football') {
      matches = matches.filter(match => {
        const title = match.title ? match.title.toLowerCase() : ''
        const id = match.id ? match.id.toLowerCase() : ''
        
        // Exclude rugby matches
        const rugbyKeywords = [
          'rugby', 'npc:', 'super rugby', 'women\'s rugby', 'rugby world cup',
          'taranaki', 'hawkes bay', 'hawke\'s bay', 'counties manukau', 'auckland',
          'wellington', 'southland', 'canterbury', 'otago', 'tasman', 'waikato',
          'north harbour', 'northland', 'manawatu', 'bay of plenty', 'force', 'brumbies',
          'waratahs', 'reds', 'new zealand w', 'canada w'
        ]
        if (rugbyKeywords.some(keyword => title.includes(keyword) || id.includes(keyword))) {
          return false
        }
        
        // Exclude AFL matches
        const aflKeywords = [
          'afl', 'australian football', 'hawthorn', 'geelong cats', 'collingwood',
          'essendon', 'fremantle', 'brisbane lions', 'port adelaide', 'magpies',
          'bombers', 'dockers', 'power', 'premiership football', 'afl womens'
        ]
        if (aflKeywords.some(keyword => title.includes(keyword) || id.includes(keyword))) {
          return false
        }
        
        return true
      })
    } else if (sport === 'rugby') {
      matches = matches.filter(match => {
        const title = match.title ? match.title.toLowerCase() : ''
        const id = match.id ? match.id.toLowerCase() : ''
        
        // Exclude NFL/American football matches
        const nflKeywords = [
          'nfl:', 'nfl ', 'miami dolphins', 'buffalo bills', 'houston texans', 'jacksonville jaguars',
          'pittsburgh steelers', 'new england patriots', 'dallas cowboys', 'chicago bears',
          'green bay packers', 'cleveland browns', 'denver broncos', 'los angeles chargers',
          'arizona cardinals', 'san francisco 49ers', 'kansas city chiefs', 'new york giants',
          'detroit lions', 'baltimore ravens'
        ]
        if (nflKeywords.some(keyword => title.includes(keyword) || id.includes(keyword))) {
          return false
        }
        
        // Exclude AFL matches
        const aflKeywords = [
          'afl', 'australian football', 'hawthorn', 'geelong cats', 'collingwood',
          'essendon', 'fremantle', 'brisbane lions', 'port adelaide', 'magpies',
          'bombers', 'dockers', 'power', 'premiership football', 'afl womens'
        ]
        if (aflKeywords.some(keyword => title.includes(keyword) || id.includes(keyword))) {
          return false
        }
        
        return true
      })
    }
    
    return new Response(JSON.stringify(matches), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      }
    })
  } catch (error) {
    console.error(`Error fetching ${sport} matches:`, error)
    return new Response(JSON.stringify({ error: `Failed to fetch ${sport} matches` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Streamed.pk sports handler
async function handleStreamedSports(request) {
  try {
    const response = await fetch('https://streamed.pk/api/sports', {
      headers: {
        'User-Agent': 'ArenaStreams/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error fetching sports:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch sports' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Streamed.pk stream handler
async function handleStreamedStream(request, source, id) {
  try {
    const response = await fetch(`https://streamed.pk/api/stream/${source}/${id}`, {
      headers: {
        'User-Agent': 'ArenaStreams/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    })
  } catch (error) {
    console.error(`Error fetching stream ${source}/${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to fetch stream' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Fetch match data from Streamed.pk
async function fetchMatchData(slug) {
  const sports = ['football', 'basketball', 'tennis', 'ufc', 'rugby', 'baseball', 'american-football', 'cricket', 'motor-sports', 'hockey']
  
  for (const sport of sports) {
    try {
      const response = await fetch(`https://streamed.pk/api/matches/${sport}`, {
        headers: {
          'User-Agent': 'ArenaStreams/1.0'
        }
      })
      
      if (!response.ok) continue
      
      let matches = []
      const data = await response.json()
      
      if (Array.isArray(data)) {
        matches = data
      } else if (data.value && Array.isArray(data.value)) {
        matches = data.value
      }
      
      // Apply same filtering as in API handler
      if (sport === 'american-football') {
        matches = matches.filter(match => {
          const title = match.title ? match.title.toLowerCase() : ''
          const id = match.id ? match.id.toLowerCase() : ''
          
          const rugbyKeywords = [
            'rugby', 'npc:', 'super rugby', 'women\'s rugby', 'rugby world cup',
            'taranaki', 'hawkes bay', 'hawke\'s bay', 'counties manukau', 'auckland',
            'wellington', 'southland', 'canterbury', 'otago', 'tasman', 'waikato',
            'north harbour', 'northland', 'manawatu', 'bay of plenty', 'force', 'brumbies',
            'waratahs', 'reds', 'new zealand w', 'canada w'
          ]
          if (rugbyKeywords.some(keyword => title.includes(keyword) || id.includes(keyword))) {
            return false
          }
          
          const aflKeywords = [
            'afl', 'australian football', 'hawthorn', 'geelong cats', 'collingwood',
            'essendon', 'fremantle', 'brisbane lions', 'port adelaide', 'magpies',
            'bombers', 'dockers', 'power', 'premiership football', 'afl womens'
          ]
          if (aflKeywords.some(keyword => title.includes(keyword) || id.includes(keyword))) {
            return false
          }
          
          return true
        })
      } else if (sport === 'rugby') {
        matches = matches.filter(match => {
          const title = match.title ? match.title.toLowerCase() : ''
          const id = match.id ? match.id.toLowerCase() : ''
          
          const nflKeywords = [
            'nfl:', 'nfl ', 'miami dolphins', 'buffalo bills', 'houston texans', 'jacksonville jaguars',
            'pittsburgh steelers', 'new england patriots', 'dallas cowboys', 'chicago bears',
            'green bay packers', 'cleveland browns', 'denver broncos', 'los angeles chargers',
            'arizona cardinals', 'san francisco 49ers', 'kansas city chiefs', 'new york giants',
            'detroit lions', 'baltimore ravens'
          ]
          if (nflKeywords.some(keyword => title.includes(keyword) || id.includes(keyword))) {
            return false
          }
          
          const aflKeywords = [
            'afl', 'australian football', 'hawthorn', 'geelong cats', 'collingwood',
            'essendon', 'fremantle', 'brisbane lions', 'port adelaide', 'magpies',
            'bombers', 'dockers', 'power', 'premiership football', 'afl womens'
          ]
          if (aflKeywords.some(keyword => title.includes(keyword) || id.includes(keyword))) {
            return false
          }
          
          return true
        })
      }
      
      // Look for match by slug
      const foundMatch = matches.find(match => {
        if (match.id === slug) return true
        
        // For motor sports and NFL channel matches
        if ((sport === 'motor-sports' || sport === 'american-football') && match.id && !match.title.includes(' vs ')) {
          return match.id === slug
        }
        
        // For other sports, use slug-based matching
        let homeTeam = 'Team A'
        let awayTeam = 'Team B'
        
        if (match.teams && match.teams.home && match.teams.away) {
          homeTeam = match.teams.home.name || 'Team A'
          awayTeam = match.teams.away.name || 'Team B'
        } else if (match.title) {
          if (match.title.includes(' vs ')) {
            const titleParts = match.title.split(' vs ')
            if (titleParts.length === 2) {
              homeTeam = titleParts[0].trim()
              awayTeam = titleParts[1].trim()
            }
          } else {
            homeTeam = match.title
            awayTeam = 'Live'
          }
        }
        
        let dateStr
        if (match.date && match.date > 0) {
          dateStr = new Date(match.date).toISOString().split('T')[0]
        } else {
          dateStr = new Date().toISOString().split('T')[0]
        }
        
        const expectedSlug = `${homeTeam}-vs-${awayTeam}-live-${dateStr}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        return expectedSlug === slug
      })
      
      if (foundMatch) {
        // Process match data
        let homeTeam = 'Team A'
        let awayTeam = 'Team B'
        let teamABadge = ''
        let teamBBadge = ''
        
        if (foundMatch.teams && foundMatch.teams.home && foundMatch.teams.away) {
          homeTeam = foundMatch.teams.home.name || 'Team A'
          awayTeam = foundMatch.teams.away.name || 'Team B'
          teamABadge = foundMatch.teams.home.badge ? `https://streamed.pk/api/images/badge/${foundMatch.teams.home.badge}.webp` : ''
          teamBBadge = foundMatch.teams.away.badge ? `https://streamed.pk/api/images/badge/${foundMatch.teams.away.badge}.webp` : ''
        } else if (foundMatch.title) {
          if (foundMatch.title.includes(' vs ')) {
            const titleParts = foundMatch.title.split(' vs ')
            if (titleParts.length === 2) {
              homeTeam = titleParts[0].trim()
              awayTeam = titleParts[1].trim()
            }
          } else {
            homeTeam = foundMatch.title
            awayTeam = 'Live'
          }
        }
        
        let matchDate
        if (foundMatch.date && foundMatch.date > 0) {
          matchDate = new Date(foundMatch.date).toISOString()
        } else {
          const now = new Date()
          now.setHours(now.getHours() + 2)
          matchDate = now.toISOString()
        }
        
        return {
          id: foundMatch.id,
          teamA: homeTeam,
          teamB: awayTeam,
          competition: foundMatch.title || `${sport.charAt(0).toUpperCase() + sport.slice(1)} Match`,
          date: matchDate,
          slug: slug,
          teamABadge: teamABadge,
          teamBBadge: teamBBadge,
          status: (() => {
            if (foundMatch.title.includes(' vs ')) {
              return foundMatch.date && foundMatch.date > 0 ? 'upcoming' : 'live'
            } else {
              const channelKeywords = ['snf:', 'tnf:', 'mnf:', 'nfl network', 'espn', 'fox sports', 'cbs sports', 'nbc sports', 'abc sports']
              const isChannel = channelKeywords.some(keyword => foundMatch.title.toLowerCase().includes(keyword))
              return isChannel ? 'live' : (foundMatch.date && foundMatch.date > 0 ? 'upcoming' : 'live')
            }
          })(),
          poster: foundMatch.poster ? `https://streamed.pk/api/images/poster/${foundMatch.poster}` : '',
          popular: foundMatch.popular || false,
          sources: foundMatch.sources || [],
          category: foundMatch.category || sport,
          sport: sport
        }
      }
    } catch (error) {
      console.error(`Error searching ${sport} matches:`, error)
    }
  }
  
  return null
}

// Sport configuration
function getSportConfig(sport) {
  const configs = {
    football: {
      name: 'Football',
      description: 'Watch football live streams online free. Premier League, Champions League, La Liga, Serie A, Bundesliga matches.',
      keywords: 'football live stream, soccer streaming, premier league live, champions league stream, football matches online'
    },
    basketball: {
      name: 'Basketball',
      description: 'Watch basketball live streams online free. NBA games, college basketball, international basketball matches.',
      keywords: 'basketball live stream, NBA streaming, basketball games live, NBA live stream free'
    },
    tennis: {
      name: 'Tennis',
      description: 'Watch tennis live streams online free. Grand Slam tournaments, ATP, WTA matches, Wimbledon, US Open.',
      keywords: 'tennis live stream, tennis streaming, grand slam live, Wimbledon live stream'
    },
    ufc: {
      name: 'UFC',
      description: 'Watch UFC live streams online free. MMA fights, UFC events, boxing matches, combat sports.',
      keywords: 'UFC live stream, MMA streaming, UFC fights live, MMA fights free'
    },
    rugby: {
      name: 'Rugby',
      description: 'Watch rugby live streams online free. Six Nations, Rugby World Cup, Premiership, international rugby.',
      keywords: 'rugby live stream, rugby streaming, six nations live, rugby world cup stream'
    },
    baseball: {
      name: 'Baseball',
      description: 'Watch baseball live streams online free. MLB games, World Series, baseball matches, baseball streaming.',
      keywords: 'baseball live stream, MLB streaming, baseball games live, MLB live stream free'
    },
    'american-football': {
      name: 'American Football',
      description: 'Watch American Football live streams online free. NFL games, Super Bowl, college football, NFL streaming.',
      keywords: 'NFL live stream, American football streaming, NFL games live, Super Bowl live stream, college football live'
    },
    cricket: {
      name: 'Cricket',
      description: 'Watch cricket live streams online free. IPL, World Cup, Test matches, ODI, T20 cricket matches.',
      keywords: 'cricket live stream, cricket streaming, IPL live stream, cricket world cup, test match live, ODI cricket'
    },
    'motor-sports': {
      name: 'Motor Sports',
      description: 'Watch motor sports live streams online free. Formula 1, MotoGP, NASCAR, IndyCar, Rally racing live streams.',
      keywords: 'motor sports live stream, F1 live stream, MotoGP live stream, NASCAR live stream, Formula 1 streaming, racing live'
    },
    hockey: {
      name: 'Hockey',
      description: 'Watch hockey live streams online free. NHL games, Stanley Cup, college hockey, international hockey matches.',
      keywords: 'hockey live stream, NHL streaming, hockey games live, NHL live stream free, Stanley Cup live, college hockey'
    }
  }
  
  return configs[sport] || {
    name: sport.charAt(0).toUpperCase() + sport.slice(1),
    description: `Watch ${sport} live streams online free.`,
    keywords: `${sport} live stream, ${sport} streaming`
  }
}

// Template rendering
function renderTemplate(templateName, data) {
  const templates = {
    homepage: `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Cache-busting: {{timestamp}} -->
    <!-- Provider script - controlled by advanced-ads.js -->
    <script id="adblock-provider-script" data-src="https://fpyf8.com/88/tag.min.js" data-zone="171670" data-cfasync="false"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-TM2J2414Z9"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-TM2J2414Z9', {
            page_title: '{{seo.title}}',
            page_location: '{{seo.canonical}}'
        });
    </script>
    
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{seo.title}}</title>
    <meta name="description" content="{{seo.description}}">
    <meta name="keywords" content="{{seo.keywords}}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{{seo.canonical}}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="{{seo.ogTitle}}">
    <meta property="og:description" content="{{seo.ogDescription}}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{seo.canonical}}">
    <meta property="og:image" content="{{seo.ogImage}}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="{{seo.twitterCard}}">
    <meta name="twitter:title" content="{{seo.twitterTitle}}">
    <meta name="twitter:description" content="{{seo.twitterDescription}}">
    <meta name="twitter:image" content="{{seo.twitterImage}}">
    
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
    <style>
        /* Show the adblock banner only when adblock is detected (class added by advanced-ads.js) */
        #adblock-banner { display: none; }
        body.adblock-on #adblock-banner { display: block; }
    </style>
    
    <!-- Advanced Ad System -->
    <script src="/js/advanced-ads.js"></script>
    
    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ArenaStreams",
        "url": "https://arenastreams.com",
        "description": "Live sports streaming platform for football, basketball, tennis, UFC, rugby, baseball, American football and hockey",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://arenastreams.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }
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
                <div class="flex items-center space-x-3">
                    <!-- Mobile Menu Button -->
                    <div class="md:hidden">
                        <button id="mobile-menu-btn" class="text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- AdBlock Banner (only visible when AdBlock is ON) -->
    <div id="adblock-banner" class="bg-dark border-b border-yellow-500">
        <div class="container mx-auto px-4 py-3">
            <div class="flex flex-col md:flex-row items-center justify-between gap-3">
                <div class="text-sm md:text-base text-gray-200 leading-snug">
                    <span class="mr-2">❤️</span>
                    We keep streams alive with ads.
                    <span class="hidden md:inline">Turn off AdBlock for ArenaStreams and unlock the cleaner version → just 5 ads per match.</span>
                    <span class="md:hidden block mt-1">Turn off AdBlock for ArenaStreams and unlock the cleaner version → just 5 ads per match.</span>
                </div>
                <a href="#" id="whitelist-btn" class="bg-primary text-dark font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm md:text-base">
                    Whitelist Us for Fewer Ads
                </a>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
        <!-- Hero Section -->
        <section class="text-center mb-12">
            <h2 class="text-4xl md:text-6xl font-bold mb-4">
                Live Sports <span class="text-primary">Streaming</span>
            </h2>
            <p class="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
                Watch live football, basketball, tennis, UFC, rugby, baseball, American football and hockey matches in HD quality. 
                Free streaming with no registration required.
            </p>
            
            <!-- Today's Date Display -->
            <div class="bg-dark border border-gray-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p class="text-lg font-semibold text-primary" id="current-date">Loading today's date...</p>
                <p class="text-sm text-gray-400">Choose your sport below to start watching</p>
            </div>
            
            <!-- Welcome Message -->
            <div class="bg-primary text-dark px-6 py-3 rounded-lg inline-block font-bold text-lg mb-6">
                🎯 Select Your Sport Below
            </div>
            
            <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <span class="flex items-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    HD Quality
                </span>
                <span class="flex items-center">
                    <span class="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    No Registration
                </span>
                <span class="flex items-center">
                    <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Free Streaming
                </span>
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
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h4 class="text-xl font-bold text-primary mb-4">🏟️ ArenaStreams</h4>
                    <p class="text-gray-400 text-sm">
                        Your ultimate destination for live sports streaming. Watch football, basketball, tennis, UFC, rugby, baseball, American football and hockey in HD quality.
                    </p>
                </div>
                <div>
                    <h5 class="font-semibold mb-4">Sports</h5>
                    <ul class="space-y-2 text-sm text-gray-400">
                        <li><a href="/football" class="hover:text-primary transition-colors">Football</a></li>
                        <li><a href="/basketball" class="hover:text-primary transition-colors">Basketball</a></li>
                        <li><a href="/tennis" class="hover:text-primary transition-colors">Tennis</a></li>
                        <li><a href="/ufc" class="hover:text-primary transition-colors">UFC</a></li>
                        <li><a href="/rugby" class="hover:text-primary transition-colors">Rugby</a></li>
                        <li><a href="/baseball" class="hover:text-primary transition-colors">Baseball</a></li>
                        <li><a href="/american-football" class="hover:text-primary transition-colors">American Football</a></li>
                        <li><a href="/cricket" class="hover:text-primary transition-colors">Cricket</a></li>
                        <li><a href="/motor-sports" class="hover:text-primary transition-colors">Motor Sports</a></li>
                        <li><a href="/hockey" class="hover:text-primary transition-colors">Hockey</a></li>
                    </ul>
                </div>
                <div>
                    <h5 class="font-semibold mb-4">Quick Links</h5>
                    <ul class="space-y-2 text-sm text-gray-400">
                        <li><a href="/football" class="hover:text-primary transition-colors">Football</a></li>
                        <li><a href="/basketball" class="hover:text-primary transition-colors">Basketball</a></li>
                        <li><a href="/tennis" class="hover:text-primary transition-colors">Tennis</a></li>
                        <li><a href="/ufc" class="hover:text-primary transition-colors">UFC</a></li>
                        <li><a href="/rugby" class="hover:text-primary transition-colors">Rugby</a></li>
                        <li><a href="/baseball" class="hover:text-primary transition-colors">Baseball</a></li>
                        <li><a href="/american-football" class="hover:text-primary transition-colors">American Football</a></li>
                        <li><a href="/cricket" class="hover:text-primary transition-colors">Cricket</a></li>
                        <li><a href="/motor-sports" class="hover:text-primary transition-colors">Motor Sports</a></li>
                        <li><a href="/hockey" class="hover:text-primary transition-colors">Hockey</a></li>
                    </ul>
                </div>
                <div>
                    <h5 class="font-semibold mb-4">Legal</h5>
                    <ul class="space-y-2 text-sm text-gray-400">
                        <li><a href="/privacy" class="hover:text-primary transition-colors">Privacy Policy</a></li>
                        <li><a href="/terms" class="hover:text-primary transition-colors">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                <p>&copy; 2025 ArenaStreams. All rights reserved. | Live sports streaming platform</p>
            </div>
        </div>
    </footer>

    <!-- JavaScript -->
    <script>
        // Display today's date
        function displayTodaysDate() {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const formattedDate = now.toLocaleDateString('en-US', options);
            document.getElementById('current-date').textContent = formattedDate;
        }

        // Initialize homepage
        document.addEventListener('DOMContentLoaded', function() {
            displayTodaysDate();
        });
    </script>
</body>
</html>`,

    sport: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <meta name="description" content="{{description}}">
    <meta name="keywords" content="{{keywords}}">
    <meta property="og:title" content="{{title}}">
    <meta property="og:description" content="{{description}}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{title}}">
    <meta name="twitter:description" content="{{description}}">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <nav class="bg-gray-800 shadow-lg">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-2">
                    <span class="text-2xl">🏟️</span>
                    <a href="/" class="text-2xl font-bold text-yellow-400">ArenaStreams</a>
                </div>
                <div class="hidden md:flex space-x-6">
                    <a href="/" class="hover:text-yellow-400 transition-colors">Home</a>
                    <a href="/football" class="hover:text-yellow-400 transition-colors">Football</a>
                    <a href="/basketball" class="hover:text-yellow-400 transition-colors">Basketball</a>
                    <a href="/tennis" class="hover:text-yellow-400 transition-colors">Tennis</a>
                    <a href="/ufc" class="hover:text-yellow-400 transition-colors">UFC</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
        <div class="mb-8">
            <h1 class="text-4xl font-bold mb-4">{{sport.name}} Live Streams</h1>
            <p class="text-gray-300 text-lg">{{sport.description}}</p>
        </div>

        <div id="matches-container" class="space-y-6">
            <div class="text-center text-gray-400">Loading {{sport.name}} matches...</div>
        </div>
    </main>

    <script>
        async function loadMatches() {
            try {
                const sport = window.location.pathname.split('/')[1];
                const response = await fetch(\`/api/streamed/matches/\${sport}\`);
                const matches = await response.json();
                
                const container = document.getElementById('matches-container');
                if (Array.isArray(matches) && matches.length > 0) {
                    container.innerHTML = matches.map(match => \`
                        <div class="bg-gray-800 rounded-lg p-6">
                            <h3 class="text-xl font-semibold mb-2">\${match.title || 'Live Match'}</h3>
                            <p class="text-gray-400 mb-4">\${match.sport || sport}</p>
                            <a href="/match/\${match.id}" class="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors">
                                Watch Live
                            </a>
                        </div>
                    \`).join('');
                } else {
                    container.innerHTML = '<div class="text-center text-gray-400">No matches available at the moment.</div>';
                }
            } catch (error) {
                console.error('Error loading matches:', error);
                document.getElementById('matches-container').innerHTML = '<div class="text-center text-gray-400">Error loading matches.</div>';
            }
        }
        
        loadMatches();
    </script>
</body>
</html>`,

    match: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <meta name="description" content="{{description}}">
    <meta name="keywords" content="{{keywords}}">
    <meta property="og:title" content="{{title}}">
    <meta property="og:description" content="{{description}}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{title}}">
    <meta name="twitter:description" content="{{description}}">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <nav class="bg-gray-800 shadow-lg">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-2">
                    <span class="text-2xl">🏟️</span>
                    <a href="/" class="text-2xl font-bold text-yellow-400">ArenaStreams</a>
                </div>
                <div class="hidden md:flex space-x-6">
                    <a href="/" class="hover:text-yellow-400 transition-colors">Home</a>
                    <a href="/football" class="hover:text-yellow-400 transition-colors">Football</a>
                    <a href="/basketball" class="hover:text-yellow-400 transition-colors">Basketball</a>
                    <a href="/tennis" class="hover:text-yellow-400 transition-colors">Tennis</a>
                    <a href="/ufc" class="hover:text-yellow-400 transition-colors">UFC</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold mb-4">{{match.teamA}} vs {{match.teamB}}</h1>
            <p class="text-gray-300 text-lg">{{match.competition}}</p>
            <div class="mt-4">
                <span class="bg-green-500 text-black px-4 py-2 rounded-lg font-semibold">
                    {{match.status === 'live' ? '🔴 LIVE' : '⏰ Upcoming'}}
                </span>
            </div>
        </div>

        <div class="max-w-4xl mx-auto">
            <div class="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 class="text-2xl font-semibold mb-4">Watch Live Stream</h2>
                <div id="stream-container" class="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div class="text-center">
                        <div class="text-6xl mb-4">📺</div>
                        <p class="text-gray-400">Stream will be available here</p>
                        <p class="text-sm text-gray-500 mt-2">Click to start watching</p>
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-6">
                <h3 class="text-xl font-semibold mb-4">Match Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-yellow-400">Teams</h4>
                        <p>{{match.teamA}} vs {{match.teamB}}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-yellow-400">Competition</h4>
                        <p>{{match.competition}}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-yellow-400">Status</h4>
                        <p>{{match.status === 'live' ? 'Live' : 'Upcoming'}}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-yellow-400">Sport</h4>
                        <p>{{match.sport}}</p>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Add click handler for stream container
        document.getElementById('stream-container').addEventListener('click', function() {
            // In a real implementation, this would load the actual stream
            this.innerHTML = \`
                <div class="text-center">
                    <div class="text-6xl mb-4">🎥</div>
                    <p class="text-green-400">Stream Loading...</p>
                    <p class="text-sm text-gray-500 mt-2">Please wait while we prepare the stream</p>
                </div>
            \`;
        });
    </script>
</body>
</html>`
  }
  
  let html = templates[templateName] || templates.homepage
  
  // Replace placeholders
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object') {
      for (const [subKey, subValue] of Object.entries(value)) {
        html = html.replace(new RegExp(`{{${key}\\.${subKey}}}`, 'g'), subValue || '')
      }
    } else {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value || '')
    }
  }
  
  return html
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Enable CORS for Vercel frontend
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  // API routes
  if (url.pathname.startsWith('/api/matches/')) {
    const sport = url.pathname.split('/api/matches/')[1]
    return handleMatches(request, sport, corsHeaders)
  }
  
  if (url.pathname === '/api/sports') {
    return handleSports(request, corsHeaders)
  }
  
  if (url.pathname.startsWith('/api/stream/')) {
    const pathParts = url.pathname.split('/api/stream/')[1]
    const [source, id] = pathParts.split('/')
    return handleStream(request, source, id, corsHeaders)
  }
  
  if (url.pathname.startsWith('/api/stream/embed/')) {
    const id = url.pathname.split('/api/stream/embed/')[1]
    return handleStreamEmbed(request, id, corsHeaders)
  }
  
  if (url.pathname.startsWith('/api/match/')) {
    const slug = url.pathname.split('/api/match/')[1]
    return handleMatch(request, slug, corsHeaders)
  }
  
  // Health check
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  
  return new Response('API endpoint not found', { 
    status: 404,
    headers: corsHeaders
  })
}

// Handle matches endpoint
async function handleMatches(request, sport, corsHeaders) {
  try {
    const response = await fetch(`https://streamed.pk/api/matches/${sport}`, {
      headers: {
        'User-Agent': 'ArenaStreams-API/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Apply filtering
    let matches = data
    if (Array.isArray(data)) {
      matches = data
    } else if (data.value && Array.isArray(data.value)) {
      matches = data.value
    } else {
      matches = []
    }
    
    // Apply sport-specific filtering
    matches = filterMatches(matches, sport)
    
    return new Response(JSON.stringify(matches), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    })
  } catch (error) {
    console.error(`Error fetching ${sport} matches:`, error)
    return new Response(JSON.stringify({ 
      error: `Failed to fetch ${sport} matches`,
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Handle sports endpoint
async function handleSports(request, corsHeaders) {
  try {
    const response = await fetch('https://streamed.pk/api/sports', {
      headers: {
        'User-Agent': 'ArenaStreams-API/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error fetching sports:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch sports',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Handle stream endpoint
async function handleStream(request, source, id, corsHeaders) {
  try {
    const response = await fetch(`https://streamed.pk/api/stream/${source}/${id}`, {
      headers: {
        'User-Agent': 'ArenaStreams-API/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    })
  } catch (error) {
    console.error(`Error fetching stream ${source}/${id}:`, error)
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch stream',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Handle stream embed endpoint
async function handleStreamEmbed(request, id, corsHeaders) {
  try {
    const response = await fetch(`https://streamed.pk/api/stream/embed/${id}`, {
      headers: {
        'User-Agent': 'ArenaStreams-API/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    })
  } catch (error) {
    console.error(`Error fetching stream embed ${id}:`, error)
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch stream embed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Handle match endpoint (for match pages)
async function handleMatch(request, slug, corsHeaders) {
  const sports = ['football', 'basketball', 'tennis', 'ufc', 'rugby', 'baseball', 'american-football', 'cricket', 'motor-sports', 'hockey']
  
  for (const sport of sports) {
    try {
      const response = await fetch(`https://streamed.pk/api/matches/${sport}`, {
        headers: {
          'User-Agent': 'ArenaStreams-API/1.0'
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
      
      // Apply filtering
      matches = filterMatches(matches, sport)
      
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
        
        const matchData = {
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
        
        return new Response(JSON.stringify(matchData), {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'
          }
        })
      }
    } catch (error) {
      console.error(`Error searching ${sport} matches:`, error)
    }
  }
  
  return new Response(JSON.stringify({ error: 'Match not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Filter matches based on sport
function filterMatches(matches, sport) {
  if (sport === 'american-football') {
    return matches.filter(match => {
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
    return matches.filter(match => {
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
  
  return matches
}

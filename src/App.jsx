import { useState, useEffect } from 'react'
import {
  Trophy,
  Gamepad2,
  Plus,
  UserPlus,
  Edit2,
  Trash2,
  X,
  Lock,
  Unlock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Star,
  Check,
  Calendar,
  AlertCircle
} from 'lucide-react'
import './App.css'
import worldCupData from './assets/worldcup2026.json'

// Dictionary to translate country names to Portuguese
const TEAM_TRANSLATIONS = {
  'Mexico': 'México',
  'South Africa': 'África do Sul',
  'South Korea': 'Coreia do Sul',
  'Czech Republic': 'República Tcheca',
  'Canada': 'Canadá',
  'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
  'Bosnia & Herzegovina': 'Bósnia e Herzegovina',
  'Qatar': 'Catar',
  'Switzerland': 'Suíça',
  'Brazil': 'Brasil',
  'Morocco': 'Marrocos',
  'Haiti': 'Haiti',
  'Scotland': 'Escócia',
  'USA': 'EUA',
  'Paraguay': 'Paraguai',
  'Australia': 'Austrália',
  'Turkey': 'Turquia',
  'Germany': 'Alemanha',
  'Curaçao': 'Curaçao',
  'Ivory Coast': 'Costa do Marfim',
  'Ecuador': 'Equador',
  'Netherlands': 'Holanda',
  'Japan': 'Japão',
  'Sweden': 'Suécia',
  'Tunisia': 'Tunísia',
  'Belgium': 'Bélgica',
  'Egypt': 'Egito',
  'Iran': 'Irã',
  'New Zealand': 'Nova Zelândia',
  'Spain': 'Espanha',
  'Cape Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arábia Saudita',
  'Uruguay': 'Uruguai',
  'France': 'França',
  'Senegal': 'Senegal',
  'Iraq': 'Iraque',
  'Norway': 'Noruega',
  'Argentina': 'Argentina',
  'Algeria': 'Argélia',
  'Austria': 'Áustria',
  'Jordan': 'Jordânia',
  'Portugal': 'Portugal',
  'DR Congo': 'RD Congo',
  'Uzbekistan': 'Uzbequistão',
  'Colombia': 'Colômbia',
  'England': 'Inglaterra',
  'Croatia': 'Croácia',
  'Panama': 'Panamá',
  'Ghana': 'Gana'
}

// Flags mapped to emojis
const TEAM_FLAGS = {
  'Mexico': '🇲🇽',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  'Czech Republic': '🇨🇿',
  'Canada': '🇨🇦',
  'Bosnia and Herzegovina': '🇧🇦',
  'Bosnia & Herzegovina': '🇧🇦',
  'Qatar': '🇶🇦',
  'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷',
  'Morocco': '🇲🇦',
  'Haiti': '🇭🇹',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA': '🇺🇸',
  'Paraguay': '🇵🇾',
  'Australia': '🇦🇺',
  'Turkey': '🇹🇷',
  'Germany': '🇩🇪',
  'Curaçao': '🇨🇼',
  'Ivory Coast': '🇨🇮',
  'Ecuador': '🇪🇨',
  'Netherlands': '🇳🇱',
  'Japan': '🇯🇵',
  'Sweden': '🇸🇪',
  'Tunisia': '🇹🇳',
  'Belgium': '🇧🇪',
  'Egypt': '🇪🇬',
  'Iran': '🇮🇷',
  'New Zealand': '🇳🇿',
  'Spain': '🇪🇸',
  'Cape Verde': '🇨🇻',
  'Saudi Arabia': '🇸🇦',
  'Uruguay': '🇺🇾',
  'France': '🇫🇷',
  'Senegal': '🇸🇳',
  'Iraq': '🇮🇶',
  'Norway': '🇳🇴',
  'Argentina': '🇦🇷',
  'Algeria': '🇩🇿',
  'Austria': '🇦🇹',
  'Jordan': '🇯🇴',
  'Portugal': '🇵🇹',
  'DR Congo': '🇨🇩',
  'Uzbekistan': '🇺🇿',
  'Colombia': '🇨🇴',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croatia': '🇭🇷',
  'Panama': '🇵🇦',
  'Ghana': '🇬🇭'
}

// Map the raw JSON to our Bolão schema
const DEFAULT_MATCHES = worldCupData.matches.map((m, index) => {
  const homeTeam = TEAM_TRANSLATIONS[m.team1] || m.team1
  const awayTeam = TEAM_TRANSLATIONS[m.team2] || m.team2
  const homeFlag = TEAM_FLAGS[m.team1] || '⚽'
  const awayFlag = TEAM_FLAGS[m.team2] || '⚽'

  const hasScore = m.score && m.score.ft
  const homeScore = hasScore ? m.score.ft[0] : null
  const awayScore = hasScore ? m.score.ft[1] : null
  const status = hasScore ? 'finished' : 'pending'

  // Preserving user requested guesses
  let guesses = {}
  if (m.team1 === 'USA' && m.team2 === 'Paraguay') {
    guesses = {
      'Keila': { homeScore: 2, awayScore: 1 },
      'André': { homeScore: 1, awayScore: 2 },
      'Luque': { homeScore: 1, awayScore: 2 },
      'LJ': { homeScore: 1, awayScore: 1 },
      'Sara': { homeScore: 3, awayScore: 2 }
    }
  } else if (m.team1 === 'Qatar' && m.team2 === 'Switzerland') {
    guesses = {
      'André': { homeScore: 0, awayScore: 2 },
      'Matheus': { homeScore: 0, awayScore: 2 },
      'Gi': { homeScore: 0, awayScore: 1 }
    }
  }

  return {
    id: String(index + 1),
    homeTeam,
    awayTeam,
    homeFlag,
    awayFlag,
    homeScore,
    awayScore,
    status,
    date: m.date,
    time: m.time || '',
    group: m.group || '',
    round: m.round || '',
    guesses
  }
})

const INITIAL_PARTICIPANTS = ['Keila', 'André', 'Luque', 'LJ', 'Sara', 'Matheus', 'Gi', 'Dany']

function App() {
  // Load settings
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem('bolao_participants')
    return saved ? JSON.parse(saved) : INITIAL_PARTICIPANTS
  })

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('bolao_matches')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.length < 10) {
        return DEFAULT_MATCHES
      }
      return parsed
    }
    return DEFAULT_MATCHES
  })

  const [ignoreDateLock, setIgnoreDateLock] = useState(() => {
    const saved = localStorage.getItem('bolao_ignore_date_lock')
    return saved ? saved === 'true' : false
  })

  const [activeTab, setActiveTab] = useState('ranking') // 'ranking' | 'matches' | 'admin'
  const [matchFilter, setMatchFilter] = useState('today') // 'today' | 'pending' | 'finished' | 'all'
  const [expandedMatches, setExpandedMatches] = useState({ '1': true, '2': true })
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'success' | 'error'

  // Modals state
  const [editingMatch, setEditingMatch] = useState(null)
  const [addingMatch, setAddingMatch] = useState(false)
  const [addingParticipant, setAddingParticipant] = useState(false)
  const [addingGuess, setAddingGuess] = useState(null) // { matchId }

  // Form states
  const [newMatchData, setNewMatchData] = useState({
    homeTeam: '',
    awayTeam: '',
    homeFlag: '🇧🇷',
    awayFlag: '🇦🇷',
    status: 'pending',
    date: new Date().toLocaleDateString('en-CA'),
    time: '12:00 UTC-3'
  })
  const [newParticipantName, setNewParticipantName] = useState('')
  const [newGuessData, setNewGuessData] = useState({
    name: '',
    homeScore: 0,
    awayScore: 0
  })

  // Date constants
  const todayStr = new Date().toLocaleDateString('en-CA')

  // Auto-switch default filter on mount if no games today
  useEffect(() => {
    const hasMatchesToday = matches.some(m => m.date === todayStr)
    if (!hasMatchesToday) {
      setMatchFilter('pending')
    }
  }, [])

  // Auto-sync official scores from GitHub on mount
  useEffect(() => {
    syncOfficialScores(true)
  }, [])

  // Save changes
  useEffect(() => {
    localStorage.setItem('bolao_participants', JSON.stringify(participants))
  }, [participants])

  useEffect(() => {
    localStorage.setItem('bolao_matches', JSON.stringify(matches))
  }, [matches])

  useEffect(() => {
    localStorage.setItem('bolao_ignore_date_lock', String(ignoreDateLock))
  }, [ignoreDateLock])

  // Helper date status
  const getMatchDateStatus = (matchDate) => {
    if (matchDate === todayStr) return 'open_today'
    if (matchDate > todayStr) return 'future'
    return 'past'
  }

  // Parse date and time with offset to create local Date
  const getMatchDateTime = (dateStr, timeStr) => {
    if (!timeStr) return new Date(dateStr + 'T23:59:59')
    
    const parts = timeStr.trim().split(/\s+/)
    const timeVal = parts[0] // "18:00"
    const tzVal = parts[1] || 'UTC' // "UTC-7"
    
    let tzOffset = 'Z'
    if (tzVal.startsWith('UTC')) {
      const offsetPart = tzVal.substring(3)
      if (offsetPart) {
        const sign = offsetPart.charAt(0)
        const val = offsetPart.substring(1)
        let [hours, mins] = val.split(':')
        if (!mins) mins = '00'
        const paddedHours = hours.padStart(2, '0')
        tzOffset = `${sign}${paddedHours}:${mins}`
      }
    }
    
    return new Date(`${dateStr}T${timeVal}:00${tzOffset}`)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const toggleExpand = (matchId) => {
    setExpandedMatches(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }))
  }

  // Sync Official Scores
  const syncOfficialScores = async (silent = false) => {
    if (!silent) setSyncStatus('syncing')
    try {
      // Fetch live openfootball dataset
      const response = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json')
      if (!response.ok) throw new Error('Falha de conexão')
      const data = await response.json()
      
      let updatedCount = 0
      setMatches(prevMatches => {
        const nextMatches = prevMatches.map((localMatch, idx) => {
          // Look up corresponding match in the API data by index
          const fetchedMatch = data.matches[idx]
          if (fetchedMatch && fetchedMatch.score && fetchedMatch.score.ft) {
            const [ftHome, ftAway] = fetchedMatch.score.ft
            const hasChanged = localMatch.homeScore !== ftHome || 
                               localMatch.awayScore !== ftAway || 
                               localMatch.status !== 'finished'
            
            if (hasChanged) {
              updatedCount++
              return {
                ...localMatch,
                homeScore: ftHome,
                awayScore: ftAway,
                status: 'finished'
              }
            }
          }
          return localMatch
        })
        return nextMatches
      })

      if (!silent) {
        setSyncStatus('success')
        if (updatedCount > 0) {
          alert(`${updatedCount} jogos foram atualizados com placares oficiais!`)
        } else {
          alert('Todos os placares já estão atualizados!')
        }
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
      if (!silent) {
        setSyncStatus('error')
        alert('Erro ao sincronizar placares. Verifique sua conexão.')
      }
    }
  }

  // Scoring logic
  const getGuessPoints = (guess, match) => {
    if (match.status !== 'finished' || match.homeScore === null || match.awayScore === null) {
      return { points: 0, type: 'none' }
    }

    const matchHome = Number(match.homeScore)
    const matchAway = Number(match.awayScore)
    const guessHome = Number(guess.homeScore)
    const guessAway = Number(guess.awayScore)

    if (guessHome === matchHome && guessAway === matchAway) {
      return { points: 3, type: 'exact' }
    }

    const matchOutcome = matchHome > matchAway ? 'home' : (matchHome < matchAway ? 'away' : 'draw')
    const guessOutcome = guessHome > guessAway ? 'home' : (guessHome < guessAway ? 'away' : 'draw')

    if (matchOutcome === guessOutcome) {
      return { points: 1, type: 'outcome' }
    }

    return { points: 0, type: 'miss' }
  }

  // Calculate Leaderboard
  const leaderboard = participants.map(name => {
    let totalPoints = 0
    let exactCount = 0
    let outcomeCount = 0
    let matchesGuessed = 0

    matches.forEach(match => {
      const guess = match.guesses[name]
      if (guess) {
        matchesGuessed++
        const { points, type } = getGuessPoints(guess, match)
        totalPoints += points
        if (type === 'exact') exactCount++
        if (type === 'outcome') outcomeCount++
      }
    })

    return {
      name,
      points: totalPoints,
      exactCount,
      outcomeCount,
      matchesGuessed
    }
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.exactCount !== a.exactCount) return b.exactCount - a.exactCount
    if (b.outcomeCount !== a.outcomeCount) return b.outcomeCount - a.outcomeCount
    return a.name.localeCompare(b.name)
  })

  // Handlers
  const handleResetData = () => {
    if (window.confirm('Tem certeza que deseja resetar os dados do bolão? Todos os palpites e placares criados serão excluídos.')) {
      setParticipants(INITIAL_PARTICIPANTS)
      setMatches(DEFAULT_MATCHES)
      setIgnoreDateLock(false)
      localStorage.removeItem('bolao_participants')
      localStorage.removeItem('bolao_matches')
      localStorage.removeItem('bolao_ignore_date_lock')
      alert('Dados resetados com sucesso!')
    }
  }

  // Match CRUD
  const handleSaveMatchScore = (e) => {
    e.preventDefault()
    setMatches(prev => prev.map(m => m.id === editingMatch.id ? editingMatch : m))
    setEditingMatch(null)
  }

  const handleCreateMatch = (e) => {
    e.preventDefault()
    if (!newMatchData.homeTeam || !newMatchData.awayTeam) {
      alert('Por favor, preencha o nome dos times.')
      return
    }

    const newMatch = {
      id: Date.now().toString(),
      homeTeam: newMatchData.homeTeam,
      awayTeam: newMatchData.awayTeam,
      homeFlag: newMatchData.homeFlag || '⚽',
      awayFlag: newMatchData.awayFlag || '⚽',
      homeScore: newMatchData.status === 'finished' ? 0 : null,
      awayScore: newMatchData.status === 'finished' ? 0 : null,
      status: newMatchData.status,
      date: newMatchData.date,
      time: newMatchData.time || '12:00 UTC-3',
      group: 'Personalizado',
      round: 'Personalizado',
      guesses: {}
    }

    setMatches(prev => [newMatch, ...prev])
    setNewMatchData({
      homeTeam: '',
      awayTeam: '',
      homeFlag: '🇧🇷',
      awayFlag: '🇦🇷',
      status: 'pending',
      date: todayStr,
      time: '12:00 UTC-3'
    })
    setAddingMatch(false)
  }

  const handleDeleteMatch = (matchId) => {
    if (window.confirm('Deseja excluir esta partida permanentemente? Todos os palpites serão perdidos.')) {
      setMatches(prev => prev.filter(m => m.id !== matchId))
    }
  }

  // Participant CRUD
  const handleCreateParticipant = (e) => {
    e.preventDefault()
    const name = newParticipantName.trim()
    if (!name) return

    if (participants.some(p => p.toLowerCase() === name.toLowerCase())) {
      alert('Esta pessoa já está participando!')
      return
    }

    setParticipants(prev => [...prev, name])
    setNewParticipantName('')
    setAddingParticipant(false)
  }

  const handleDeleteParticipant = (name) => {
    if (window.confirm(`Deseja remover ${name} do bolão? Os palpites serão perdidos.`)) {
      setParticipants(prev => prev.filter(p => p !== name))
      setMatches(prev => prev.map(m => {
        const nextGuesses = { ...m.guesses }
        delete nextGuesses[name]
        return { ...m, guesses: nextGuesses }
      }))
    }
  }

  // Guess CRUD
  const handleSaveGuess = (e) => {
    e.preventDefault()
    if (!newGuessData.name) {
      alert('Selecione um participante.')
      return
    }

    setMatches(prev => prev.map(m => {
      if (m.id === addingGuess.matchId) {
        return {
          ...m,
          guesses: {
            ...m.guesses,
            [newGuessData.name]: {
              homeScore: Number(newGuessData.homeScore),
              awayScore: Number(newGuessData.awayScore)
            }
          }
        }
      }
      return m
    }))

    setNewGuessData({ name: '', homeScore: 0, awayScore: 0 })
    setAddingGuess(null)
  }

  const handleDeleteGuess = (matchId, name) => {
    if (window.confirm(`Remover palpite de ${name}?`)) {
      setMatches(prev => prev.map(m => {
        if (m.id === matchId) {
          const nextGuesses = { ...m.guesses }
          delete nextGuesses[name]
          return { ...m, guesses: nextGuesses }
        }
        return m
      }))
    }
  }

  // Filtering matches
  const filteredMatches = matches.filter(m => {
    if (matchFilter === 'today') return m.date === todayStr
    if (matchFilter === 'pending') return m.status === 'pending'
    if (matchFilter === 'finished') return m.status === 'finished'
    return true
  })

  // Filter counts
  const countToday = matches.filter(m => m.date === todayStr).length
  const countPending = matches.filter(m => m.status === 'pending').length
  const countFinished = matches.filter(m => m.status === 'finished').length
  const countAll = matches.length

  // Rendering dynamic badges
  const renderMatchBadge = (match) => {
    if (match.status === 'finished') {
      return (
        <span className="match-status-badge finished">
          <Lock size={12} /> Finalizado
        </span>
      )
    }

    if (ignoreDateLock) {
      return (
        <span className="match-status-badge pending" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <Unlock size={12} /> Liberado (Admin)
        </span>
      )
    }

    const dateStatus = getMatchDateStatus(match.date)
    const matchTime = getMatchDateTime(match.date, match.time)
    const now = new Date()
    const hasStarted = now >= matchTime

    if (hasStarted) {
      return (
        <span className="match-status-badge pending" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <Lock size={12} /> Encerrado (Começou!)
        </span>
      )
    }

    if (dateStatus === 'open_today') {
      const timeOnly = match.time ? match.time.split(' ')[0] : ''
      return (
        <span className="match-status-badge pending" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-accent)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <Unlock size={12} /> Aberto (Hoje até {timeOnly})
        </span>
      )
    } else if (dateStatus === 'future') {
      return (
        <span className="match-status-badge pending" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Lock size={12} /> Bloqueado até {formatDate(match.date)}
        </span>
      )
    } else {
      return (
        <span className="match-status-badge pending" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <Lock size={12} /> Encerrado ({formatDate(match.date)})
        </span>
      )
    }
  }

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-badge">
            <Trophy size={24} />
          </div>
          <h1 className="app-title">Bolão da Família</h1>
        </div>
        <p className="app-subtitle">Copa do Mundo de 2026 • Família Unida</p>
      </header>

      {/* Tabs */}
      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          <Trophy size={16} />
          Ranking
        </button>
        <button
          className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <Gamepad2 size={16} />
          Jogos
        </button>
      </div>

      {/* Alert about Date Lock Restriction */}
      {!ignoreDateLock && activeTab === 'matches' && (
        <div className="info-pill" style={{ margin: '0 0 16px 0', padding: '10px 14px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', width: '100%', color: 'var(--text-primary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <AlertCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
            <strong>Regra de Bloqueio:</strong> Você só pode palpitar nos jogos de <strong>hoje ({formatDate(todayStr)})</strong> antes do início de cada partida.
          </span>
        </div>
      )}

      {/* Main Tab Content */}
      <main>
        {activeTab === 'ranking' && (
          <div className="glass-card">
            <h2 className="section-title">
              <Trophy size={20} style={{ color: 'var(--color-warning)' }} />
              Classificação Geral
            </h2>

            <div className="leaderboard-list">
              {leaderboard.map((item, idx) => {
                const rank = idx + 1
                const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : ''
                const initials = item.name.substring(0, 2).toUpperCase()

                return (
                  <div key={item.name} className={`leaderboard-item ${rankClass}`}>
                    <div className="rank-left">
                      <div className="rank-number">{rank}</div>
                      <div className="user-avatar">{initials}</div>
                      <div className="user-info">
                        <span className="user-name">{item.name}</span>
                        <div className="user-stats">
                          <span className="stat-item" title="Placar Exato (3 pontos)">
                            <Star size={10} style={{ fill: 'currentColor' }} />
                            {item.exactCount} exato{item.exactCount !== 1 ? 's' : ''}
                          </span>
                          <span className="stat-item" title="Vencedor / Empate (1 ponto)">
                            <Check size={10} />
                            {item.outcomeCount} vencedor{item.outcomeCount !== 1 ? 'es' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="rank-right">
                      <span className="user-points">{item.points}</span>
                      <span className="user-points-label">ponto{item.points !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )
              })}

              {leaderboard.length === 0 && (
                <div className="empty-state">
                  <User size={32} />
                  <p>Nenhum participante cadastrado.</p>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setAddingParticipant(true)}
                style={{ flex: 1 }}
              >
                <UserPlus size={14} />
                Adicionar Pessoa
              </button>
              
              <button
                className="btn btn-sm"
                onClick={() => setActiveTab('admin')}
                style={{ flex: 1 }}
              >
                Ajustes do App
              </button>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div>
            {/* Horizontal Filter Chips */}
            <div className="filter-tabs">
              <button 
                className={`filter-chip ${matchFilter === 'today' ? 'active' : ''}`}
                onClick={() => setMatchFilter('today')}
              >
                Hoje ({countToday})
              </button>
              <button 
                className={`filter-chip ${matchFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setMatchFilter('pending')}
              >
                Em aberto ({countPending})
              </button>
              <button 
                className={`filter-chip ${matchFilter === 'finished' ? 'active' : ''}`}
                onClick={() => setMatchFilter('finished')}
              >
                Finalizados ({countFinished})
              </button>
              <button 
                className={`filter-chip ${matchFilter === 'all' ? 'active' : ''}`}
                onClick={() => setMatchFilter('all')}
              >
                Todos ({countAll})
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gamepad2 size={18} style={{ color: 'var(--color-primary)' }} />
                Lista de Partidas
              </h2>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => setAddingMatch(true)}
                style={{ width: 'auto' }}
              >
                <Plus size={14} />
                Novo Jogo
              </button>
            </div>

            {filteredMatches.map(match => {
              const isFinished = match.status === 'finished'
              const guessCount = Object.keys(match.guesses).length
              const dateStatus = getMatchDateStatus(match.date)
              const matchTime = getMatchDateTime(match.date, match.time)
              const now = new Date()
              const hasStarted = now >= matchTime
              const isGuessLocked = !isFinished && !ignoreDateLock && (dateStatus !== 'open_today' || hasStarted)

              return (
                <div key={match.id} className="glass-card match-card">
                  <div className="match-header">
                    {renderMatchBadge(match)}
                    
                    <div className="match-actions">
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '4px' }}>
                        {match.group} {match.group && '•'} {formatDate(match.date)} {match.time && `• ${match.time.split(' ')[0]}`}
                      </span>
                      <button
                        className="match-action-btn"
                        onClick={() => setEditingMatch({ ...match })}
                        title="Editar resultado do jogo"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="match-action-btn"
                        onClick={() => handleDeleteMatch(match.id)}
                        title="Deletar partida"
                        style={{ color: 'rgba(239, 68, 68, 0.7)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="match-board">
                    <div className="team-display">
                      <span className="team-flag">{match.homeFlag}</span>
                      <span className="team-name" title={match.homeTeam}>{match.homeTeam}</span>
                    </div>

                    <div className="score-display">
                      <span className={`score-num ${match.homeScore === null ? 'pending' : ''}`}>
                        {match.homeScore !== null ? match.homeScore : '-'}
                      </span>
                      <span className="score-divider">x</span>
                      <span className={`score-num ${match.awayScore === null ? 'pending' : ''}`}>
                        {match.awayScore !== null ? match.awayScore : '-'}
                      </span>
                    </div>

                    <div className="team-display">
                      <span className="team-flag">{match.awayFlag}</span>
                      <span className="team-name" title={match.awayTeam}>{match.awayTeam}</span>
                    </div>
                  </div>

                  <div className="guesses-collapsible">
                    <div className="guesses-header" onClick={() => toggleExpand(match.id)}>
                      <span>Palpites enviados ({guessCount})</span>
                      {expandedMatches[match.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {expandedMatches[match.id] && (
                      <div className="guesses-list">
                        {Object.entries(match.guesses).map(([name, guess]) => {
                          const { points, type } = getGuessPoints(guess, match)
                          return (
                            <div key={name} className="guess-row">
                              <div className="guess-user">
                                <User size={12} className="text-muted" />
                                <span className="guess-user-name">{name}</span>
                              </div>
                              <div className="guess-right-side">
                                <span className="guess-score">{guess.homeScore} x {guess.awayScore}</span>
                                {isFinished && (
                                  <span className={`guess-badge ${type}`}>
                                    {type === 'exact' ? '🎯 +3' : type === 'outcome' ? '✓ +1' : '0 pts'}
                                  </span>
                                )}
                                <button
                                  className="match-action-btn"
                                  onClick={() => handleDeleteGuess(match.id, name)}
                                  title="Remover palpite"
                                  style={{ padding: '2px', color: 'var(--text-muted)' }}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          )
                        })}

                        {guessCount === 0 && (
                          <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Nenhum palpite enviado ainda.
                          </div>
                        )}

                        {/* Button or Locked Message */}
                        {isFinished ? null : isGuessLocked ? (
                          <div style={{ textAlign: 'center', padding: '10px 4px', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.03)' }}>
                            <Lock size={11} /> Palpites trancados. {hasStarted ? 'A partida já iniciou!' : `Disponível apenas em ${formatDate(match.date)}.`}
                          </div>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setNewGuessData({ name: participants[0] || '', homeScore: 0, awayScore: 0 })
                              setAddingGuess({ matchId: match.id })
                            }}
                            style={{ marginTop: '6px' }}
                          >
                            <Plus size={12} />
                            Enviar Palpite
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {filteredMatches.length === 0 && (
              <div className="glass-card empty-state">
                <Gamepad2 size={40} />
                <p>Nenhuma partida encontrada nesta categoria.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="glass-card">
            <h2 className="section-title">
              <RefreshCw size={20} style={{ color: 'var(--color-secondary)' }} />
              Ajustes do Sistema
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Regras de Pontuação</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <span>🎯 Placar Exato</span>
                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>3 pontos</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <span>✓ Acertar apenas Vencedor/Empate</span>
                    <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>1 ponto</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <span>✗ Erro completo</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>0 pontos</span>
                  </div>
                </div>
              </div>

              {/* API Score Synchronization */}
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Sincronização de Resultados</h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => syncOfficialScores(false)}
                  disabled={syncStatus === 'syncing'}
                  style={{ gap: '10px' }}
                >
                  <RefreshCw size={16} className={syncStatus === 'syncing' ? 'spin' : ''} />
                  {syncStatus === 'syncing' ? 'Sincronizando placares...' : 'Sincronizar Placares Oficiais'}
                </button>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                  Baixa os placares oficiais mais recentes diretamente do repositório da Copa de 2026 e encerra as partidas de forma automática.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Configurações de Segurança</h3>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '80%' }}>
                    <label style={{ margin: 0, fontSize: '0.85rem' }}>Ignorar Trava de Data</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: '0' }}>
                      Permite enviar palpites para qualquer jogo (mesmo no passado ou no futuro) de forma manual.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ignoreDateLock}
                    onChange={e => setIgnoreDateLock(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Participantes Cadastrados</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {participants.map(name => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '0.8rem' }}>
                      <span>{name}</span>
                      <button 
                        onClick={() => handleDeleteParticipant(name)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                <button className="btn btn-danger" onClick={handleResetData}>
                  <RefreshCw size={16} />
                  Resetar Todos os Dados
                </button>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                  Aviso: Isso apagará todas as suas edições, novos jogos criados e novos palpites, voltando para os dados padrão da Copa 2026.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <button
            className={`bottom-nav-btn ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            <Trophy />
            Ranking
          </button>
          <button
            className={`bottom-nav-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <Gamepad2 />
            Jogos
          </button>
          <button
            className={`bottom-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <RefreshCw />
            Ajustes
          </button>
        </div>
      </nav>

      {/* MODAL: EDIT MATCH SCORE */}
      {editingMatch && (
        <div className="modal-overlay" onClick={() => setEditingMatch(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Editar Resultado</h3>
              <button className="modal-close" onClick={() => setEditingMatch(null)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMatchScore}>
              <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: '600' }}>
                {editingMatch.homeTeam} x {editingMatch.awayTeam}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px' }}>
                {/* Home Team Score Selector */}
                <div className="form-group" style={{ alignItems: 'center' }}>
                  <label>{editingMatch.homeTeam}</label>
                  <div className="input-score-picker">
                    <button 
                      type="button" 
                      className="score-control-btn"
                      onClick={() => setEditingMatch(prev => ({
                        ...prev,
                        homeScore: Math.max(0, (prev.homeScore === null ? 0 : prev.homeScore) - 1)
                      }))}
                    >
                      -
                    </button>
                    <span className="score-val">{editingMatch.homeScore !== null ? editingMatch.homeScore : 0}</span>
                    <button 
                      type="button" 
                      className="score-control-btn"
                      onClick={() => setEditingMatch(prev => ({
                        ...prev,
                        homeScore: (prev.homeScore === null ? 0 : prev.homeScore) + 1
                      }))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>x</span>

                {/* Away Team Score Selector */}
                <div className="form-group" style={{ alignItems: 'center' }}>
                  <label>{editingMatch.awayTeam}</label>
                  <div className="input-score-picker">
                    <button 
                      type="button" 
                      className="score-control-btn"
                      onClick={() => setEditingMatch(prev => ({
                        ...prev,
                        awayScore: Math.max(0, (prev.awayScore === null ? 0 : prev.awayScore) - 1)
                      }))}
                    >
                      -
                    </button>
                    <span className="score-val">{editingMatch.awayScore !== null ? editingMatch.awayScore : 0}</span>
                    <button 
                      type="button" 
                      className="score-control-btn"
                      onClick={() => setEditingMatch(prev => ({
                        ...prev,
                        awayScore: (prev.awayScore === null ? 0 : prev.awayScore) + 1
                      }))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Status do Jogo</label>
                <select
                  className="input-glass select-glass"
                  value={editingMatch.status}
                  onChange={e => setEditingMatch(prev => ({
                    ...prev,
                    status: e.target.value,
                    homeScore: e.target.value === 'pending' ? null : (prev.homeScore !== null ? prev.homeScore : 0),
                    awayScore: e.target.value === 'pending' ? null : (prev.awayScore !== null ? prev.awayScore : 0)
                  }))}
                >
                  <option value="pending">⚽ Em Aberto (Sem resultado oficial)</option>
                  <option value="finished">🏁 Finalizado (Exibir placar e somar pontos)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setEditingMatch(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Placar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MATCH */}
      {addingMatch && (
        <div className="modal-overlay" onClick={() => setAddingMatch(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Novo Jogo</h3>
              <button className="modal-close" onClick={() => setAddingMatch(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMatch}>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Mandante</label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Ex: Brasil"
                    value={newMatchData.homeTeam}
                    onChange={e => setNewMatchData(prev => ({ ...prev, homeTeam: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bandeira Mandante</label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Ex: 🇧🇷"
                    value={newMatchData.homeFlag}
                    onChange={e => setNewMatchData(prev => ({ ...prev, homeFlag: e.target.value }))}
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Visitante</label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Ex: Argentina"
                    value={newMatchData.awayTeam}
                    onChange={e => setNewMatchData(prev => ({ ...prev, awayTeam: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bandeira Visitante</label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Ex: 🇦🇷"
                    value={newMatchData.awayFlag}
                    onChange={e => setNewMatchData(prev => ({ ...prev, awayFlag: e.target.value }))}
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Data da Partida</label>
                  <input
                    type="date"
                    className="input-glass"
                    value={newMatchData.date}
                    onChange={e => setNewMatchData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora de Início</label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Ex: 13:00 UTC-6"
                    value={newMatchData.time}
                    onChange={e => setNewMatchData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status Inicial</label>
                <select
                  className="input-glass select-glass"
                  value={newMatchData.status}
                  onChange={e => setNewMatchData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">⚽ Em Aberto (Disponível para palpitar)</option>
                  <option value="finished">🏁 Finalizado (Iniciar com placar 0x0)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setAddingMatch(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar Jogo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PARTICIPANT */}
      {addingParticipant && (
        <div className="modal-overlay" onClick={() => setAddingParticipant(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Novo Participante</h3>
              <button className="modal-close" onClick={() => setAddingParticipant(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateParticipant}>
              <div className="form-group">
                <label>Nome do Familiar</label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="Ex: Tio João"
                  value={newParticipantName}
                  onChange={e => setNewParticipantName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setAddingParticipant(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT GUESS */}
      {addingGuess && (
        <div className="modal-overlay" onClick={() => setAddingGuess(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Registrar Palpite</h3>
              <button className="modal-close" onClick={() => setAddingGuess(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGuess}>
              <div className="form-group">
                <label>Familiar que vai palpitar</label>
                <select
                  className="input-glass select-glass"
                  value={newGuessData.name}
                  onChange={e => setNewGuessData(prev => ({ ...prev, name: e.target.value }))}
                  required
                >
                  <option value="" disabled>Escolha o nome...</option>
                  {participants.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifycontent: 'space-around', alignItems: 'center', marginBottom: '20px', marginTop: '10px' }}>
                {/* Home Guess */}
                <div className="form-group" style={{ alignItems: 'center' }}>
                  <label>Gols Mandante</label>
                  <div className="input-score-picker">
                    <button 
                      type="button" 
                      className="score-control-btn"
                      onClick={() => setNewGuessData(prev => ({
                        ...prev,
                        homeScore: Math.max(0, prev.homeScore - 1)
                      }))}
                    >
                      -
                    </button>
                    <span className="score-val">{newGuessData.homeScore}</span>
                    <button 
                      type="button" 
                      className="score-control-btn"
                      onClick={() => setNewGuessData(prev => ({
                        ...prev,
                        homeScore: prev.homeScore + 1
                      }))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>x</span>

                {/* Away Guess */}
                <div className="form-group" style={{ alignItems: 'center' }}>
                  <label>Gols Visitante</label>
                  <div className="input-score-picker">
                    <button 
                      type="button" 
                      className="score-control-btn"
                      onClick={() => setNewGuessData(prev => ({
                        ...prev,
                        awayScore: Math.max(0, prev.awayScore - 1)
                      }))}
                    >
                      -
                    </button>
                    <span className="score-val">{newGuessData.awayScore}</span>
                    <button 
                      type="button" 
                      className="score-control-btn"
                      onClick={() => setNewGuessData(prev => ({
                        ...prev,
                        awayScore: prev.awayScore + 1
                      }))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setAddingGuess(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Confirmar Palpite</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <p className="footer-text">Desenvolvido com carinho para a Família ♥</p>
    </>
  )
}

export default App

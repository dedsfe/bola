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
  AlertCircle
} from 'lucide-react'
import './App.css'

// Initial data based on user request
const INITIAL_PARTICIPANTS = ['Keila', 'André', 'Luque', 'LJ', 'Sara', 'Matheus', 'Gi', 'Dany']

const DEFAULT_MATCHES = [
  {
    id: '1',
    homeTeam: 'EUA',
    awayTeam: 'Paraguai',
    homeFlag: '🇺🇸',
    awayFlag: '🇵🇾',
    homeScore: 4,
    awayScore: 1,
    status: 'finished',
    guesses: {
      'Keila': { homeScore: 2, awayScore: 1 },
      'André': { homeScore: 1, awayScore: 2 },
      'Luque': { homeScore: 1, awayScore: 2 },
      'LJ': { homeScore: 1, awayScore: 1 },
      'Sara': { homeScore: 3, awayScore: 2 }
    }
  },
  {
    id: '2',
    homeTeam: 'Catar',
    awayTeam: 'Suiça',
    homeFlag: '🇶🇦',
    awayFlag: '🇨🇭',
    homeScore: null,
    awayScore: null,
    status: 'pending',
    guesses: {
      'André': { homeScore: 0, awayScore: 2 },
      'Matheus': { homeScore: 0, awayScore: 2 },
      'Gi': { homeScore: 0, awayScore: 1 }
    }
  }
]

function App() {
  // Load data from LocalStorage or use defaults
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem('bolao_participants')
    return saved ? JSON.parse(saved) : INITIAL_PARTICIPANTS
  })

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('bolao_matches')
    return saved ? JSON.parse(saved) : DEFAULT_MATCHES
  })

  const [activeTab, setActiveTab] = useState('ranking') // 'ranking' | 'matches' | 'admin'
  const [expandedMatches, setExpandedMatches] = useState({ '1': true, '2': true })

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
    status: 'pending'
  })
  const [newParticipantName, setNewParticipantName] = useState('')
  const [newGuessData, setNewGuessData] = useState({
    name: '',
    homeScore: 0,
    awayScore: 0
  })

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('bolao_participants', JSON.stringify(participants))
  }, [participants])

  useEffect(() => {
    localStorage.setItem('bolao_matches', JSON.stringify(matches))
  }, [matches])

  // Helper to toggle match guess details
  const toggleExpand = (matchId) => {
    setExpandedMatches(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }))
  }

  // Points calculation logic
  const getGuessPoints = (guess, match) => {
    if (match.status !== 'finished' || match.homeScore === null || match.awayScore === null) {
      return { points: 0, type: 'none' }
    }

    const matchHome = Number(match.homeScore)
    const matchAway = Number(match.awayScore)
    const guessHome = Number(guess.homeScore)
    const guessAway = Number(guess.awayScore)

    // Exact match: 3 points
    if (guessHome === matchHome && guessAway === matchAway) {
      return { points: 3, type: 'exact' }
    }

    // Outcome calculation
    const matchOutcome = matchHome > matchAway ? 'home' : (matchHome < matchAway ? 'away' : 'draw')
    const guessOutcome = guessHome > guessAway ? 'home' : (guessHome < guessAway ? 'away' : 'draw')

    // Correct winner/draw: 1 point
    if (matchOutcome === guessOutcome) {
      return { points: 1, type: 'outcome' }
    }

    return { points: 0, type: 'miss' }
  }

  // Calculate scores per participant
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
    if (window.confirm('Tem certeza que deseja resetar os dados para o padrão inicial?')) {
      setParticipants(INITIAL_PARTICIPANTS)
      setMatches(DEFAULT_MATCHES)
      localStorage.removeItem('bolao_participants')
      localStorage.removeItem('bolao_matches')
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
      alert('Por favor, preencha os nomes das seleções.')
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
      guesses: {}
    }

    setMatches(prev => [...prev, newMatch])
    setNewMatchData({
      homeTeam: '',
      awayTeam: '',
      homeFlag: '🇧🇷',
      awayFlag: '🇦🇷',
      status: 'pending'
    })
    setAddingMatch(false)
  }

  const handleDeleteMatch = (matchId) => {
    if (window.confirm('Deseja excluir esta partida permanentemente? Todos os palpites dela serão apagados.')) {
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
      // Remove their guesses from all matches
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
        <p className="app-subtitle">Campeonato familiar de palpites • 2026</p>
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

      {/* Main Tab Content */}
      <main>
        {activeTab === 'ranking' && (
          <div className="glass-card">
            <h2 className="section-title">
              <Trophy size={20} style={{ color: 'var(--color-warning)' }} />
              Classificação
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
                Configurações
              </button>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gamepad2 size={20} style={{ color: 'var(--color-primary)' }} />
                Partidas & Palpites
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

            {matches.map(match => {
              const isFinished = match.status === 'finished'
              const guessCount = Object.keys(match.guesses).length

              return (
                <div key={match.id} className="glass-card match-card">
                  <div className="match-header">
                    <span className={`match-status-badge ${match.status}`}>
                      {isFinished ? (
                        <>
                          <Lock size={12} />
                          Finalizado
                        </>
                      ) : (
                        <>
                          <Unlock size={12} />
                          Aberto para Palpites
                        </>
                      )}
                    </span>
                    
                    <div className="match-actions">
                      <button
                        className="match-action-btn"
                        onClick={() => setEditingMatch({ ...match })}
                        title="Editar resultado do jogo"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="match-action-btn"
                        onClick={() => handleDeleteMatch(match.id)}
                        title="Deletar partida"
                        style={{ color: 'rgba(239, 68, 68, 0.7)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="match-board">
                    <div className="team-display">
                      <span className="team-flag">{match.homeFlag}</span>
                      <span className="team-name">{match.homeTeam}</span>
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
                      <span className="team-name">{match.awayTeam}</span>
                    </div>
                  </div>

                  <div className="guesses-collapsible">
                    <div className="guesses-header" onClick={() => toggleExpand(match.id)}>
                      <span>Palpites da Família ({guessCount})</span>
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
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {matches.length === 0 && (
              <div className="glass-card empty-state">
                <Gamepad2 size={40} />
                <p>Nenhuma partida cadastrada.</p>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => setAddingMatch(true)}
                  style={{ width: 'auto', margin: '12px auto 0 auto' }}
                >
                  Criar Jogo
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="glass-card">
            <h2 className="section-title">
              <RefreshCw size={20} style={{ color: 'var(--color-secondary)' }} />
              Configurações
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
                  Aviso: Isso apagará todas as edições e palpites customizados, voltando para os dados iniciais do bolão.
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
                    // If moving back to pending, nullify score
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

              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px', marginTop: '10px' }}>
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

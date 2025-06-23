import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Search,
  Heart,
  Download,
  Shuffle,
  Repeat,
  Music,
  Home,
  Library,
  Settings,
  VolumeX,
  Video,
  Maximize,
  Minimize,
  Filter,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock
} from 'lucide-react'
import musicLogo from './assets/music_app_logo.png'
import './App.css'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([70])
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState('none') // 'none', 'one', 'all'
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("home")
  const [showVideo, setShowVideo] = useState(false)
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('all') // 'all', 'songs', 'artists', 'albums'
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [downloadedSongs, setDownloadedSongs] = useState(new Set())
  const [downloadProgress, setDownloadProgress] = useState({})
  const [playlist, setPlaylist] = useState([
    { 
      id: 1, 
      title: "أغنية تجريبية 1", 
      artist: "فنان 1", 
      album: "ألبوم 1",
      duration: "3:45",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      hasVideo: true,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      size: "4.2 MB"
    },
    { 
      id: 2, 
      title: "أغنية تجريبية 2", 
      artist: "فنان 2", 
      album: "ألبوم 2",
      duration: "4:12",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      hasVideo: false,
      size: "5.1 MB"
    },
    { 
      id: 3, 
      title: "أغنية تجريبية 3", 
      artist: "فنان 3", 
      album: "ألبوم 1",
      duration: "3:28",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      hasVideo: true,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      size: "3.8 MB"
    },
  ])

  const audioRef = useRef(null)
  const videoRef = useRef(null)
  const progressRef = useRef(null)

  const currentSong = playlist[currentSongIndex]

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
    }

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0
        audio.play()
      } else if (repeatMode === 'all' || currentSongIndex < playlist.length - 1) {
        nextSong()
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentSongIndex, repeatMode, playlist.length])

  useEffect(() => {
    const audio = audioRef.current
    const video = videoRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume[0] / 100
    if (video) {
      video.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  // Sync video with audio
  useEffect(() => {
    const audio = audioRef.current
    const video = videoRef.current
    
    if (audio && video && showVideo && currentSong?.hasVideo) {
      if (isPlaying) {
        video.currentTime = audio.currentTime
        video.play().catch(console.error)
      } else {
        video.pause()
      }
    }
  }, [isPlaying, showVideo, currentSong])

  const togglePlayPause = () => {
    const audio = audioRef.current
    const video = videoRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      if (video && showVideo) video.pause()
    } else {
      audio.play().catch(console.error)
      if (video && showVideo && currentSong?.hasVideo) {
        video.currentTime = audio.currentTime
        video.play().catch(console.error)
      }
    }
    setIsPlaying(!isPlaying)
  }

  const nextSong = () => {
    let nextIndex
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length)
    } else {
      nextIndex = (currentSongIndex + 1) % playlist.length
    }
    setCurrentSongIndex(nextIndex)
    setIsPlaying(true)
  }

  const prevSong = () => {
    let prevIndex
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * playlist.length)
    } else {
      prevIndex = currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1
    }
    setCurrentSongIndex(prevIndex)
    setIsPlaying(true)
  }

  const handleProgressChange = (value) => {
    const audio = audioRef.current
    const video = videoRef.current
    if (!audio) return

    const newTime = value[0]
    audio.currentTime = newTime
    if (video && showVideo) video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled)
  }

  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one']
    const currentIndex = modes.indexOf(repeatMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setRepeatMode(modes[nextIndex])
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    if (currentSong?.hasVideo) {
      setShowVideo(!showVideo)
    }
  }

  const toggleVideoFullscreen = () => {
    setIsVideoFullscreen(!isVideoFullscreen)
  }

  const playSong = (index) => {
    setCurrentSongIndex(index)
    setIsPlaying(true)
  }

  // Download functionality
  const downloadSong = async (song) => {
    if (downloadedSongs.has(song.id)) return

    setDownloadProgress(prev => ({ ...prev, [song.id]: 0 }))

    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setDownloadProgress(prev => ({ ...prev, [song.id]: i }))
      }

      // Mark as downloaded
      setDownloadedSongs(prev => new Set([...prev, song.id]))
      setDownloadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[song.id]
        return newProgress
      })

      // In a real app, you would store the file in IndexedDB or Cache API
      console.log(`Downloaded: ${song.title}`)
    } catch (error) {
      console.error('Download failed:', error)
      setDownloadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[song.id]
        return newProgress
      })
    }
  }

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const filteredPlaylist = playlist.filter(song => {
    const query = searchQuery.toLowerCase()
    if (searchFilter === 'all') {
      return song.title.toLowerCase().includes(query) ||
             song.artist.toLowerCase().includes(query) ||
             song.album.toLowerCase().includes(query)
    } else if (searchFilter === 'songs') {
      return song.title.toLowerCase().includes(query)
    } else if (searchFilter === 'artists') {
      return song.artist.toLowerCase().includes(query)
    } else if (searchFilter === 'albums') {
      return song.album.toLowerCase().includes(query)
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong?.url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Video Overlay */}
      {showVideo && currentSong?.hasVideo && (
        <div className={`fixed inset-0 z-50 bg-black/90 flex items-center justify-center ${
          isVideoFullscreen ? '' : 'p-8'
        }`}>
          <div className={`relative ${isVideoFullscreen ? 'w-full h-full' : 'max-w-4xl max-h-[80vh]'}`}>
            <video
              ref={videoRef}
              src={currentSong.videoUrl}
              className="w-full h-full object-contain"
              controls={false}
              muted={isMuted}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVideoFullscreen}
                className="bg-black/50 hover:bg-black/70"
              >
                {isVideoFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVideo}
                className="bg-black/50 hover:bg-black/70"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src={musicLogo} alt="Music App" className="w-10 h-10 rounded-lg" />
          <h1 className="text-xl font-bold">Music Player</h1>
          <div className="flex items-center gap-1 text-sm">
            {isOnline ? (
              <><Wifi className="w-4 h-4 text-green-500" /><span className="text-green-500">متصل</span></>
            ) : (
              <><WifiOff className="w-4 h-4 text-red-500" /><span className="text-red-500">غير متصل</span></>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="البحث عن الموسيقى..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 bg-white/10 border-white/20 text-white placeholder-gray-400 w-80"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-transparent text-xs text-gray-400 border-none outline-none"
              >
                <option value="all" className="bg-gray-800">الكل</option>
                <option value="songs" className="bg-gray-800">الأغاني</option>
                <option value="artists" className="bg-gray-800">الفنانين</option>
                <option value="albums" className="bg-gray-800">الألبومات</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-160px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-black/30 backdrop-blur-md p-4">
          <nav className="space-y-2">
            <Button
              variant={activeTab === "home" ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab("home")}
            >
              <Home className="w-5 h-5" />
              الرئيسية
            </Button>
            <Button
              variant={activeTab === "library" ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab("library")}
            >
              <Library className="w-5 h-5" />
              مكتبتي
            </Button>
            <Button
              variant={activeTab === "offline" ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab("offline")}
            >
              <Download className="w-5 h-5" />
              التحميلات
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-5 h-5" />
              الإعدادات
            </Button>
          </nav>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">قائمة التشغيل</h3>
            <div className="space-y-2">
              {filteredPlaylist.map((song, index) => (
                <Card 
                  key={song.id} 
                  className={`bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors ${
                    currentSongIndex === playlist.indexOf(song) ? 'ring-2 ring-pink-500' : ''
                  }`}
                  onClick={() => playSong(playlist.indexOf(song))}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center relative">
                        {currentSongIndex === playlist.indexOf(song) && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Music className="w-5 h-5" />
                        )}
                        {song.hasVideo && (
                          <Video className="w-3 h-3 absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
                        )}
                        {downloadedSongs.has(song.id) && (
                          <CheckCircle className="w-3 h-3 absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{song.title}</p>
                        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                      </div>
                      <span className="text-xs text-gray-400">{song.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "home" && (
            <div className="space-y-6">
              {/* Now Playing */}
              <Card className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center relative">
                      <img src={musicLogo} alt={currentSong?.title} className="w-full h-full object-cover rounded-xl" />
                      {currentSong?.hasVideo && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleVideo}
                          className="absolute inset-0 bg-black/50 hover:bg-black/70 rounded-xl"
                        >
                          <Video className="w-8 h-8" />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-1">{currentSong?.title}</h2>
                      <p className="text-gray-400 mb-1">{currentSong?.artist}</p>
                      <p className="text-sm text-gray-500 mb-4">{currentSong?.album}</p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <Slider
                          ref={progressRef}
                          value={[currentTime]}
                          max={duration || 100}
                          step={1}
                          className="w-full"
                          onValueChange={handleProgressChange}
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Heart className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => downloadSong(currentSong)}
                        disabled={downloadedSongs.has(currentSong?.id) || downloadProgress[currentSong?.id] !== undefined}
                      >
                        {downloadedSongs.has(currentSong?.id) ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : downloadProgress[currentSong?.id] !== undefined ? (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </Button>
                      {currentSong?.hasVideo && (
                        <Button variant="ghost" size="icon" onClick={toggleVideo}>
                          <Video className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search Results */}
              {searchQuery && (
                <div>
                  <h2 className="text-xl font-bold mb-4">نتائج البحث عن "{searchQuery}"</h2>
                  <div className="grid gap-4">
                    {filteredPlaylist.map((song, index) => (
                      <Card 
                        key={song.id} 
                        className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => playSong(playlist.indexOf(song))}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center relative">
                              <Music className="w-6 h-6" />
                              {song.hasVideo && (
                                <Video className="w-3 h-3 absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
                              )}
                              {downloadedSongs.has(song.id) && (
                                <CheckCircle className="w-3 h-3 absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{song.title}</h3>
                              <p className="text-sm text-gray-400">{song.artist} • {song.album}</p>
                            </div>
                            <span className="text-sm text-gray-400">{song.duration}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadSong(song)
                              }}
                              disabled={downloadedSongs.has(song.id) || downloadProgress[song.id] !== undefined}
                            >
                              {downloadedSongs.has(song.id) ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : downloadProgress[song.id] !== undefined ? (
                                <Clock className="w-4 h-4 text-yellow-500" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Playlists */}
              {!searchQuery && (
                <div>
                  <h2 className="text-xl font-bold mb-4">قوائم التشغيل المميزة</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="w-full h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                            <Music className="w-8 h-8" />
                          </div>
                          <h3 className="font-semibold mb-1">قائمة تشغيل {i}</h3>
                          <p className="text-sm text-gray-400">مجموعة من الأغاني المختارة</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">مكتبتي</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <select
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value="all" className="bg-gray-800">الكل</option>
                    <option value="songs" className="bg-gray-800">الأغاني</option>
                    <option value="artists" className="bg-gray-800">الفنانين</option>
                    <option value="albums" className="bg-gray-800">الألبومات</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4">
                {filteredPlaylist.map((song, index) => (
                  <Card 
                    key={song.id} 
                    className={`bg-white/10 border-white/20 hover:bg-white/20 transition-colors cursor-pointer ${
                      currentSongIndex === playlist.indexOf(song) ? 'ring-2 ring-pink-500' : ''
                    }`}
                    onClick={() => playSong(playlist.indexOf(song))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center relative">
                          <Music className="w-6 h-6" />
                          {song.hasVideo && (
                            <Video className="w-3 h-3 absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
                          )}
                          {downloadedSongs.has(song.id) && (
                            <CheckCircle className="w-3 h-3 absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{song.title}</h3>
                          <p className="text-sm text-gray-400">{song.artist} • {song.album}</p>
                        </div>
                        <span className="text-sm text-gray-400">{song.duration}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadSong(song)
                          }}
                          disabled={downloadedSongs.has(song.id) || downloadProgress[song.id] !== undefined}
                        >
                          {downloadedSongs.has(song.id) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : downloadProgress[song.id] !== undefined ? (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon">
                          {currentSongIndex === playlist.indexOf(song) && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "offline" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">التحميلات</h2>
              <div className="grid gap-4">
                {playlist.map((song) => (
                  <Card key={song.id} className="bg-white/10 border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center relative">
                          <Music className="w-6 h-6" />
                          {downloadedSongs.has(song.id) && (
                            <CheckCircle className="w-3 h-3 absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{song.title}</h3>
                          <p className="text-sm text-gray-400">{song.artist} • {song.size}</p>
                          {downloadProgress[song.id] !== undefined && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${downloadProgress[song.id]}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">جاري التحميل... {downloadProgress[song.id]}%</p>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => downloadSong(song)}
                          disabled={downloadedSongs.has(song.id) || downloadProgress[song.id] !== undefined}
                        >
                          {downloadedSongs.has(song.id) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : downloadProgress[song.id] !== undefined ? (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">الإعدادات</h2>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">جودة الصوت</h3>
                    <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white">
                      <option value="high">عالية</option>
                      <option value="medium">متوسطة</option>
                      <option value="low">منخفضة</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">جودة الفيديو</h3>
                    <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white">
                      <option value="1080p">1080p</option>
                      <option value="720p">720p</option>
                      <option value="480p">480p</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">التحميل التلقائي</h3>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>تحميل الأغاني للاستماع بدون اتصال</span>
                    </label>
                    <label className="flex items-center gap-2 mt-2">
                      <input type="checkbox" className="rounded" />
                      <span>تحميل الفيديوهات للمشاهدة بدون اتصال</span>
                    </label>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">الإشعارات</h3>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>إشعارات الأغاني الجديدة</span>
                    </label>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">حالة الاتصال</h3>
                    <div className="flex items-center gap-2">
                      {isOnline ? (
                        <><Wifi className="w-4 h-4 text-green-500" /><span className="text-green-500">متصل بالإنترنت</span></>
                      ) : (
                        <><WifiOff className="w-4 h-4 text-red-500" /><span className="text-red-500">غير متصل - الوضع بدون اتصال</span></>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/20 p-4">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Song Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center relative">
              <img src={musicLogo} alt={currentSong?.title} className="w-full h-full object-cover rounded-lg" />
              {currentSong?.hasVideo && (
                <Video className="w-3 h-3 absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
              )}
              {downloadedSongs.has(currentSong?.id) && (
                <CheckCircle className="w-3 h-3 absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{currentSong?.title}</p>
              <p className="text-xs text-gray-400">{currentSong?.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-1 justify-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleShuffle}
              className={isShuffled ? 'text-pink-500' : ''}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={prevSong}>
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button 
              size="icon" 
              className="w-12 h-12 bg-white text-black hover:bg-gray-200"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={nextSong}>
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleRepeat}
              className={repeatMode !== 'none' ? 'text-pink-500' : ''}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 text-xs bg-pink-500 rounded-full w-4 h-4 flex items-center justify-center">1</span>
              )}
            </Button>
          </div>

          {/* Volume and Video */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {currentSong?.hasVideo && (
              <Button variant="ghost" size="icon" onClick={toggleVideo}>
                <Video className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted || volume[0] === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App


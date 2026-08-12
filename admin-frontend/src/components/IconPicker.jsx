import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Layers, LayoutGrid, Star, Info, Briefcase,
  Menu, Settings, Sliders, Search, Share2, Home, User, Mail, Phone,
  MapPin, Calendar, Clock, Camera, Image, Video, Music, Headphones,
  Globe, Link, ExternalLink, Download, Upload, Trash2, Edit, Plus,
  Check, X, ChevronDown, ChevronRight, ChevronLeft, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, RefreshCw, RotateCcw, Copy, Clipboard, Save,
  Printer, Eye, EyeOff, Lock, Unlock, Shield, Key, Zap, Activity,
  TrendingUp, BarChart2, PieChart, Filter, SortAsc, SortDesc, Grid,
  List, Bookmark, Tag, Flag, Heart, ThumbsUp, MessageCircle, Send,
  Bell, BellOff, Volume2, VolumeX, Wifi, WifiOff, Battery, Power,
  Monitor, Smartphone, Tablet, Laptop, MonitorSpeaker, Server, Database,
  Cloud, CloudOff, Sun, Moon, Thermometer, Droplets, Wind, Flame,
  Sparkles, Hexagon, Pentagon, Triangle, Circle, Square, Octagon,
  Compass, Crosshair, Target, Navigation, Map, Route, Truck,
  ShoppingBag, CreditCard, DollarSign, Percent, Gift, Package,
  Award, Trophy, Medal, Crown, Gem, Rocket, Plane, Car, Ship,
  Bike, Coffee, Utensils, Wine, Pizza, Cake, Apple, Cherry,
  Bug, Code, Terminal, FileCode, Folder, FolderOpen, Archive,
  Inbox, Reply, Forward, Hash, AtSign,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Type, Heading, Image as ImageIcon, Film, Palette, Paintbrush,
  Scissors, Crop, Move, Maximize, Minimize, ZoomIn, ZoomOut,
  Layout, PanelLeft, PanelRight, PanelTop, PanelBottom,
} from 'lucide-react'

const ICONS = {
  LayoutDashboard, FileText, Layers, LayoutGrid, Star, Info, Briefcase,
  Menu, Settings, Sliders, Search, Share2, Home, User, Mail, Phone,
  MapPin, Calendar, Clock, Camera, Image, Video, Music, Headphones,
  Globe, Link, ExternalLink, Download, Upload, Trash2, Edit, Plus,
  Check, X, ChevronDown, ChevronRight, ChevronLeft, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, RefreshCw, RotateCcw, Copy, Clipboard, Save,
  Printer, Eye, EyeOff, Lock, Unlock, Shield, Key, Zap, Activity,
  TrendingUp, BarChart2, PieChart, Filter, SortAsc, SortDesc, Grid,
  List, Bookmark, Tag, Flag, Heart, ThumbsUp, MessageCircle, Send,
  Bell, BellOff, Volume2, VolumeX, Wifi, WifiOff, Battery, Power,
  Monitor, Smartphone, Tablet, Laptop, MonitorSpeaker, Server, Database,
  Cloud, CloudOff, Sun, Moon, Thermometer, Droplets, Wind, Flame,
  Sparkles, Hexagon, Pentagon, Triangle, Circle, Square, Octagon,
  Compass, Crosshair, Target, Navigation, Map, Route, Truck,
  ShoppingBag, CreditCard, DollarSign, Percent, Gift, Package,
  Award, Trophy, Medal, Crown, Gem, Rocket, Plane, Car, Ship,
  Bike, Coffee, Utensils, Wine, Pizza, Cake, Apple, Cherry,
  Bug, Code, Terminal, FileCode, Folder, FolderOpen, Archive,
  Inbox, Reply, Forward, Hash, AtSign,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Type, Heading, Film, Palette, Paintbrush,
  Scissors, Crop, Move, Maximize, Minimize, ZoomIn, ZoomOut,
  Layout, PanelLeft, PanelRight, PanelTop, PanelBottom,
}

const ICON_NAMES = Object.keys(ICONS)

export default function IconPicker({ value, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const filtered = ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        ref={ref}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 4,
          width: 280,
          maxHeight: 320,
          backgroundColor: 'var(--color-panel)',
          border: '1px solid var(--color-line)',
          borderRadius: 10,
          padding: 12,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            autoFocus
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 8px 8px 32px',
              backgroundColor: 'var(--color-void)',
              border: '1px solid var(--color-line)',
              borderRadius: 6,
              color: 'var(--color-text)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-signal)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-line)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, overflowY: 'auto', maxHeight: 240 }}>
          {filtered.map((name) => {
            const Icon = ICONS[name]
            const isSelected = value === name
            return (
              <button
                key={name}
                type="button"
                onClick={() => { onSelect(name); onClose() }}
                title={name}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${isSelected ? 'var(--color-signal)' : 'transparent'}`,
                  borderRadius: 6,
                  backgroundColor: isSelected ? 'rgba(62,217,196,0.1)' : 'transparent',
                  color: isSelected ? 'var(--color-signal)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.05)'
                    e.currentTarget.style.color = 'var(--color-text)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--color-text-muted)'
                  }
                }}
              >
                <Icon size={16} />
              </button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export { ICONS, ICON_NAMES }

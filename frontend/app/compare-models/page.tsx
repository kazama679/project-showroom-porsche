'use client'

import { useState } from 'react'
import { Menu, User, X, ChevronDown, ChevronUp, ToggleLeft } from 'lucide-react'

const CompareModelsPage = () => {
  const [selectedModels, setSelectedModels] = useState(['911 Carrera', null])
  const [showModal, setShowModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    name: false,
    form: false,
    specs: true,
  })
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false)

  const models = [
    { name: '911 Carrera', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-3ezEonig4DEdYPVZlDcx5nKeRJI6M8.png', price: '$137,850.00', seating: 2, power: '285 kW / 388 hp', accel: '3.7s', topSpeed: '183 mph' },
    { name: 'Panamera', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-3ezEonig4DEdYPVZlDcx5nKeRJI6M8.png', price: '$115,350.00', seating: 4, power: '256 kW / 348 hp', accel: '4.8s', topSpeed: '169 mph' },
  ]

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 md:px-16 py-6">
          <button className="text-gray-800 md:hidden">
            <Menu size={24} />
          </button>
          <h1 className="text-center flex-1 text-sm font-medium tracking-[0.15em]">PORSCHE</h1>
          <button className="text-gray-800">
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light mb-6">Model Comparison</h1>
          <p className="text-lg text-gray-600 mb-8">Do you need help deciding? Now you can compare your favourites with each other.</p>
          <button className="text-gray-800 underline hover:text-gray-600 transition-colors">
            Change model
          </button>
        </div>

        {/* Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* First Model */}
          <div className="bg-white rounded-[4px] p-8">
            <img src={models[0].image} alt={models[0].name} className="w-full h-64 object-contain mb-8" />
            <h2 className="text-3xl font-light mb-2">{models[0].name}</h2>
            <p className="text-gray-600 mb-4">From {models[0].price}</p>
            <p className="text-gray-600 text-sm mb-6">Gear type</p>
            <p className="text-gray-600 text-sm">8-speed Porsche Doppelkupplung (PDK)</p>
            <div className="flex gap-4 mt-8">
              <button className="flex-1 bg-black text-white py-3 font-medium text-sm rounded-[2px] hover:bg-gray-900 transition-colors">
                Build Your Porsche
              </button>
              <button className="flex-1 border border-gray-800 text-gray-800 py-3 font-medium text-sm rounded-[2px] hover:bg-gray-50 transition-colors">
                Discover stock vehicles
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-4">PDK (Automatic) · Rear-wheel-drive</p>
          </div>

          {/* Second Model or Placeholder */}
          <div className="bg-white rounded-[4px] p-8">
            {selectedModels[1] ? (
              <>
                <img src={models[1].image} alt={models[1].name} className="w-full h-64 object-contain mb-8" />
                <h2 className="text-3xl font-light mb-2">{models[1].name}</h2>
                <p className="text-gray-600 mb-4">From {models[1].price}</p>
                <p className="text-gray-600 text-sm mb-6">Gear type</p>
                <p className="text-gray-600 text-sm">8-speed Porsche Doppelkupplung (PDK)</p>
                <div className="flex gap-4 mt-8">
                  <button className="flex-1 bg-black text-white py-3 font-medium text-sm rounded-[2px] hover:bg-gray-900 transition-colors">
                    Build Your Porsche
                  </button>
                  <button className="flex-1 border border-gray-800 text-gray-800 py-3 font-medium text-sm rounded-[2px] hover:bg-gray-50 transition-colors">
                    Discover stock vehicles
                  </button>
                </div>
              </>
            ) : (
              <div className="h-64 bg-gray-100 rounded-[4px] flex items-center justify-center">
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <span className="text-2xl">+</span>
                  <span className="text-sm font-medium">Select model</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Questions */}
        <div className="bg-white rounded-[4px] p-12 mb-20">
          <h2 className="text-4xl font-light mb-12 text-center">Điểm khác biệt giữa các mẫu xe là gì?</h2>

          {/* Expandable Sections */}
          <div className="space-y-6">
            {/* Name & Meaning */}
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('name')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <h3 className="text-xl font-light">Tên và ý nghĩa</h3>
                {expandedSections.name ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            {/* Form & Design */}
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('form')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <h3 className="text-xl font-light">Hình thức và thiết kế</h3>
                {expandedSections.form ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            {/* Technical Specs */}
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('specs')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <h3 className="text-xl font-light">Thông số kỹ thuật</h3>
                {expandedSections.specs ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>

              {expandedSections.specs && (
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                    className={`p-2 rounded-full transition-colors ${
                      showDifferencesOnly ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <ToggleLeft size={20} className="text-white" />
                  </button>
                  <label className="text-gray-700 font-light cursor-pointer">Chỉ hiển thị những điểm khác biệt</label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specs Comparison Table */}
        {expandedSections.specs && (
          <div className="bg-white rounded-[4px] p-12 mb-20">
            <h3 className="text-2xl font-light mb-12 text-center">Thông số so sánh</h3>

            {/* Model Tabs */}
            <div className="flex gap-8 mb-12 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-blue-600 rounded"></div>
                <span className="text-lg font-light">911 Carrera</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-gray-800 rounded"></div>
                <span className="text-lg font-light">Panamera</span>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - 911 Carrera */}
              <div className="space-y-12">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Số lượng chỗ ngồi</p>
                  <p className="text-5xl font-light">2</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Động cơ độc trong công suất tối đa</p>
                  <p className="text-2xl font-light">285 kW / 388 mã lực</p>
                  <p className="text-gray-600 text-sm mt-2">Tăng tốc từ 0-60 mph với gói Sport Chrono.</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Tốc độ tối đa</p>
                  <p className="text-2xl font-light">183 đấm/giờ</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Dung tích động cơ</p>
                  <p className="text-2xl font-light">331 lbf-ft</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Sự dịch chuyển</p>
                  <p className="text-2xl font-light">2,981 cm³</p>
                </div>
              </div>

              {/* Right Column - Panamera */}
              <div className="space-y-12">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Số lượng chỗ ngồi</p>
                  <p className="text-5xl font-light">4</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Động cơ độc trong công suất tối đa</p>
                  <p className="text-2xl font-light">256 kW / 348 mã lực</p>
                  <p className="text-gray-600 text-sm mt-2">Tăng tốc từ 0-60 mph với gói Sport Chrono.</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Tốc độ tối đa</p>
                  <p className="text-2xl font-light">169 đấm/giờ</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Dung tích động cơ</p>
                  <p className="text-2xl font-light">368 lbf-ft</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Sự dịch chuyển</p>
                  <p className="text-2xl font-light">2,894 cm³</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-[4px] max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-light">Choose two Porsche models</h2>
                <p className="text-gray-600 text-sm mt-2">7 available models</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>

            <div className="flex">
              {/* Left Sidebar - Filters */}
              <div className="w-1/4 bg-gray-50 p-8 border-r border-gray-200">
                <h3 className="font-light text-lg mb-6">Models</h3>
                <div className="space-y-4 mb-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="models" defaultChecked className="w-5 h-5" />
                    <span className="text-sm">All</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="models" className="w-5 h-5" />
                    <span className="text-sm">911 (20)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="models" className="w-5 h-5" />
                    <span className="text-sm">Taycan (16)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="models" defaultChecked className="w-5 h-5" />
                    <span className="text-sm">Panamera (7)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="models" className="w-5 h-5" />
                    <span className="text-sm">Macan (9)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="models" className="w-5 h-5" />
                    <span className="text-sm">Cayenne (19)</span>
                  </label>
                </div>

                <div className="border-t pt-6">
                  <button className="flex items-center gap-2 text-gray-800 hover:opacity-75 transition-opacity">
                    <span className="text-lg">+</span>
                    <span className="text-sm font-light">Body Type</span>
                  </button>
                </div>

                <div className="border-t mt-6 pt-6">
                  <button className="flex items-center gap-2 text-gray-800 hover:opacity-75 transition-opacity">
                    <span className="text-lg">+</span>
                    <span className="text-sm font-light">Engine Type</span>
                  </button>
                </div>
              </div>

              {/* Right Content - Models Grid */}
              <div className="w-3/4 p-8">
                <h3 className="text-2xl font-light mb-8">Sport Sedan models</h3>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { name: 'Panamera 4S E-Hybrid', fuel: 'Hybrid', year: '2026', price: '$141,450.00', power: '394 kW / 536 hp', accel: '3.5 sec' },
                    { name: 'Panamera GTS', fuel: 'Gasoline', year: '2026', price: '$169,250.00', power: '363 kW / 493 hp', accel: '3.6 sec' },
                    { name: 'Panamera Turbo E-Hybrid', fuel: 'Hybrid', year: '2026', price: '$210,250.00', power: '493 kW / 670 hp', accel: '3.0 sec' },
                  ].map((model) => (
                    <div key={model.name} className="bg-gray-50 rounded-[4px] p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-light text-gray-600">{model.fuel}</span>
                        <span className="text-xs font-light text-gray-600">{model.year}</span>
                      </div>
                      <div className="w-full h-40 bg-gray-200 rounded-[2px] mb-4"></div>
                      <h4 className="text-lg font-light mb-2">{model.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">From {model.price}</p>
                      <p className="text-sm font-light mb-2">{model.power}</p>
                      <p className="text-sm text-gray-600">{model.accel}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom - Selected Models & Compare Button */}
            <div className="flex items-center justify-between p-8 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-[2px]">
                  <div className="w-5 h-4 bg-blue-600 rounded"></div>
                  <span className="text-sm">911 Carrera</span>
                  <button className="ml-2 text-gray-600 hover:text-gray-800">×</button>
                </div>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">Choose a model</button>
              </div>
              <button className="bg-black text-white px-8 py-3 rounded-[2px] font-light hover:bg-gray-900 transition-colors">
                Compare Models
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Button */}
      <button className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-4 py-8 rounded-l-[4px] font-light hover:bg-purple-700 transition-colors">
        Nhận tư vấn
      </button>
    </div>
  )
}

export default CompareModelsPage

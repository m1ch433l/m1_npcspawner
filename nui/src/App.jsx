import React, { useState, useEffect } from 'react';
import { X, Plus, MapPin, Edit3, Trash2, Navigation, Settings, Save, ChevronUp, ChevronDown, Shield, Snowflake, PlayCircle, Swords } from 'lucide-react';
import { LocaleManager } from './locale.js';

function App() {
  
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('spawn');
  const [npcs, setNpcs] = useState([]);
  const [favoritePeds, setFavoritePeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [manualPedInput, setManualPedInput] = useState('');
  const [playerCoords, setPlayerCoords] = useState({ x: 0, y: 0, z: 0 });
  const [playerHeading, setPlayerHeading] = useState(0);
  const [editingNPC, setEditingNPC] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editManualPedInput, setEditManualPedInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    useCustomCoords: false,
    coords: { x: 0, y: 0, z: 0 },
    heading: 0,
    invincible: true,
    freeze: true,
    blockEvents: true,
    animDict: '',
    animName: '',
    animFlag: 1,
    scenario: '',
    weapon: '',
    animationsAllowed: false,
    useScenario: false,
    useAnimation: false
  });

  const [defaultSettings, setDefaultSettings] = useState({});
  const [locale, setLocale] = useState(new LocaleManager());



  useEffect(() => {
    const handleMessage = (event) => {
      const { action, playerCoords, playerHeading, favoritePeds, npcs, defaultSettings, locale: localeData } = event.data;
      
      if (action === 'openUI') {
        setIsVisible(true);
        setPlayerCoords(playerCoords);
        setPlayerHeading(playerHeading);
        setFavoritePeds(favoritePeds || []);
        setDefaultSettings(defaultSettings || {});
        
        if (localeData) {
          const newLocale = new LocaleManager();
          newLocale.loadLocale(localeData);
          setLocale(newLocale);
        }

        setFormData(prev => ({
          ...prev,
          coords: playerCoords,
          heading: playerHeading,
          invincible: defaultSettings?.invincible ?? true,
          freeze: defaultSettings?.freeze ?? true,
          blockEvents: defaultSettings?.blockEvents ?? true,
          animDict: defaultSettings?.animDict || '',
          animName: defaultSettings?.animName || '',
          scenario: defaultSettings?.scenario || '',
          weapon: defaultSettings?.weapon || ''
        }));
      } else if (action === 'updateNPCList') {
        setNpcs(npcs || []);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const closeUI = () => {
    setIsVisible(false);
    fetch('https://m1_npcspawner/closeUI', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
  };

  const handleSpawnNPC = () => {
    if (!formData.name || !formData.model) {
      return;
    }

    fetch('https://m1_npcspawner/spawnNPC', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).catch(error => {
      console.error('Error spawning NPC:', error);
    });

    setFormData({
      name: '',
      model: '',
      useCustomCoords: false,
      coords: playerCoords,
      heading: playerHeading,
      invincible: defaultSettings?.invincible ?? true,
      freeze: defaultSettings?.freeze ?? true,
      blockEvents: defaultSettings?.blockEvents ?? true,
      animDict: defaultSettings?.animDict || '',
      animName: defaultSettings?.animName || '',
      animFlag: 1,
      scenario: defaultSettings?.scenario || '',
      weapon: defaultSettings?.weapon || '',
      animationsAllowed: false,
      useScenario: false,
      useAnimation: false
    });
  };

  const handleDeleteNPC = (npcId) => {
    fetch('https://m1_npcspawner/deleteNPC', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npcId })
    }).catch(error => {
      console.error('Error deleting NPC:', error);
    });
  };

  const handleTeleportToNPC = (npcId) => {
    fetch('https://m1_npcspawner/teleportToNPC', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npcId })
    }).catch(error => {
      console.error('Error teleporting to NPC:', error);
    });
  };

  const handleEditNPC = (npc) => {
    setEditingNPC(npc.id);
    setEditForm({
      name: npc.name,
      model: npc.model,
      coords: npc.coords,
      heading: npc.heading,
      invincible: npc.invincible,
      freeze: npc.freeze,
      blockEvents: npc.blockEvents,
      animDict: npc.animDict || '',
      animName: npc.animName || '',
      animFlag: npc.animFlag || 1,
      scenario: npc.scenario || '',
      weapon: npc.weapon || '',
      animationsAllowed: npc.animationsAllowed || false,
      useScenario: npc.useScenario || false,
      useAnimation: npc.useAnimation || false
    });
    setEditManualPedInput(npc.model);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    fetch('https://m1_npcspawner/updateNPC', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        npcId: editingNPC, 
        updateData: editForm 
      })
    }).catch(error => {
      console.error('Error updating NPC:', error);
    });
    setEditingNPC(null);
    setEditForm({});
    setShowEditModal(false);
    setEditManualPedInput('');
  };

  const handleCancelEdit = () => {
    setEditingNPC(null);
    setEditForm({});
    setShowEditModal(false);
    setEditManualPedInput('');
  };

  const updatePlayerCoords = () => {
    fetch('https://m1_npcspawner/getPlayerCoords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
      setPlayerCoords(data.coords);
      setPlayerHeading(data.heading);
      if (!formData.useCustomCoords) {
        setFormData(prev => ({
          ...prev,
          coords: data.coords,
          heading: data.heading
        }));
      }
    });
  };

  const handleSelectPed = (pedModel) => {
    setFormData(prev => ({ ...prev, model: pedModel }));
    setManualPedInput('');
  };

  const handleManualPedInput = (value) => {
    setManualPedInput(value);
    setFormData(prev => ({ ...prev, model: value }));
  };

  const handleEditSelectPed = (pedModel) => {
    setEditForm(prev => ({ ...prev, model: pedModel }));
    setEditManualPedInput(pedModel);
  };

  const handleEditManualPedInput = (value) => {
    setEditManualPedInput(value);
    setEditForm(prev => ({ ...prev, model: value }));
  };

  const CustomNumberInput = ({ value, onChange, min, max, step, className, placeholder }) => {
    const formatValue = (val) => {
      const num = parseFloat(val) || 0;
      return num.toFixed(2);
    };

    const handleIncrement = () => {
      const newValue = Math.min((parseFloat(value) || 0) + (parseFloat(step) || 1), max || Infinity);
      onChange({ target: { value: formatValue(newValue) } });
    };

    const handleDecrement = () => {
      const newValue = Math.max((parseFloat(value) || 0) - (parseFloat(step) || 1), min || -Infinity);
      onChange({ target: { value: formatValue(newValue) } });
    };

    const handleInputChange = (e) => {
      const inputValue = e.target.value;
      if (inputValue === '' || inputValue === '-') {
        onChange({ target: { value: inputValue } });
      } else {
        const num = parseFloat(inputValue);
        if (!isNaN(num)) {
          onChange({ target: { value: formatValue(num) } });
        }
      }
    };

    const handleBlur = (e) => {
      const inputValue = e.target.value;
      if (inputValue !== '' && inputValue !== '-') {
        const num = parseFloat(inputValue) || 0;
        onChange({ target: { value: formatValue(num) } });
      }
    };

    return (
      <div className="custom-number-input">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={className}
          placeholder={placeholder}
        />
        <div className="number-arrows">
          <button
            type="button"
            className="number-arrow"
            onClick={handleIncrement}
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            className="number-arrow"
            onClick={handleDecrement}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };
  const filteredNPCs = npcs.filter(npc => 
    npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    npc.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-effect rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6" />
            {locale.get('ui.title')}
          </h1>
          <button
            onClick={closeUI}
            className="text-white hover:text-primary-200 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-zinc-700">
          <button
            onClick={() => setActiveTab('spawn')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'spawn'
                ? 'text-primary-500 border-b-2 border-primary-500 bg-zinc-800'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            {locale.get('ui.buttons.spawn_npc')}
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'manage'
                ? 'text-primary-500 border-b-2 border-primary-500 bg-zinc-800'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Edit3 className="w-4 h-4 inline mr-2" />
            {locale.get('ui.buttons.manage_npcs')} ({npcs.length})
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto custom-scrollbar">
          {activeTab === 'spawn' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">
                      {locale.get('ui.labels.npc_name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-primary-500 focus:outline-none input-glow transition-all"
                      placeholder={locale.get('ui.placeholders.enter_npc_name')}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">
                      {locale.get('ui.labels.ped_model')}
                    </label>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-zinc-400 text-xs mb-2">Manual Input</label>
                        <input
                          type="text"
                          value={manualPedInput}
                          onChange={(e) => handleManualPedInput(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-primary-500 focus:outline-none input-glow transition-all"
                          placeholder={locale.get('ui.placeholders.enter_ped_model')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-zinc-400 text-xs mb-2">Or Select from Favorites</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                          {favoritePeds.map((model) => (
                            <button
                              key={model}
                              onClick={() => handleSelectPed(model)}
                              className={`px-3 py-2 text-left text-sm rounded-lg border transition-all ${
                                formData.model === model
                                  ? 'bg-primary-600/30 border-primary-500 text-primary-400'
                                  : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:bg-primary-600/20 hover:border-primary-600/50 hover:text-white'
                              }`}
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {formData.model && (
                      <div className="mt-3 px-3 py-2 bg-primary-600/20 rounded-lg border border-primary-600/30">
                        <span className="text-primary-400 text-sm font-medium">Selected: {formData.model}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="useCustomCoords"
                      checked={formData.useCustomCoords}
                      onChange={(e) => setFormData(prev => ({ ...prev, useCustomCoords: e.target.checked }))}
                      className="custom-checkbox"
                    />
                    <label htmlFor="useCustomCoords" className="text-zinc-300 text-sm font-medium">
                      {locale.get('ui.labels.use_custom_coordinates')}
                    </label>
                    <button
                      onClick={updatePlayerCoords}
                      className="ml-auto px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded text-sm transition-colors"
                    >
                      {locale.get('ui.buttons.update_coordinates')}
                    </button>
                  </div>

                  {formData.useCustomCoords && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-zinc-400 text-xs mb-1">X</label>
                        <CustomNumberInput
                          value={formData.coords.x}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            coords: { ...prev.coords, x: parseFloat(e.target.value) || 0 }
                          }))}
                          step={0.01}
                          className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs mb-1">Y</label>
                        <CustomNumberInput
                          value={formData.coords.y}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            coords: { ...prev.coords, y: parseFloat(e.target.value) || 0 }
                          }))}
                          step={0.01}
                          className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs mb-1">Z</label>
                        <CustomNumberInput
                          value={formData.coords.z}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            coords: { ...prev.coords, z: parseFloat(e.target.value) || 0 }
                          }))}
                          step={0.01}
                          className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">
                      {locale.get('ui.labels.heading')}
                    </label>
                    <CustomNumberInput
                      value={formData.heading}
                      onChange={(e) => setFormData(prev => ({ ...prev, heading: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={360}
                      step={0.1}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-lg text-white focus:border-primary-500 focus:outline-none input-glow transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="invincible"
                    checked={formData.invincible}
                    onChange={(e) => setFormData(prev => ({ ...prev, invincible: e.target.checked }))}
                    className="custom-checkbox"
                  />
                  <label htmlFor="invincible" className="text-zinc-300 text-sm font-medium">
                    {locale.get('ui.labels.invincible')}
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="freeze"
                    checked={formData.freeze}
                    onChange={(e) => setFormData(prev => ({ ...prev, freeze: e.target.checked }))}
                    className="custom-checkbox"
                  />
                  <label htmlFor="freeze" className="text-zinc-300 text-sm font-medium">
                    {locale.get('ui.labels.freeze')}
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="blockEvents"
                    checked={formData.blockEvents}
                    onChange={(e) => setFormData(prev => ({ ...prev, blockEvents: e.target.checked }))}
                    className="custom-checkbox"
                  />
                  <label htmlFor="blockEvents" className="text-zinc-300 text-sm font-medium">
                    {locale.get('ui.labels.block_events')}
                  </label>
                </div>
              </div>

              {/* Animation Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="animationsAllowed"
                    checked={formData.animationsAllowed}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      animationsAllowed: e.target.checked,
                      useScenario: e.target.checked ? prev.useScenario : false,
                      useAnimation: e.target.checked ? prev.useAnimation : false
                    }))}
                    className="custom-checkbox"
                  />
                  <label htmlFor="animationsAllowed" className="text-zinc-300 text-sm font-medium">
                    {locale.get('ui.labels.animations_allowed')}
                  </label>
                </div>

                {formData.animationsAllowed && (
                  <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="useScenario"
                          checked={formData.useScenario}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            useScenario: e.target.checked,
                            useAnimation: e.target.checked ? false : prev.useAnimation
                          }))}
                          className="custom-checkbox"
                        />
                        <label htmlFor="useScenario" className="text-zinc-300 text-sm font-medium">
                          {locale.get('ui.labels.use_scenario')}
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="useAnimation"
                          checked={formData.useAnimation}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            useAnimation: e.target.checked,
                            useScenario: e.target.checked ? false : prev.useScenario
                          }))}
                          className="custom-checkbox"
                        />
                        <label htmlFor="useAnimation" className="text-zinc-300 text-sm font-medium">
                          {locale.get('ui.labels.use_animation')}
                        </label>
                      </div>
                    </div>

                    {formData.useScenario && (
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.scenario')}</label>
                        <input
                          type="text"
                          value={formData.scenario}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData(prev => ({ 
                              ...prev, 
                              scenario: value,
                              animationsAllowed: value.trim() !== '' ? true : prev.animationsAllowed,
                              useScenario: value.trim() !== '' ? true : prev.useScenario
                            }));
                          }}
                          className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                          placeholder={locale.get('ui.placeholders.enter_scenario')}
                        />
                      </div>
                    )}

                    {formData.useAnimation && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.animation_dict')}</label>
                          <input
                            type="text"
                            value={formData.animDict}
                            onChange={(e) => setFormData(prev => ({ ...prev, animDict: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                            placeholder={locale.get('ui.placeholders.animation_dict')}
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.animation_name')}</label>
                          <input
                            type="text"
                            value={formData.animName}
                            onChange={(e) => setFormData(prev => ({ ...prev, animName: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                            placeholder={locale.get('ui.placeholders.animation_name')}
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.animation_flag')}</label>
                          <CustomNumberInput
                            value={formData.animFlag}
                            onChange={(e) => setFormData(prev => ({ ...prev, animFlag: parseInt(e.target.value) || 1 }))}
                            min={0}
                            max={50}
                            step={1}
                            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                            placeholder="1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Weapon Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.weapon')}</label>
                  <input
                    type="text"
                    value={formData.weapon}
                    onChange={(e) => setFormData(prev => ({ ...prev, weapon: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                    placeholder={locale.get('ui.placeholders.enter_weapon')}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSpawnNPC}
                  disabled={!formData.name || !formData.model}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-all button-glow disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  {locale.get('ui.buttons.spawn_npc')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-primary-500 focus:outline-none input-glow transition-all"
                  placeholder={locale.get('ui.placeholders.search_npcs')}
                />
              </div>

              <div className="space-y-2">
                {filteredNPCs.map((npc) => (
                  <div key={npc.id} className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-3 hover:border-zinc-600 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <h3 className="text-white font-medium text-sm truncate max-w-[120px]" title={npc.name}>{npc.name}</h3>
                          <p className="text-zinc-400 text-xs truncate max-w-[120px]" title={npc.model}>{npc.model}</p>
                        </div>
                        <div className="flex-shrink-0 text-xs text-zinc-500">
                          <div>X: {npc.coords.x.toFixed(1)}</div>
                          <div>Y: {npc.coords.y.toFixed(1)}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`p-1 rounded ${
                            npc.invincible ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                          }`} title={npc.invincible ? locale.get('ui.tooltips.invincible') : locale.get('ui.tooltips.vulnerable')}>
                            <Shield className="w-4 h-4" />
                          </span>
                          <span className={`p-1 rounded ${
                            npc.freeze ? 'bg-blue-600/20 text-blue-400' : 'bg-yellow-600/20 text-yellow-400'
                          }`} title={npc.freeze ? locale.get('ui.tooltips.frozen') : locale.get('ui.tooltips.mobile')}>
                            <Snowflake className="w-4 h-4" />
                          </span>
                          {(npc.scenario || npc.animDict) && (
                            <span className="p-1 rounded bg-purple-600/20 text-purple-400" title={locale.get('ui.tooltips.animated')}>
                              <PlayCircle className="w-4 h-4" />
                            </span>
                          )}
                          {npc.weapon && npc.weapon.trim() !== '' && (
                            <span className="p-1 rounded bg-orange-600/20 text-orange-400" title={locale.get('ui.tooltips.armed')}>
                              <Swords className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 text-xs text-zinc-500 truncate">
                          Created by: {npc.createdByName || npc.createdBy || 'Unknown'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditNPC(npc)}
                          className="p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                          title={locale.get('ui.tooltips.edit')}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleTeleportToNPC(npc.id)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          title={locale.get('ui.tooltips.teleport')}
                        >
                          <Navigation className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteNPC(npc.id)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          title={locale.get('ui.tooltips.delete')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredNPCs.length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{locale.get('ui.messages.no_npcs_found')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit NPC Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{locale.get('ui.modals.edit_npc')}</h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.npc_name')}</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                      placeholder={locale.get('ui.placeholders.enter_npc_name')}
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.heading')}</label>
                    <CustomNumberInput
                      value={editForm.heading || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, heading: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={360}
                      step={0.1}
                      className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.coordinates')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-500 text-xs mb-1">X</label>
                      <CustomNumberInput
                        value={editForm.coords?.x || 0}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          coords: { ...prev.coords, x: parseFloat(e.target.value) || 0 }
                        }))}
                        step={0.01}
                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-xs mb-1">Y</label>
                      <CustomNumberInput
                        value={editForm.coords?.y || 0}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          coords: { ...prev.coords, y: parseFloat(e.target.value) || 0 }
                        }))}
                        step={0.01}
                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-xs mb-1">Z</label>
                      <CustomNumberInput
                        value={editForm.coords?.z || 0}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          coords: { ...prev.coords, z: parseFloat(e.target.value) || 0 }
                        }))}
                        step={0.01}
                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Ped Model Selection */}
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.ped_model')}</label>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editManualPedInput || editForm.model || ''}
                      onChange={(e) => handleEditManualPedInput(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                      placeholder={locale.get('ui.placeholders.enter_ped_model')}
                    />
                    
                    <div className="text-zinc-500 text-xs mb-2">{locale.get('ui.labels.or_select_from_favorites')}</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {favoritePeds.map((ped) => (
                        <button
                          key={ped}
                          onClick={() => handleEditSelectPed(ped)}
                          className={`px-3 py-2 text-xs rounded transition-colors ${
                            editForm.model === ped
                              ? 'bg-primary-600 text-white'
                              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                          }`}
                        >
                          {ped}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <label className="block text-zinc-400 text-sm mb-3">{locale.get('ui.labels.options')}</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit-invincible"
                        checked={editForm.invincible || false}
                        onChange={(e) => setEditForm(prev => ({ ...prev, invincible: e.target.checked }))}
                        className="custom-checkbox"
                      />
                      <label htmlFor="edit-invincible" className="text-zinc-300 text-sm">
                        {locale.get('ui.labels.invincible')}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit-freeze"
                        checked={editForm.freeze || false}
                        onChange={(e) => setEditForm(prev => ({ ...prev, freeze: e.target.checked }))}
                        className="custom-checkbox"
                      />
                      <label htmlFor="edit-freeze" className="text-zinc-300 text-sm">
                        {locale.get('ui.labels.freeze')}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit-blockEvents"
                        checked={editForm.blockEvents || false}
                        onChange={(e) => setEditForm(prev => ({ ...prev, blockEvents: e.target.checked }))}
                        className="custom-checkbox"
                      />
                      <label htmlFor="edit-blockEvents" className="text-zinc-300 text-sm">
                        {locale.get('ui.labels.block_events')}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Animation Section */}
                 <div className="space-y-4">
                   <div className="flex items-center gap-3">
                     <input
                       type="checkbox"
                       id="edit-animationsAllowed"
                       checked={editForm.animationsAllowed || false}
                       onChange={(e) => setEditForm(prev => ({ 
                         ...prev, 
                         animationsAllowed: e.target.checked,
                         useScenario: e.target.checked ? prev.useScenario : false,
                         useAnimation: e.target.checked ? prev.useAnimation : false
                       }))}
                       className="custom-checkbox"
                     />
                     <label htmlFor="edit-animationsAllowed" className="text-zinc-300 text-sm font-medium">
                       {locale.get('ui.labels.animations_allowed')}
                     </label>
                   </div>

                   {editForm.animationsAllowed && (
                     <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex items-center gap-3">
                           <input
                             type="checkbox"
                             id="edit-useScenario"
                             checked={editForm.useScenario || false}
                             onChange={(e) => setEditForm(prev => ({ 
                               ...prev, 
                               useScenario: e.target.checked,
                               useAnimation: e.target.checked ? false : prev.useAnimation
                             }))}
                             className="custom-checkbox"
                           />
                           <label htmlFor="edit-useScenario" className="text-zinc-300 text-sm font-medium">
                             {locale.get('ui.labels.use_scenario')}
                           </label>
                         </div>
                         <div className="flex items-center gap-3">
                           <input
                             type="checkbox"
                             id="edit-useAnimation"
                             checked={editForm.useAnimation || false}
                             onChange={(e) => setEditForm(prev => ({ 
                               ...prev, 
                               useAnimation: e.target.checked,
                               useScenario: e.target.checked ? false : prev.useScenario
                             }))}
                             className="custom-checkbox"
                           />
                           <label htmlFor="edit-useAnimation" className="text-zinc-300 text-sm font-medium">
                             {locale.get('ui.labels.use_animation')}
                           </label>
                         </div>
                       </div>

                       {editForm.useScenario && (
                         <div>
                           <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.scenario')}</label>
                           <input
                             type="text"
                             value={editForm.scenario || ''}
                             onChange={(e) => {
                               const value = e.target.value;
                               setEditForm(prev => ({ 
                                 ...prev, 
                                 scenario: value,
                                 animationsAllowed: value.trim() !== '' ? true : prev.animationsAllowed,
                                 useScenario: value.trim() !== '' ? true : prev.useScenario
                               }));
                             }}
                             className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                             placeholder={locale.get('ui.placeholders.enter_scenario')}
                           />
                         </div>
                       )}

                       {editForm.useAnimation && (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                           <div>
                             <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.animation_dictionary')}</label>
                             <input
                               type="text"
                               value={editForm.animDict || ''}
                               onChange={(e) => setEditForm(prev => ({ ...prev, animDict: e.target.value }))}
                               className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                               placeholder={locale.get('ui.placeholders.animation_dict')}
                             />
                           </div>
                           <div>
                             <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.animation_name')}</label>
                             <input
                               type="text"
                               value={editForm.animName || ''}
                               onChange={(e) => setEditForm(prev => ({ ...prev, animName: e.target.value }))}
                               className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                               placeholder={locale.get('ui.placeholders.animation_name')}
                             />
                           </div>
                           <div>
                             <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.animation_flag')}</label>
                             <CustomNumberInput
                               value={editForm.animFlag || 1}
                               onChange={(e) => setEditForm(prev => ({ ...prev, animFlag: parseInt(e.target.value) || 1 }))}
                               min={0}
                               max={50}
                               step={1}
                               className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                               placeholder="1"
                             />
                           </div>
                         </div>
                       )}
                     </div>
                   )}
                 </div>

                {/* Weapon Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">{locale.get('ui.labels.weapon_optional')}</label>
                     <input
                       type="text"
                       value={editForm.weapon || ''}
                       onChange={(e) => setEditForm(prev => ({ ...prev, weapon: e.target.value }))}
                       className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded text-white text-sm focus:border-primary-500 focus:outline-none input-glow"
                       placeholder={locale.get('ui.placeholders.enter_weapon')}
                     />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 justify-end pt-4 border-t border-zinc-700">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    {locale.get('ui.buttons.cancel')}
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm button-glow"
                  >
                    <Save className="w-4 h-4 inline mr-1" />
                    {locale.get('ui.buttons.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
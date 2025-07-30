# M1 NPC Spawner

## 🎥 Showcase Video

[![NPC Spawner Showcase](https://img.youtube.com/vi/MVOjghCmQTs/0.jpg)](https://youtu.be/MVOjghCmQTs)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FiveM](https://img.shields.io/badge/FiveM-Compatible-blue.svg)](https://fivem.net/)
[![ox_lib](https://img.shields.io/badge/ox__lib-Required-green.svg)](https://github.com/CommunityOx/ox_lib)

A modern NPC spawner for FiveM with React UI and advanced management features.

## ⚠️ IMPORTANT: Permission Configuration

**BEFORE USING THIS RESOURCE**, you must configure the permission system in `server/main.lua`:

```lua
local function checkPermission(source)
    local isAdmin = true  -- Change this line!
    return isAdmin
end
```

**By default, EVERYONE has access!** Replace the `isAdmin = true` line with your permission check:

```lua
-- Example: ACE Permissions
local function checkPermission(source)
    local isAdmin = IsPlayerAceAllowed(source, "npcspawner.use")
    return isAdmin
end

-- Example: Admin Group Check
local function checkPermission(source)
    local isAdmin = IsPlayerInGroup(source, "admin")
    return isAdmin
end

```

## Features

- **Proximity-based spawning** - NPCs spawn/despawn based on player distance
- **Real-time management** - Live updates across all clients
- **Modern React UI** - Clean, responsive interface
- **Weapon & animation support** - Full GTA V weapon and scenario system
- **Persistent storage** - JSON-based data saving
- **ox_lib integration** - Optimized performance

## Requirements

- FiveM Server
- [ox_lib](https://github.com/CommunityOx/ox_lib)

## Usage

Use `/npcspawner` command to open the interface.

## 🔧 Installation

### 🚀 Installation (Drag & Drop Ready)

1. **Download** the latest release from GitHub
2. **Extract** the archive to your `resources` folder
3. **Add** to your `server.cfg`:
   ```cfg
   ensure ox_lib
   ensure m1_npcspawner
   ```
4. **Restart** your server

**That's it!** The resource comes pre-built and ready to use. No compilation or build steps required.

### 🔧 Development Installation (For Contributors)

Only needed if you want to modify the NUI:

1. **Clone** this repository
2. **Install NUI dependencies**:
   ```bash
   cd nui
   npm install
   ```
3. **Make your changes** to the source files
4. **Build** the NUI:
   ```bash
   npm run build
   ```
5. **Test** your changes

## ⚙️ Configuration

### Basic Configuration

Edit `shared/config.lua` to customize behavior:

```lua
Config = {}

-- Proximity Settings
Config.SpawnDistance = 10.0      -- Distance to spawn NPCs (meters)
Config.DespawnDistance = 15.0    -- Distance to despawn NPCs (meters)
Config.UpdateInterval = 1000     -- Update frequency (milliseconds)

-- Default NPC Settings
Config.DefaultNPCSettings = {
    invincible = true,           -- NPCs are invincible by default
    freeze = true,               -- NPCs are frozen by default
    blockEvents = true,          -- Block NPC events by default
    animDict = nil,              -- Default animation dictionary
    animName = nil,              -- Default animation name
    scenario = nil,              -- Default scenario
    weapon = nil                 -- Default weapon
}

-- Favorite Ped Models (for quick access)
Config.FavoritePeds = {
    'mp_m_freemode_01',
    'mp_f_freemode_01',
    's_m_y_cop_01',
    's_f_y_cop_01',
    -- Add more as needed
}
```

### Advanced Configuration

#### Performance Tuning
- **SpawnDistance**: Lower values improve performance but reduce NPC visibility range
- **DespawnDistance**: Should be higher than SpawnDistance to prevent flickering
- **UpdateInterval**: Higher values reduce server load but decrease responsiveness

#### Memory Optimization
- NPCs automatically despawn when no players are nearby
- Model streaming is handled efficiently with proper cleanup
- ox_lib cache reduces redundant native calls

## 🔌 API Reference

### Client Events

#### Listening Events
```lua
-- NPC spawned
RegisterNetEvent('m1_npcspawner:npcSpawned')
AddEventHandler('m1_npcspawner:npcSpawned', function(npcData)
    -- Handle NPC spawn
end)

-- NPC deleted
RegisterNetEvent('m1_npcspawner:npcDeleted')
AddEventHandler('m1_npcspawner:npcDeleted', function(npcId)
    -- Handle NPC deletion
end)

-- NPC updated
RegisterNetEvent('m1_npcspawner:npcUpdated')
AddEventHandler('m1_npcspawner:npcUpdated', function(npcId, updateData)
    -- Handle NPC update
end)
```

#### Triggering Events
```lua
-- Open UI
TriggerEvent('m1_npcspawner:openUI')

-- Request NPC data
TriggerServerEvent('m1_npcspawner:requestNPCData')
```

### Server Events

```lua
-- Spawn NPC
TriggerServerEvent('m1_npcspawner:spawnNPC', npcData)

-- Delete NPC
TriggerServerEvent('m1_npcspawner:deleteNPC', npcId)

-- Update NPC
TriggerServerEvent('m1_npcspawner:updateNPC', npcId, updateData)
```


### Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 🐛 Troubleshooting

### Common Issues

#### NPCs Not Spawning
- **Check** ox_lib is installed and started
- **Verify** spawn distance configuration
- **Ensure** player is within spawn range
- **Check** server console for errors

#### UI Not Opening
- **Verify** NUI files are built (`nui/dist/` exists)
- **Check** browser console (F12) for JavaScript errors
- **Ensure** resource is started properly

#### Performance Issues
- **Increase** UpdateInterval in config
- **Reduce** SpawnDistance for fewer active NPCs
- **Check** server resource usage

#### Weapons Not Working
- **Verify** weapon names are correct
- **Check** weapon hash generation
- **Ensure** NPCs are not frozen when testing


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ✅ Attribution required
- ❌ No warranty provided
- ❌ No liability accepted


## 🙏 Acknowledgments

- **ox_lib** team for the excellent library
- **FiveM** community for resources and support
- **React** and **TailwindCSS** teams for amazing frameworks

---

**Made with ❤️ by M1 Development**
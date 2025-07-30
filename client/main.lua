local isUIOpen = false

-- Initialize locale system
LoadLocale('en')

local function formatToTwoDecimals(value)
    return math.floor(value * 100 + 0.5) / 100
end

local function getPlayerData()
    local coords = cache.coords or GetEntityCoords(cache.ped)
    local heading = GetEntityHeading(cache.ped)
    
    return {
        coords = {
            x = formatToTwoDecimals(coords.x),
            y = formatToTwoDecimals(coords.y),
            z = formatToTwoDecimals(coords.z)
        },
        heading = formatToTwoDecimals(heading)
    }
end

AddEventHandler('playerSpawned', function()
    TriggerServerEvent('m1_npcspawner:requestNPCData')
end)

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    
    TriggerEvent('chat:addSuggestion', '/npcspawner', _('commands.npcspawner'))
end)

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        TriggerEvent('chat:removeSuggestion', '/npcspawner')
    end
end)

RegisterNetEvent('m1_npcspawner:openUI', function()
    if isUIOpen then return end
    
    isUIOpen = true
    SetNuiFocus(true, true)
    
    local playerData = getPlayerData()
    
    SendNUIMessage({
        action = 'openUI',
        playerCoords = playerData.coords,
        playerHeading = playerData.heading,
        favoritePeds = Config.FavoritePeds,
        defaultSettings = Config.DefaultNPCSettings,
        locale = GetLocaleData()
    })
    
    TriggerServerEvent('m1_npcspawner:requestNPCData')
end)

RegisterNetEvent('m1_npcspawner:receiveNPCData', function(npcs)
    SendNUIMessage({
        action = 'updateNPCList',
        npcs = npcs
    })
end)

RegisterNetEvent('m1_npcspawner:teleportPlayer', function(coords)
    local playerPed = cache.ped
    SetEntityCoords(playerPed, coords.x, coords.y, coords.z, false, false, false, true)
    lib.notify({
        title = _('notifications.teleport.title'),
        description = _('notifications.teleport.description'),
        type = 'success'
    })
end)

RegisterNetEvent('m1_npcspawner:showNotification', function(message, type)
    lib.notify({
        description = message,
        type = type or 'inform'
    })
end)

RegisterNUICallback('closeUI', function(data, cb)
    isUIOpen = false
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('spawnNPC', function(data, cb)
    local playerData = getPlayerData()
    local coords, heading = playerData.coords, playerData.heading
    
    if data.useCustomCoords then
        coords = {
            x = formatToTwoDecimals(data.coords.x),
            y = formatToTwoDecimals(data.coords.y),
            z = formatToTwoDecimals(data.coords.z)
        }
        heading = formatToTwoDecimals(data.heading or 0.0)
    end
    
    local npcData = {
        name = data.name,
        model = data.model,
        coords = coords,
        heading = heading,
        invincible = data.invincible,
        freeze = data.freeze,
        blockEvents = data.blockEvents,
        animDict = data.animDict,
        animName = data.animName,
        animFlag = data.animFlag,
        scenario = data.scenario,
        weapon = data.weapon,
        animationsAllowed = data.animationsAllowed,
        useScenario = data.useScenario,
        useAnimation = data.useAnimation
    }
    
    TriggerServerEvent('m1_npcspawner:spawnNPC', npcData)
    cb('ok')
end)

RegisterNUICallback('deleteNPC', function(data, cb)
    TriggerServerEvent('m1_npcspawner:deleteNPC', data.npcId)
    cb('ok')
end)

RegisterNUICallback('updateNPC', function(data, cb)
    TriggerServerEvent('m1_npcspawner:updateNPC', data.npcId, data.updateData)
    cb('ok')
end)

RegisterNUICallback('teleportToNPC', function(data, cb)
    TriggerServerEvent('m1_npcspawner:teleportToNPC', data.npcId)
    cb('ok')
end)

RegisterNUICallback('getPlayerCoords', function(data, cb)
    cb(getPlayerData())
end)

local disabledControls = {1, 2, 142, 18, 322, 106}

CreateThread(function()
    while true do
        if isUIOpen then
            for i = 1, #disabledControls do
                DisableControlAction(0, disabledControls[i], true)
            end
            Wait(0)
        else
            Wait(250)
        end
    end
end)
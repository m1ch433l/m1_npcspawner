-- Initialize locale system
LoadLocale('en')

local function formatToTwoDecimals(value)
    return math.floor(value * 100 + 0.5) / 100
end

local function checkPermission(source)
    local isAdmin = true
    return isAdmin
end

RegisterCommand('npcspawner', function(source, args, rawCommand)
    if not checkPermission(source) then
        TriggerClientEvent('m1_npcspawner:showNotification', source, _('notifications.error.no_permission_spawn'), 'error')
        return
    end
    TriggerClientEvent('m1_npcspawner:openUI', source)
end, false)



RegisterNetEvent('m1_npcspawner:spawnNPC', function(data)
    local src = source
    
    if not checkPermission(src) then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.no_permission_spawn'), 'error')
        return
    end
    
    if not data or type(data) ~= 'table' then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.invalid_npc_data'), 'error')
        return
    end
    
    if not data.name or data.name == '' or not data.model or data.model == '' then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.required_fields'), 'error')
        return
    end
    
    if not data.coords or type(data.coords) ~= 'table' or not data.coords.x or not data.coords.y or not data.coords.z then
        TriggerClientEvent('m1_npcspawner:showNotification', src, 'Invalid coordinates provided', 'error')
        return
    end
    
    local npcData = {
        id = GenerateNPCId(),
        name = tostring(data.name):sub(1, 50),
        model = tostring(data.model):sub(1, 50),
        coords = {
            x = formatToTwoDecimals(tonumber(data.coords.x) or 0),
            y = formatToTwoDecimals(tonumber(data.coords.y) or 0),
            z = formatToTwoDecimals(tonumber(data.coords.z) or 0)
        },
        heading = formatToTwoDecimals(tonumber(data.heading) or 0),
        invincible = data.invincible ~= nil and data.invincible or false,
        freeze = data.freeze ~= nil and data.freeze or false,
        blockEvents = data.blockEvents ~= nil and data.blockEvents or false,
        animDict = data.animDict and tostring(data.animDict):sub(1, 50) or '',
        animName = data.animName and tostring(data.animName):sub(1, 50) or '',
        animFlag = tonumber(data.animFlag) or 1,
        scenario = data.scenario and tostring(data.scenario):sub(1, 50) or '',
        weapon = data.weapon and tostring(data.weapon):sub(1, 50) or '',
        animationsAllowed = data.animationsAllowed or false,
        useScenario = data.useScenario or false,
        useAnimation = data.useAnimation or false,
        createdBy = src,
        createdAt = os.time()
    }
    
    SaveNPCData(npcData)
    TriggerClientEvent('m1_npcspawner:npcSpawned', -1, npcData)
    TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.success.npc_spawned'), 'success')
end)

RegisterNetEvent('m1_npcspawner:deleteNPC', function(npcId)
    local src = source
    
    if not checkPermission(src) then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.no_permission_delete'), 'error')
        return
    end
    
    if not npcId or type(npcId) ~= 'string' or npcId == '' then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.invalid_npc_id'), 'error')
        return
    end
    
    DeleteNPCData(npcId)
    TriggerClientEvent('m1_npcspawner:npcDeleted', -1, npcId)
    TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.success.npc_deleted'), 'success')
end)

RegisterNetEvent('m1_npcspawner:updateNPC', function(npcId, data)
    local src = source
    
    if not checkPermission(src) then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.no_permission_update'), 'error')
        return
    end
    
    if not npcId or type(npcId) ~= 'string' or npcId == '' then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.invalid_npc_id'), 'error')
        return
    end
    
    if not data or type(data) ~= 'table' then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.invalid_update_data'), 'error')
        return
    end
    
    UpdateNPCData(npcId, data)
    TriggerClientEvent('m1_npcspawner:npcUpdated', -1, npcId, data)
    TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.success.npc_updated'), 'success')
end)

local function getPlayerNameSafe(playerId)
    if not playerId then return 'Unknown' end
    local playerName = GetPlayerName(playerId)
    return playerName or 'Unknown Player'
end

RegisterNetEvent('m1_npcspawner:requestNPCData', function()
    local src = source
    
    if not checkPermission(src) then
        return
    end
    local npcs = GetAllNPCs()
    
    for i = 1, #npcs do
        npcs[i].createdByName = getPlayerNameSafe(npcs[i].createdBy)
    end
    
    TriggerClientEvent('m1_npcspawner:receiveNPCData', src, npcs)
end)

RegisterNetEvent('m1_npcspawner:teleportToNPC', function(npcId)
    local src = source
    
    if not checkPermission(src) then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.no_permission_teleport'), 'error')
        return
    end
    
    if not npcId or type(npcId) ~= 'string' or npcId == '' then
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.invalid_npc_id'), 'error')
        return
    end
    
    local npcData = GetNPCData(npcId)
    if npcData then
        TriggerClientEvent('m1_npcspawner:teleportPlayer', src, npcData.coords)
    else
        TriggerClientEvent('m1_npcspawner:showNotification', src, _('notifications.error.npc_not_found'), 'error')
    end
end)

local npcIdCounter = 0

function GenerateNPCId()
    npcIdCounter = npcIdCounter + 1
    return ('npc_%d_%d'):format(npcIdCounter, os.time())
end

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    
    CreateThread(function()
        InitializeNPCData()
        Wait(1500)
        
        local npcs = GetAllNPCs()
        local npcCount = #npcs
        
        if npcCount > 0 then
            for _, npcData in ipairs(npcs) do
                TriggerClientEvent('m1_npcspawner:npcSpawned', -1, npcData)
            end
        end
    end)
end)

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        -- Resource stopped
    end
end)
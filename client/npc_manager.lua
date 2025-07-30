local spawnedNPCs = {}
local allNPCs = {}

local function formatToTwoDecimals(value)
    return math.floor(value * 100 + 0.5) / 100
end

local function getWeaponHash(weaponName)
    return GetHashKey(weaponName)
end

RegisterNetEvent('m1_npcspawner:npcSpawned', function(npcData)
    table.insert(allNPCs, npcData)
    CheckNPCProximity()
    
    SendNUIMessage({
        action = 'updateNPCList',
        npcs = allNPCs
    })
end)

RegisterNetEvent('m1_npcspawner:npcDeleted', function(npcId)
    for i, npc in ipairs(allNPCs) do
        if npc.id == npcId then
            table.remove(allNPCs, i)
            break
        end
    end
    
    if spawnedNPCs[npcId] then
        if DoesEntityExist(spawnedNPCs[npcId].entity) then
            DeleteEntity(spawnedNPCs[npcId].entity)
        end
        spawnedNPCs[npcId] = nil
    end
    
    -- Update NUI with updated NPC list
    SendNUIMessage({
        action = 'updateNPCList',
        npcs = allNPCs
    })
end)

RegisterNetEvent('m1_npcspawner:npcUpdated', function(npcId, updateData)
    for i, npc in ipairs(allNPCs) do
        if npc.id == npcId then
            for key, value in pairs(updateData) do
                allNPCs[i][key] = value
            end
            break
        end
    end
    
    if spawnedNPCs[npcId] then
        local entity = spawnedNPCs[npcId].entity
        if DoesEntityExist(entity) then
            local needsRespawn = false
            
            if updateData.model and updateData.model ~= spawnedNPCs[npcId].data.model then
                needsRespawn = true
            end
            
            if needsRespawn or (updateData.animationsAllowed ~= nil) or (updateData.useScenario ~= nil) or (updateData.useAnimation ~= nil) or updateData.scenario or updateData.animDict or updateData.animName or updateData.animFlag or updateData.weapon or (updateData.invincible ~= nil) or (updateData.freeze ~= nil) or (updateData.blockEvents ~= nil) then
                DespawnNPC(npcId)
                Wait(100)
                for _, npcData in ipairs(allNPCs) do
                    if npcData.id == npcId then
                        SpawnNPC(npcData)
                        break
                    end
                end
            else
                if updateData.name then
                    spawnedNPCs[npcId].data.name = updateData.name
                end
                
                if updateData.coords then
                    SetEntityCoords(entity, formatToTwoDecimals(updateData.coords.x), formatToTwoDecimals(updateData.coords.y), formatToTwoDecimals(updateData.coords.z), false, false, false, true)
                    spawnedNPCs[npcId].data.coords = {
                        x = formatToTwoDecimals(updateData.coords.x),
                        y = formatToTwoDecimals(updateData.coords.y),
                        z = formatToTwoDecimals(updateData.coords.z)
                    }
                end
                
                if updateData.heading then
                    SetEntityHeading(entity, formatToTwoDecimals(updateData.heading))
                    spawnedNPCs[npcId].data.heading = formatToTwoDecimals(updateData.heading)
                end
                
                if updateData.invincible ~= nil then
                    SetEntityInvincible(entity, updateData.invincible)
                    spawnedNPCs[npcId].data.invincible = updateData.invincible
                end
                
                if updateData.freeze ~= nil then
                    FreezeEntityPosition(entity, updateData.freeze)
                    spawnedNPCs[npcId].data.freeze = updateData.freeze
                end
                
                if updateData.blockEvents ~= nil then
                    SetBlockingOfNonTemporaryEvents(entity, updateData.blockEvents)
                    spawnedNPCs[npcId].data.blockEvents = updateData.blockEvents
                end
            end
        end
    end
    
    SendNUIMessage({
        action = 'updateNPCList',
        npcs = allNPCs
    })
end)

RegisterNetEvent('m1_npcspawner:receiveNPCData', function(npcs)
    allNPCs = npcs
    CheckNPCProximity()
end)

function SpawnNPC(npcData)
    if spawnedNPCs[npcData.id] then return end
    
    local modelHash = GetHashKey(npcData.model)
    
    RequestModel(modelHash)
    while not HasModelLoaded(modelHash) do
        Wait(1)
    end
    
    local npc = CreatePed(4, modelHash, formatToTwoDecimals(npcData.coords.x), formatToTwoDecimals(npcData.coords.y), formatToTwoDecimals(npcData.coords.z - 1.0), formatToTwoDecimals(npcData.heading), false, true)
    
    if DoesEntityExist(npc) then
        local isInvincible = npcData.invincible ~= nil and npcData.invincible or false
        local isFrozen = npcData.freeze ~= nil and npcData.freeze or false
        local blockEvents = npcData.blockEvents ~= nil and npcData.blockEvents or false
        
        SetEntityInvincible(npc, isInvincible)
        FreezeEntityPosition(npc, isFrozen)
        SetBlockingOfNonTemporaryEvents(npc, blockEvents)
        SetPedCanRagdoll(npc, not isFrozen)
        SetEntityCanBeDamaged(npc, not isInvincible)
        
        local hasScenario = npcData.scenario and npcData.scenario ~= ''
        local hasAnimation = npcData.animDict and npcData.animDict ~= '' and npcData.animName and npcData.animName ~= ''
        
        local animationsAllowed = npcData.animationsAllowed or hasScenario or hasAnimation
        local useScenario = npcData.useScenario or (hasScenario and not npcData.useAnimation)
        local useAnimation = npcData.useAnimation or (hasAnimation and not npcData.useScenario)
        
        if animationsAllowed and useScenario and hasScenario then
            TaskStartScenarioInPlace(npc, npcData.scenario, 0, true)
        elseif animationsAllowed and useAnimation and hasAnimation then
            RequestAnimDict(npcData.animDict)
            while not HasAnimDictLoaded(npcData.animDict) do
                Wait(1)
            end
            TaskPlayAnim(npc, npcData.animDict, npcData.animName, 8.0, -8.0, -1, npcData.animFlag or 1, 0, false, false, false)
        end
        
        if npcData.weapon and npcData.weapon ~= '' then
            local weaponHash = getWeaponHash(npcData.weapon)
            
            CreateThread(function()
                Wait(500)
                
                if DoesEntityExist(npc) then
                    GiveWeaponToPed(npc, weaponHash, 999, false, true)
                    SetCurrentPedWeapon(npc, weaponHash, true)
                    SetPedCanSwitchWeapon(npc, true)
                    
                    Wait(200)
                    
                    if GetSelectedPedWeapon(npc) ~= weaponHash then
                        Wait(300)
                        GiveWeaponToPed(npc, weaponHash, 999, false, true)
                        SetCurrentPedWeapon(npc, weaponHash, true)
                    end
                end
            end)
        end
        
        spawnedNPCs[npcData.id] = {
            entity = npc,
            data = npcData
        }
        
        SetModelAsNoLongerNeeded(modelHash)
    end
end

function DespawnNPC(npcId)
    if not spawnedNPCs[npcId] then return end
    
    local entity = spawnedNPCs[npcId].entity
    if DoesEntityExist(entity) then
        DeleteEntity(entity)
    end
    
    spawnedNPCs[npcId] = nil
end

local function getPlayerCoords()
    return cache.coords or GetEntityCoords(cache.ped or PlayerPedId())
end

function CheckNPCProximity()
    if #allNPCs == 0 then return end
    
    local playerCoords = getPlayerCoords()
    local spawnDist = Config.SpawnDistance
    local despawnDist = Config.DespawnDistance
    
    for i = 1, #allNPCs do
        local npcData = allNPCs[i]
        local npcCoords = vector3(npcData.coords.x, npcData.coords.y, npcData.coords.z)
        local distance = #(playerCoords - npcCoords)
        
        if distance <= spawnDist then
            if not spawnedNPCs[npcData.id] then
                SpawnNPC(npcData)
            end
        elseif distance >= despawnDist then
            if spawnedNPCs[npcData.id] then
                DespawnNPC(npcData.id)
            end
        end
    end
end

CreateThread(function()
    while true do
        local npcCount = #allNPCs
        if npcCount > 0 then
            CheckNPCProximity()
            Wait(Config.UpdateInterval or 1000)
        else
            Wait((Config.UpdateInterval or 1000) * 3)
        end
    end
end)

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        -- NPCs will be automatically sent by server via npcSpawned events
        -- No need to request NPC data here
    end
end)

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        for npcId, _ in pairs(spawnedNPCs) do
            DespawnNPC(npcId)
        end
    end
end)
local npcs = {}
local dataFile = 'data/npcs.json'

local function formatToTwoDecimals(value)
    return math.floor(value * 100 + 0.5) / 100
end

local function findNPCIndex(npcId)
    for i = 1, #npcs do
        if npcs[i].id == npcId then
            return i
        end
    end
    return nil
end

function InitializeNPCData()
    local file = LoadResourceFile(GetCurrentResourceName(), dataFile)
    if file then
        local success, data = pcall(json.decode, file)
        if success and data then
            npcs = data
            print('^2[M1 NPC Spawner]^7 Loaded ' .. #npcs .. ' NPCs from data file')
        else
            print('^3[M1 NPC Spawner]^7 Failed to parse NPC data, starting with empty data')
            npcs = {}
        end
    else
        print('^3[M1 NPC Spawner]^7 No existing NPC data found, starting fresh')
        npcs = {}
        SaveNPCDataToFile()
    end
end

function SaveNPCDataToFile()
    local success = SaveResourceFile(GetCurrentResourceName(), dataFile, json.encode(npcs, {indent = true}), -1)
    if not success then
        print('^1[M1 NPC Spawner]^7 Failed to save NPC data to file')
    end
end

function SaveNPCData(npcData)
    table.insert(npcs, npcData)
    SaveNPCDataToFile()
end

function DeleteNPCData(npcId)
    local index = findNPCIndex(npcId)
    if index then
        table.remove(npcs, index)
        SaveNPCDataToFile()
        return true
    end
    return false
end

function UpdateNPCData(npcId, newData)
    local index = findNPCIndex(npcId)
    if not index then return false end
    
    for key, value in pairs(newData) do
        if key == 'coords' and type(value) == 'table' then
            npcs[index][key] = {
                x = formatToTwoDecimals(value.x),
                y = formatToTwoDecimals(value.y),
                z = formatToTwoDecimals(value.z)
            }
        elseif key == 'heading' and type(value) == 'number' then
            npcs[index][key] = formatToTwoDecimals(value)
        else
            npcs[index][key] = value
        end
    end
    
    SaveNPCDataToFile()
    return true
end

function GetNPCData(npcId)
    local index = findNPCIndex(npcId)
    return index and npcs[index] or nil
end

function GetAllNPCs()
    return npcs
end

function GetNPCsByCreator(citizenid)
    local result = {}
    for i = 1, #npcs do
        if npcs[i].createdBy == citizenid then
            result[#result + 1] = npcs[i]
        end
    end
    return result
end
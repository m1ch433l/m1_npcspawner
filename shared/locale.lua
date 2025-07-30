-- Custom Locale System
locale = {}
locale.data = {}
locale.currentLanguage = 'en'

-- Load locale data from JSON file
function locale.load(language)
    language = language or 'en'
    local file = LoadResourceFile(GetCurrentResourceName(), 'locales/' .. language .. '.json')
    
    if file then
        locale.data = json.decode(file)
        locale.currentLanguage = language
        return true
    else
        print('[LOCALE] Failed to load language: ' .. language)
        return false
    end
end

-- Get translation by key with dot notation support
function locale.get(key, ...)
    if not locale.data then
        return key
    end
    
    local keys = {}
    for k in string.gmatch(key, "[^%.]+") do
        table.insert(keys, k)
    end
    
    local value = locale.data
    for _, k in ipairs(keys) do
        if type(value) == 'table' and value[k] then
            value = value[k]
        else
            return key -- Return key if not found
        end
    end
    
    if type(value) == 'string' then
        -- Handle string formatting if arguments provided
        local args = {...}
        if #args > 0 then
            return string.format(value, table.unpack(args))
        end
        return value
    end
    
    return key
end

-- Alias for easier usage
function _(key, ...)
    return locale.get(key, ...)
end

-- Global function for loading locale
function LoadLocale(language)
    return locale.load(language)
end

-- Get all locale data for NUI
function GetLocaleData()
    return locale.data or {}
end

-- Initialize locale system
CreateThread(function()
    locale.load('en')
end)
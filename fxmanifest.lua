fx_version 'cerulean'
game 'gta5'

author 'M1 Development'
description 'Advanced NPC Spawner with React NUI'
version '1.0.0'

ui_page 'nui/dist/index.html'

files {
    'nui/dist/index.html',
    'nui/dist/**/*',
    'data/npcs.json',
    'locales/*.json'
}

client_scripts {
    'client/main.lua',
    'client/npc_manager.lua'
}

server_scripts {
    'server/main.lua',
    'server/npc_data.lua'
}

shared_scripts {
    '@ox_lib/init.lua',
    'shared/config.lua',
    'shared/locale.lua'
}



dependency 'ox_lib'
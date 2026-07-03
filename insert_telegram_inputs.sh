#!/bin/bash
sed -i '/<button/ i \
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">\
              <h3 className="text-lg font-bold text-slate-900 mb-4">Telegram Bot Integration</h3>\
              <div className="space-y-4">\
                <div>\
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bot Token</label>\
                  <input \
                    type="text" \
                    placeholder="e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"\
                    value={settings.telegramBotToken} \
                    onChange={(e) => setSettings({...settings, telegramBotToken: e.target.value})}\
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" \
                  />\
                </div>\
                <div>\
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Chat ID</label>\
                  <input \
                    type="text" \
                    placeholder="e.g. -100123456789"\
                    value={settings.telegramChatId} \
                    onChange={(e) => setSettings({...settings, telegramChatId: e.target.value})}\
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" \
                  />\
                </div>\
              </div>\
           </div>\
' src/pages/admin/Dashboard.tsx

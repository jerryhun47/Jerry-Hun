import re

with open('src/pages/admin/Dashboard.tsx', 'r') as f:
    content = f.read()

target = r"""                {settings.clientReviewUrl && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Preview:</p>
                    <img src={settings.clientReviewUrl} alt="Preview" className="w-full max-w-md rounded-xl border border-slate-200 shadow-sm" />
                  </div>
                )}
              </div>
           </div>"""

replacement = target + r"""
           
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Telegram Bot Integration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bot Token</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={settings.telegramBotToken} 
                    onChange={(e) => setSettings({...settings, telegramBotToken: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Chat ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. -100123456789"
                    value={settings.telegramChatId} 
                    onChange={(e) => setSettings({...settings, telegramChatId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  />
                </div>
              </div>
           </div>"""

new_content = content.replace(target, replacement)

with open('src/pages/admin/Dashboard.tsx', 'w') as f:
    f.write(new_content)

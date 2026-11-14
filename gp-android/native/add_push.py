#!/usr/bin/env python3
"""
`npx cap add android` नंतर, `npx cap sync` च्या आधी चालवायचे:  python3 native/add_push.py
  • native/google-services.json असेल तर android/app/ मध्ये कॉपी करतो आणि www/push-flag.js मध्ये GP_PUSH=true करतो.
  • ती फाईल नसेल तर Push बंद ठेवून APK तरीही बनतो (अ‍ॅप crash होत नाही).
  • AndroidManifest मध्ये POST_NOTIFICATIONS परवानगी (Android 13+) नसेल तर जोडतो.
"""
import shutil
from pathlib import Path

root = Path(__file__).resolve().parent.parent
gs = root / 'native' / 'google-services.json'
flag = root / 'www' / 'push-flag.js'
manifest = root / 'android' / 'app' / 'src' / 'main' / 'AndroidManifest.xml'

if gs.exists():
    shutil.copy(gs, root / 'android' / 'app' / 'google-services.json')
    flag.write_text('window.GP_PUSH = true;\n', encoding='utf-8')
    print('✔ google-services.json सापडली — Push चालू')
else:
    flag.write_text('window.GP_PUSH = false;\n', encoding='utf-8')
    print('⚠ native/google-services.json नाही — Push बंद ठेवून build होईल')

if manifest.exists():
    m = manifest.read_text(encoding='utf-8')
    perm = 'android.permission.POST_NOTIFICATIONS'
    if perm not in m:
        m = m.replace('</manifest>', '    <uses-permission android:name="%s" />\n</manifest>' % perm)
        manifest.write_text(m, encoding='utf-8')
        print('✔ POST_NOTIFICATIONS परवानगी जोडली')

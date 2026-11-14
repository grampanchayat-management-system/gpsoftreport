/* GP Software — Android push notification (नवीन अर्ज आल्यावर) — Firebase Cloud Messaging
   अटी: APK google-services.json सह build झालेला असावा (window.GP_PUSH=true) आणि
   सेटिंग्समध्ये "मंजुरी Web App URL" व "मंजुरी Secret" भरलेले असावेत. */
(function(){
  var C = window.Capacitor || {}, ON = 'gp_push_on', hooked = false;
  function status(t){ var e = document.getElementById('gpPushStatus'); if(e) e.textContent = t; }
  function cfg(){ try{ return (typeof config !== 'undefined' && config) || {}; }catch(e){ return {}; } }
  function plugin(){ try{ return (C.registerPlugin ? C.registerPlugin('PushNotifications') : (C.Plugins || {}).PushNotifications) || null; }catch(e){ return null; } }

  function sendToken(tok){
    var c = cfg();
    if(!c.apprUrl || !c.apprKey) return Promise.reject(new Error('आधी "मंजुरी Web App URL" व "मंजुरी Secret" टाका आणि जतन करा'));
    return fetch(c.apprUrl + '?action=regtoken&key=' + encodeURIComponent(c.apprKey) + '&token=' + encodeURIComponent(tok))
      .then(function(r){ return r.text(); })
      .then(function(t){ if(t.indexOf('"ok":true') < 0) throw new Error('Apps Script: ' + String(t).slice(0, 60)); });
  }

  function hook(PN){
    if(hooked) return; hooked = true;
    PN.addListener('registration', function(t){
      sendToken(t.value).then(function(){
        try{ localStorage.setItem(ON, '1'); }catch(e){}
        status('✅ Notification चालू — नवीन अर्ज आला की इथे सूचना येईल.');
      }).catch(function(e){ status('⚠️ ' + ((e && e.message) || e)); });
    });
    PN.addListener('registrationError', function(e){ status('⚠️ नोंदणी अयशस्वी: ' + JSON.stringify(e).slice(0, 120)); });
    PN.addListener('pushNotificationReceived', function(n){
      if(typeof gpToast === 'function') gpToast('🔔 ' + (n.title || '') + (n.body ? ' — ' + n.body : ''));
    });
  }

  window.gpEnablePush = function(){
    if(!window.GP_PUSH){ status('या APK मध्ये Push नाही — native/google-services.json टाकून पुन्हा build करा.'); return; }
    var PN = plugin();
    if(!PN){ status('PushNotifications plugin अ‍ॅपमध्ये नाही.'); return; }
    status('परवानगी मागत आहे…');
    hook(PN);
    PN.requestPermissions().then(function(r){
      if(!r || r.receive !== 'granted') throw new Error('Notification ची परवानगी दिलेली नाही (फोन सेटिंग्समध्ये चालू करा)');
      return Promise.resolve(PN.createChannel && PN.createChannel({
        id: 'gp_requests', name: 'नवीन अर्ज', description: 'नवीन Demo अर्जाची सूचना', importance: 5, visibility: 1, vibration: true
      })).catch(function(){});
    }).then(function(){ return PN.register(); })
      .catch(function(e){ status('⚠️ ' + ((e && e.message) || e)); });
  };

  /* आधी चालू केले असेल तर अ‍ॅप उघडल्यावर आपोआप पुन्हा नोंदणी (token बदलला असल्यास) */
  window.addEventListener('load', function(){
    try{ if(window.GP_PUSH && localStorage.getItem(ON) === '1') setTimeout(window.gpEnablePush, 4000); }catch(e){}
  });
})();

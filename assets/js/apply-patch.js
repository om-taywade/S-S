/**
 * Applies wedding-config.json values to the bundled app (app.base.js).
 * Used by edit.html (browser) and scripts/patch-bundle.js (Node).
 */
(function (root) {
  const BG_VARS = ["tE", "nE", "rE", "oE", "iE"];
  const STORAGE_KEY = "weddingInvitationConfig";
  const PATCHED_APP_KEY = "weddingInvitationPatchedApp";
  /** Bump when default content changes so stale localStorage is ignored */
  const CONFIG_VERSION = 4;

  const IMAGE_ASSETS = [
    "envelop-sr7wwrnc.png",
    "logo1-CEx21hqH.png",
    "mainbg-C1qdEah8.jpg",
    "pathbithai-mN0HwaUc.png",
    "sanget-Bz6_t-zi.png",
    "varmal-C8h79Pnd.png",
    "phere-LBZBKn6h.png",
    "recept-CMr8tXBs.jpg",
  ];

  const FAMILIES_SECTION =
    ',w.jsxs("section",{className:"relative py-20 px-6 bg-sage-soft bg-secondary",children:[w.jsx(No,{}),w.jsxs("div",{className:"relative max-w-5xl mx-auto text-center",children:[w.jsx("p",{className:"font-cinzel text-xs text-sage-deep tracking-widest",children:"WITH LOVE"}),w.jsx("h2",{className:"font-script text-4xl sm:text-4xl text-rose-deep mt-2",children:"The Families"}),w.jsx(To,{}),w.jsx("p",{className:"font-serif-display italic text-lg text-foreground/80 max-w-2xl mx-auto",children:"Eagerly waiting for your presence,"}),w.jsx("div",{className:"mt-8 gap-6 sm:grid-cols-2",children:w.jsx(hE,{title:"Makana\'s",names:["Prasanchand, Gyanchand, Harishchand,","Abhay, Arihant, Dhruv & Family"]})})]})]})';

  const DEFAULT_FOOTER =
    'w.jsxs("footer",{className:"bg-foreground text-cream py-16 px-6 text-center text-primary-foreground",children:[w.jsx("p",{className:"font-cinzel text-xs tracking-[0.4em] text-gold-soft",children:"WITH LOVE"}),w.jsx("h3",{className:"font-script text-5xl sm:text-6xl text-cream mt-3 text-primary-foreground",children:"Khushi & Pranay"}),w.jsxs("div",{className:"my-5 flex items-center justify-center gap-3",children:[w.jsx("span",{className:"h-px w-12 bg-gold-soft/40"}),w.jsx("span",{className:"text-2xl",children:"💐"}),w.jsx("span",{className:"h-px w-12 bg-gold-soft/40"})]}),w.jsx("p",{className:"font-serif-display text-lg italic",children:"27th June 2026"}),w.jsx("p",{className:"mt-3 font-cinzel text-xs tracking-widest text-cream/70",children:"#KhushiWedsPranay"})]})';

  function fixAssetPaths(source) {
    let s = source;
    for (const file of IMAGE_ASSETS) {
      s = s.split(`"./assets/${file}"`).join(`"./assets/images/${file}"`);
    }
    return s;
  }

  function buildFooter(config) {
    const c = config.couple;
    const cl = config.closing || {};
    const coupleLine = cl.coupleLine || `${c.brideName} & ${c.groomName}`;
    const dateLine = cl.dateLine || "24th June 2026";
    const hashtag = cl.hashtag || "#SaniyaWedsSiddhant";
    const copyright =
      cl.copyright || "© 2026 Om Taywade. All rights reserved. | Built with ❤️";
    return `w.jsxs("footer",{className:"bg-foreground text-cream py-16 px-6 text-center text-primary-foreground",children:[w.jsx("p",{className:"font-cinzel text-xs tracking-[0.4em] text-gold-soft",children:"WITH LOVE"}),w.jsx("h3",{className:"font-script text-5xl sm:text-6xl text-cream mt-3 text-primary-foreground",children:"${esc(coupleLine)}"}),w.jsxs("div",{className:"my-5 flex items-center justify-center gap-3",children:[w.jsx("span",{className:"h-px w-12 bg-gold-soft/40"}),w.jsx("span",{className:"text-2xl",children:"💐"}),w.jsx("span",{className:"h-px w-12 bg-gold-soft/40"})]}),w.jsx("p",{className:"font-serif-display text-lg italic",children:"${esc(dateLine)}"}),w.jsx("p",{className:"mt-3 font-cinzel text-xs tracking-widest text-cream/70",children:"${esc(hashtag)}"}),w.jsx("p",{className:"mt-8 font-serif-display text-sm text-cream/60",children:"${esc(copyright)}"})]})`;
  }

  function esc(str) {
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r/g, "")
      .replace(/\n/g, "\\n");
  }

  function escTemplate(str) {
    return String(str).replace(/\\/g, "\\\\").replace(/`/g, "\\`");
  }

  function buildEmbedUrl(venue) {
    const query = encodeURIComponent(
      `${venue || "Telai Celebrations Hall"}, Shegaon-Rahatgaon Rd, Arjun Nagar, Amravati, Maharashtra 444601, India`
    );
    return `https://maps.google.com/maps?q=${query}&hl=en&z=16&output=embed`;
  }

  function buildDirectionsUrl(venue) {
    const query = encodeURIComponent(
      `${venue || "Telai Celebrations Hall"}, Shegaon-Rahatgaon Rd, Arjun Nagar, Amravati, Maharashtra 444601, India`
    );
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  }

  /** Live Google Maps on hosted sites; static image only when embedUrl is false. */
  function buildMapBlock(config) {
    if (config.maps?.embedUrl === false || config.maps?.embedUrl === "false") {
      return `w.jsx("img",{title:"Venue map",src:"${esc(config.maps?.staticMapImage || "./assets/images/venue-map.svg")}",alt:"${esc(config.venue)}",className:"w-full h-[360px] object-cover"})`;
    }
    const src =
      (typeof config.maps?.embedUrl === "string" && config.maps.embedUrl.trim()) ||
      buildEmbedUrl(config.venue);
    return `w.jsx("iframe",{title:"Venue map",src:"${esc(src)}",className:"w-full h-[360px] border-0",loading:"lazy",referrerPolicy:"no-referrer-when-downgrade",allowFullScreen:!0})`;
  }

  function jsxLineage(lines) {
    if (!lines || lines.length === 0) return 'children:""';
    if (lines.length === 1) return `children:"${esc(lines[0])}"`;
    const parts = lines.map((line, i) => {
      const text = esc(line);
      if (i === 0) return `"${text}"`;
      return `w.jsx("br",{}),"${text}"`;
    });
    return `children:[${parts.join(",")}]`;
  }

  function buildEventsBlock(events) {
    return events
      .map((ev, i) => {
        const bg = BG_VARS[i] || BG_VARS[BG_VARS.length - 1];
        const desc =
          ev.description && ev.description.includes("\n")
            ? `\`${escTemplate(ev.description)}\``
            : `"${esc(ev.description)}"`;
        const venue = ev.venue
          ? `venue:"${esc(ev.venue)}"`
          : "venue:Po";
        return `{title:"${esc(ev.title)}",description:${desc},day:"${esc(ev.day)}",date:"${esc(ev.date)}",time:"${esc(ev.time)}",${venue},dressCode:"${esc(ev.dressCode || "")}",icon:"${esc(ev.icon)}",bg:${bg},dark:!0}`;
      })
      .join(",");
  }

  function replaceOnce(source, search, replacement, label) {
    if (!source.includes(search)) {
      throw new Error(`Patch failed: could not find ${label || "segment"} in app bundle.`);
    }
    return source.replace(search, replacement);
  }

  function jsxInvocation(lines) {
    return (lines || [])
      .map(
        (line) =>
          `w.jsx("p",{className:"font-serif-display italic text-xs sm:text-xs mt-2",children:"${esc(line)}"})`
      )
      .join(",");
  }

  function applyPatch(appSource, config) {
    const c = config.couple;
    let s = appSource;

    const oldInvocation =
      'w.jsx("p",{className:"font-serif-display italic text-xs sm:text-xs mt-2",children:"‖ Shri Moraimataya Namah ‖\u00a0\u00a0 ‖ Shree Ganeshaya Namah ‖"}),w.jsx("p",{className:"font-serif-display italic text-xs sm:text-xs mt-2",children:"‖ Shri Pithrji Namah ‖\u00a0\u00a0 ‖ Shri Mahaveeraiya Namah ‖ ‖"}),w.jsx("p",{className:"font-serif-display italic text-xs sm:text-xs mt-2",children:"‖ Jai Jinendra ‖"})';

    if (config.invocation?.length) {
      s = replaceOnce(s, oldInvocation, jsxInvocation(config.invocation), "invocation lines");
    }

    if (config.saveTheDate) {
      s = replaceOnce(
        s,
        'children:"26th & 27th June 2026"',
        `children:"${esc(config.saveTheDate)}"`,
        "save the date"
      );
    }

    if (config.countdownIso) {
      s = replaceOnce(
        s,
        'new Date("2026-06-27T00:00:00+05:30")',
        `new Date("${esc(config.countdownIso)}")`,
        "countdown target"
      );
    }

    const oldEvents =
      'Po="Veerdency Luxury Resort",fE=[{title:"Paath Bithai",description:"A sacred prayer to begin our journey",day:"FRI",date:"June 26, 2026",time:"12:00 PM onwards",venue:Po,dressCode:"Traditional Indian attire",icon:"📿",bg:tE,dark:!0},{title:"Sundowner Sangeet",description:"An evening of song, dance and laughter under the setting sun",day:"Fri",date:"June 26, 2026",time:"05:30 PM onwards",venue:Po,dressCode:"Festive cocktail — vibrant and twinkling",icon:"🎶",bg:nE,dark:!0},{title:"Baarat Swagat & Varmala",description:"The grand welcome of the baarat and exchange of garlands",day:"Sat",date:"June 27, 2026",time:"11:00 AM onwards",venue:Po,dressCode:"Indian festive — bright and joyous",icon:"🐎",bg:rE,dark:!0},{title:"Phera",description:`The sacred seven vows\naround the holy fire`,day:"Sat",date:"June 27, 2026",time:"01:30 PM onwards",venue:Po,dressCode:"Indian formal — silks, sherwanis and timeless elegance",icon:"🔥",bg:oE,dark:!0},{title:"Reception",description:"An elegant evening to celebrate our union with loved ones",day:"Sat",date:"June 27, 2026",time:"07:00 PM onwards",venue:Po,dressCode:"Black tie / Indo-western elegance",icon:"🥂",bg:iE,dark:!0}]';

    s = replaceOnce(
      s,
      oldEvents,
      `Po="${esc(config.venue)}",fE=[${buildEventsBlock(config.events)}]`,
      "events block"
    );

    s = replaceOnce(
      s,
      'children:"Khushi"',
      `children:"${esc(c.brideName)}"`,
      "bride name"
    );
    s = replaceOnce(
      s,
      'children:"Pranay"',
      `children:"${esc(c.groomName)}"`,
      "groom name"
    );
    s = replaceOnce(
      s,
      'children:"Smt. Jaimala & Harishchand Makana"',
      `children:"${esc(config.hosts)}"`,
      "hosts"
    );

    s = replaceOnce(
      s,
      'children:["(G/D of Late Shri. Parasmalji & Amraobai Makana ",w.jsx("br",{}),"Shri Late Sajjanrajji & Smt.Taradevi Bohra)"]',
      jsxLineage(config.brideLineage),
      "bride lineage"
    );

    s = replaceOnce(
      s,
      'children:["(G/S of Shri. Shashidharji & Late Shyamala Devi Raghavani) ",w.jsx("br",{}),"(G/S of Shri. Suresh Kumarji & Vasanthabai Gotawat) ",w.jsx("br",{}),"(S/O Shri. Maheshji & Sumanji Raghavani)"]',
      jsxLineage(config.groomLineage),
      "groom lineage"
    );

    s = replaceOnce(
      s,
      'alt:"Khushi and Pranay wedding illustration"',
      `alt:"${esc(c.brideName)} and ${esc(c.groomName)} wedding illustration"`,
      "hero alt"
    );
    s = replaceOnce(
      s,
      'alt:"K & P monogram"',
      `alt:"${esc(c.monogramAlt)}"`,
      "monogram alt"
    );

    const mapIframe =
      'w.jsx("iframe",{title:"Venue map",src:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4607.220678671859!2d77.6909378!3d13.2238362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1d4b9e3c087d%3A0xafe3786dc3fbed1c!2sVeerdency%20Resort!5e1!3m2!1sen!2sin!4v1779545649651!5m2!1sen!2sin",className:"w-full h-[360px]",loading:"lazy"})';

    const mapBlock = buildMapBlock(config);

    if (s.includes(mapIframe)) {
      s = s.replace(mapIframe, mapBlock);
    } else {
      s = s.replace(
        /w\.jsx\("img",\{title:"Venue map",src:"[^"]*",alt:"[^"]*",className:"w-full h-\[360px\] object-cover"\}\)/,
        mapBlock
      );
    }

    s = replaceOnce(
      s,
      'href:"https://maps.app.goo.gl/w1sNtfKpgABMT6bAA?g_st=iw"',
      `href:"${esc(config.maps?.directionsUrl || buildDirectionsUrl(config.venue))}"`,
      "directions link"
    );

    if (s.includes(FAMILIES_SECTION)) {
      s = s.replace(FAMILIES_SECTION, "");
    }

    if (s.includes('children:"Veerdency Luxury Resort"')) {
      s = replaceOnce(
        s,
        'children:"Veerdency Luxury Resort"',
        `children:"${esc(config.venue)}"`,
        "venue display name"
      );
    }

    const newFooter = buildFooter(config);
    if (s.includes(DEFAULT_FOOTER)) {
      s = s.replace(DEFAULT_FOOTER, newFooter);
    } else {
      const footerMatch = s.match(
        /w\.jsxs\("footer",\{className:"bg-foreground text-cream py-16 px-6 text-center text-primary-foreground",children:\[w\.jsx\("p",\{className:"font-cinzel text-xs tracking-\[0\.4em\] text-gold-soft",children:"WITH LOVE"\}\),w\.jsx\("h3",\{className:"font-script text-5xl sm:text-6xl text-cream mt-3 text-primary-foreground",children:"[^"]*"\}\),w\.jsxs\("div",\{className:"my-5 flex items-center justify-center gap-3",children:\[w\.jsx\("span",\{className:"h-px w-12 bg-gold-soft\/40"\}\),w\.jsx\("span",\{className:"text-2xl",children:"💐"\}\),w\.jsx\("span",\{className:"h-px w-12 bg-gold-soft\/40"\}\)\]\}\),w\.jsx\("p",\{className:"font-serif-display text-lg italic",children:"[^"]*"\}\),w\.jsx\("p",\{className:"mt-3 font-cinzel text-xs tracking-widest text-cream\/70",children:"[^"]*"\}\)(?:,w\.jsx\("p",\{className:"mt-8 font-serif-display text-sm text-cream\/60",children:"[^"]*"\}\))?\]\}\)/
      );
      if (footerMatch) {
        s = s.replace(footerMatch[0], newFooter);
      }
    }

    s = fixAssetPaths(s);

    return s;
  }

  function saveConfig(config) {
    config._version = CONFIG_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  function isConfigCurrent(config) {
    return config && config._version === CONFIG_VERSION;
  }

  function loadConfig() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        /* fall through */
      }
    }
    return null;
  }

  function savePatchedApp(source) {
    localStorage.setItem(PATCHED_APP_KEY, source);
  }

  function loadPatchedApp() {
    return localStorage.getItem(PATCHED_APP_KEY);
  }

  function clearSaved() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PATCHED_APP_KEY);
  }

  root.WeddingPatch = {
    STORAGE_KEY,
    PATCHED_APP_KEY,
    CONFIG_VERSION,
    isConfigCurrent,
    applyPatch,
    saveConfig,
    loadConfig,
    savePatchedApp,
    loadPatchedApp,
    clearSaved,
  };
})(typeof window !== "undefined" ? window : globalThis);

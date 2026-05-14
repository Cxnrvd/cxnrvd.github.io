/* ─────────────────────────────────────────────
   EDIT CONTENT HERE
   This is the only file you ever need to touch to publish a new post,
   update a stat, or add an affiliation. All pages read from this.
   ───────────────────────────────────────────── */

const DATA = {
  posts: [
    {
      id: "operation-black-wing",
      title: "Operation Black Wing",
      subtitle: "A Qilin Ransomware Affiliate Engagement Against an East African Logistics Provider",
      date: "2026-04-28",
      tags: ["Ransomware", "Qilin", "DFIR", "East Africa"],
      excerpt: "An incident retrospective from a Qilin ransomware affiliate engagement against an East African logistics provider — initial access path, lateral movement, the deployment chain, and the operational response that constrained impact.",
      url: "https://cxnrvd.hashnode.dev/operation-black-wing-a-qilin-ransomware-affiliate-engagement-against-an-east-african-logistics-provider",
      type: "blog",
      platform: null,
      featured: true
    },
    {
      id: "mallox-mssql-cryptomining",
      title: "Dissecting Mallox Ransomware",
      subtitle: "Deployment via MS-SQL Exploitation and Cryptomining",
      date: "2025-02-11",
      tags: ["Ransomware", "Mallox", "MS-SQL", "Malware Analysis"],
      excerpt: "Technical breakdown of a Mallox ransomware deployment that pivoted from MS-SQL exploitation into cryptomining persistence before encryption — TTP mapping, IOCs, and detection seams that catch the chain early.",
      url: "https://cxnrvd.hashnode.dev/technical-blog-dissecting-mallox-ransomware-deployment-via-ms-sql-exploitation-and-cryptomining",
      type: "blog",
      platform: null,
      featured: true
    },
    {
      id: "alfa-shell-v4-1",
      title: "Decoding ALFA TEAM's Web Exploits",
      subtitle: "Investigating the ALFA Shell v4.1 Updated ZIP",
      date: "2023-10-28",
      tags: ["Web Shell", "ALFA TEAM", "Malware Analysis", "Forensics"],
      excerpt: "Reverse-engineering the ALFA Shell v4.1 ZIP — a file-by-file walkthrough of ALFA TEAM's web exploitation kit, the functions it ships with, and the artefacts to hunt for on compromised hosts.",
      url: "https://medium.com/@cxnrvd327/decoding-alfa-teams-web-exploits-investigating-the-alfa-shell-v4-1-updated-zip-b6f011c8fb57",
      type: "blog",
      platform: null,
      featured: true
    }
  ],

  stats: [
    { label: "CVEs Tracked",         value: "140+" },
    { label: "Labs Completed",       value: "80+"  },
    { label: "Advisories Published", value: "30+"  },
    { label: "MDAs Trained",         value: "12+"  }
  ],

  affiliations: [
    "NITA-U", "CERT.UG/CC", "UEL", "Hashnode", "GitHub"
  ],

  capabilities: [
    {
      icon: "01",
      title: "DFIR & Incident Response",
      blurb: "Live-response triage, memory and disk forensics, and post-incident reconstruction for government and enterprise environments — coordinated through CERT.UG/CC.",
      tags: ["Volatility", "Velociraptor", "TheHive"]
    },
    {
      icon: "02",
      title: "Offensive Security",
      blurb: "Vulnerability assessment & penetration testing across government portals and MDAs. Active Directory attack-path mapping, web app testing, and red-team simulations.",
      tags: ["BloodHound", "Burp Suite", "Cobalt Strike"]
    },
    {
      icon: "03",
      title: "Threat Intelligence",
      blurb: "Tracking adversary infrastructure, malware families, and TTPs relevant to the East African threat landscape. Publishing actionable advisories for national constituents.",
      tags: ["MISP", "MITRE ATT&CK", "JARM"]
    }
  ],

  links: {
    hashnode: "https://cxnrvd.hashnode.dev",
    medium:   "https://medium.com/@cxnrvd327",
    github:   "https://github.com/Cxnrvd",
    linkedin: "https://www.linkedin.com/in/mabira-conrad-william-aa75781b3/",
    /* Update with your actual Twitter / X handle URL if different. */
    twitter:  "https://x.com/cxsnrd",
    cert:     "https://www.cert.ug"
  },

  /* ─── "NOW" PANEL — what you're doing this week ───
     Powers the hero side panel on the home page. Update freely. */
  currently: {
    writing:     "Forensic timeline of Operation Black Wing",
    researching: "ADCS template misconfigs · ESC1 → ESC8",
    building:    "adcs-attack-range — automated AD CS lab"
  },

  /* ─── TALKS / TRAINING / WORKSHOPS ───
     type: "talk" | "workshop" | "training" | "podcast"
     status: "delivered" | "upcoming" | "tbd"
     Resource links are optional — leave null if none. */
  talks: [
    {
      id: "ransomware-raas-deep-dive",
      title: "Ransomware & Ransomware-as-a-Service (RaaS)",
      event: "Deep-dive Session",
      location: "Kampala, Uganda",
      date: "2025-10",
      type: "talk",
      audience: "Security practitioners",
      abstract: "A deep-dive session unpacking how cybercrime has been industrialised — the brutal business model that fuels the global ransomware epidemic, the affiliate economy, and the operational sequencing of a modern RaaS engagement.",
      slides: null,
      video: null,
      linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7384952893415612416/",
      status: "delivered"
    },
    {
      id: "threat-actor-comms-isc2",
      title: "Threat Actor Communications — Hiding in Plain Sight",
      event: "ISC2 Uganda Chapter",
      location: "Kampala, Uganda",
      date: "2025-04",
      type: "talk",
      audience: "ISC2 members",
      abstract: "How adversaries use platforms like Telegram, WhatsApp, Cloudflare, and X for covert C2 — followed by a deep dive into Fast Flux networks and ORBs (Operational Relay Boxes) as the infrastructure layer of modern adversary tradecraft.",
      slides: null,
      video: null,
      linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7318215337785618432/",
      status: "delivered"
    }
  ],

  /* Speaking topics Conrad is bookable on. Edit freely. */
  speakingTopics: [
    {
      title: "Ransomware & RaaS Economics",
      blurb: "How the affiliate model industrialised cybercrime — engagement sequencing, RaaS operator/affiliate splits, and what the kill chain actually looks like in regional incidents."
    },
    {
      title: "Adversary Communications & C2",
      blurb: "Hiding in plain sight on Telegram, WhatsApp, Cloudflare, and X. Fast Flux networks, ORBs, and the detection seams that surface covert C2."
    },
    {
      title: "Active Directory Attack Paths",
      blurb: "ADCS misconfigurations (ESC1–ESC8), Kerberoasting, ACL abuse, and BloodHound-driven prioritisation — for red, blue, and mixed audiences."
    },
    {
      title: "Phishing & Adversary-in-the-Middle (AiTM)",
      blurb: "Past the \"MFA isn't enough\" headline. Evilginx-style AiTM kits, real session-token theft, the TLS proxy mechanics that make it work, and the detection seams that catch it. Built for audiences past the awareness-poster stage."
    },
    {
      title: "DFIR & Ransomware Recovery in Resource-Constrained Environments",
      blurb: "How to actually run incident response when there's no mature SOC, no unlimited budget, and no large team. Triage prioritisation, salvage-first mindsets, low-cost tooling, and what a usable playbook looks like for African government and enterprise environments."
    },
    {
      title: "Threat Intelligence for the East African Threat Landscape",
      blurb: "The threat landscape regional defenders actually face — adversary TTPs, infrastructure patterns, and campaign telemetry that maps to East African targets. Grounded in the advisories I publish through CERT.UG/CC, not generic Western threat-intel feeds."
    },
    {
      title: "Malware Analysis — From Sample to Indicator",
      blurb: "End-to-end methodology from a raw sample to a deployable IOC: static triage, dynamic sandbox, IDA/Ghidra deep-dive, IOC extraction, and detection-rule development — drawn from public dissections of Mallox, Qilin, and the ALFA Shell kit."
    }
  ],

  /* ─── TOOLS / OPEN-SOURCE ───
     status: "active" | "wip" | "archived"
     category: "offensive" | "dfir" | "threat-intel" | "automation" */
  tools: [
    {
      id: "adcs-attack-range",
      name: "ADCS-Attack-Range",
      lang: "PowerShell",
      description: "A purpose-built Active Directory Certificate Services attack range for safely practicing ESC1–ESC8 exploitation paths. Automated lab build with vulnerable certificate templates, ready for red and blue team exercises.",
      stack: ["ADCS", "Active Directory", "Lab"],
      url: "https://github.com/Cxnrvd/ADCS-Attack-Range",
      status: "active",
      category: "offensive"
    }
  ],

  /* ─── CERTIFICATIONS & TRAINING ───
     Ordered newest → oldest. Set issuer to null if attendance-only / no formal issuer. */
  certifications: [
    { name: "Advanced Training in Strategic Digital Trust & Cryptographic Infrastructure", issuer: "Ascertia" },
    { name: "Arbor Sightline / TMS — DDoS Detection & Mitigation (User · Admin · Sys Admin)", issuer: "NETSCOUT" },
    { name: "Oxygen Forensics Certificate",                                          issuer: "Oxygen Forensics" },
    { name: "Certified Process Injection Analyst",                                   issuer: "CyberWarFare Labs" },
    { name: "Certified Red Team Infra Developer (CRT-ID)",                           issuer: "CyberWarFare Labs" },
    { name: "Facilitator — Cyber Crime in the Financial Sector",                     issuer: "Uganda Institute of Banking & Financial Services" },
    { name: "Data Governance Forum",                                                 issuer: null },
    { name: "Certified Red Team Analyst (CRTA)",                                     issuer: "CyberWarFare Labs" },
    { name: "Multi-Cloud Red Team Analyst",                                          issuer: "CyberWarFare Labs" },
    { name: "CompTIA Security+ CE",                                                  issuer: "CompTIA" },
    { name: "IGNITE Program — Cybersecurity Course",                                 issuer: "Scratch and Script Limited" },
    { name: "Enterprise DFIR Investigation Scenario (w/ Markus Schober)",            issuer: "Antisyphon Training" },
    { name: "Delving Into Africa's Threat Landscape — Cybersecurity Training",       issuer: "Traverse Security" },
    { name: "Cyber Threat Hunting — Level 1",                                        issuer: "Active Countermeasures" },
    { name: "API Security Fundamentals",                                             issuer: "APIsec University" },
    { name: "Introduction to Critical Infrastructure Protection (ICIP)",             issuer: "OPSWAT" },
    { name: "Cybersecurity Essentials",                                              issuer: "Cisco" },
    { name: "CCNA: Introduction to Networks",                                        issuer: "Cisco" }
  ]
};

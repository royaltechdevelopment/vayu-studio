/* ============================================================
   Default site content. The Supabase `site_content` table overrides
   these values. These are the same sections edited in the admin panel.
   ============================================================ */
window.SITE_DATA = {
  home: {
    kicker: '01 / COMMAND CENTER',
    badge: 'ALL SYSTEMS ONLINE',
    title: 'Everything Vayu.',
    highlight: 'One place.',
    subtitle: 'Tools, tutorials, commands and community — all in one dashboard. Log in to unlock your workspace.',
    command: 'bash <(curl -s https://installer.vayuplayzofficial.indev.in)',
    status: { latency: '19ms', uptime: '99.9%', users: '1.91k' }
  },

  about: {
    kicker: '09 / ABOUT',
    title: 'Built by the community, for the community.',
    subtitle: 'Vayu Playz Official is a gaming, technology and creative content brand — powered by its people.',
    stats: [
      { value: '4+', label: 'Platforms' },
      { value: '1000+', label: 'Community Members' },
      { value: '24/7', label: 'Active Support' },
      { value: '∞', label: 'Possibilities' }
    ],
    mission: "Vayu Playz Official is more than a brand — it is a community of gamers, developers and creators. We work to build high-quality gaming experiences, useful tools and a welcoming space for everyone.",
    values: [
      'Innovation in gaming and technology',
      'Community-first approach',
      'Quality over quantity',
      'Open and transparent communication'
    ],
    story: 'Started as a passion project, Vayu Playz Official has grown into YouTube content, Minecraft multiplayer networks and a thriving Discord community.',
    timeline: [
      { year: '2024', text: 'Vayu Playz Official launched' },
      { year: '2024', text: 'Vayu MC Network established' },
      { year: '2024', text: 'Vayu Empire Discord community formed' }
    ],
    features: [
      { icon: 'fa-brands fa-youtube', title: 'Content Creation', text: 'Gaming videos, tutorials and creative digital experiments.' },
      { icon: 'fa-solid fa-server', title: 'Minecraft Network', text: 'Multi-mode Minecraft server with Lifesteal SMP and more.' },
      { icon: 'fa-brands fa-discord', title: 'Discord Community', text: 'Vayu Empire — a hub for gamers, developers and creators.' }
    ]
  },

  team: {
    kicker: '02 / TEAM',
    title: 'The people behind the signal.',
    subtitle: 'The core team turning ideas into real products and experiences.',
    members: [
      { name: 'Vayu Playz Official', role: 'Lead Developer', tag: 'OWNER', image: 'images/royal.jpg', accent: 'lime' },
      { name: 'Mr.Nobody', role: 'Owner', tag: 'OWNER', image: 'images/mrnobody.png', accent: 'violet' },
      { name: 'Satyam', role: 'Minecraft Developer', tag: 'OWNER', image: 'images/satyam.png', accent: 'lime' },
      { name: 'Lavish Asura', role: 'SRV DB Manager', tag: 'CORE', image: '', accent: 'violet' },
      { name: 'Blaze', role: 'Sr.Staff', tag: 'SR.STAFF', image: 'images/blaze.png', accent: 'lime' },
      { name: 'SpideyNewar', role: 'Staff', tag: 'STAFF', image: 'images/spidynewar.png', accent: 'violet' },
      { name: 'Drip', role: 'Community Staff', tag: 'STAFF', image: 'images/drip.png', accent: 'lime' }
    ]
  },

  tutorials: {
    kicker: '03 / TUTORIALS',
    title: 'Learn by watching. Build by doing.',
    subtitle: 'Latest videos, deep dives and quick walkthroughs — straight from the Vayu channel.',
    videos: [
      { title: 'Linux Commands Every Developer Should Know', level: 'BEGINNER', duration: '12:40', desc: 'Essential server management commands, with examples.' },
      { title: 'VPS Setup From Zero to Production', level: 'INTERMEDIATE', duration: '18:05', desc: 'Firewall, users, SSH hardening and your first deployment.' },
      { title: 'Docker in 15 Minutes', level: 'BEGINNER', duration: '15:22', desc: 'Images, containers, ports and Docker Compose basics.' },
      { title: 'Git Guide: Branch to Pull Request', level: 'BEGINNER', duration: '09:48', desc: 'Clean commits, branches and collaboration workflow.' },
      { title: 'Building a Discord Bot', level: 'ADVANCED', duration: '24:10', desc: 'Build your first Node.js bot with slash commands.' },
      { title: 'Minecraft Server Tuning', level: 'INTERMEDIATE', duration: '16:33', desc: 'Paper 1.21.x performance and plugin setup.' }
    ]
  },

  guide: {
    kicker: '10 / COMMAND GUIDE',
    title: 'Step-by-step command guide.',
    subtitle: 'Copy, paste, run. Every section is short and practical.',
    sections: [
      {
        title: 'Linux Commands', desc: 'Essential Linux commands for server management.',
        items: [
          { cmd: 'sudo apt update && sudo apt upgrade -y', desc: 'Update and upgrade all packages' },
          { cmd: 'df -h', desc: 'Check disk space usage' },
          { cmd: 'free -h', desc: 'Check memory usage' },
          { cmd: 'ls -la', desc: 'List all files with details' },
          { cmd: 'ps aux', desc: 'List all running processes' }
        ]
      },
      {
        title: 'VPS Setup', desc: 'VPS server setup and configuration commands.',
        items: [
          { cmd: 'sudo ufw enable', desc: 'Enable firewall' },
          { cmd: 'sudo ufw allow 80', desc: 'Allow HTTP port 80' },
          { cmd: 'sudo ufw allow 443', desc: 'Allow HTTPS port 443' }
        ]
      },
      {
        title: 'Docker Commands', desc: 'Docker container management commands.',
        items: [
          { cmd: 'docker ps -a', desc: 'List all containers' },
          { cmd: 'docker images', desc: 'List all images' },
          { cmd: 'docker run -d -p 80:80 nginx', desc: 'Run nginx container' }
        ]
      },
      {
        title: 'Git Guide', desc: 'Git version control commands.',
        items: [
          { cmd: 'git init', desc: 'Initialize new repository' },
          { cmd: 'git clone <repository-url>', desc: 'Clone repository from URL' },
          { cmd: 'git add .', desc: 'Add all files to staging' },
          { cmd: 'git commit -m "message"', desc: 'Commit staged changes' }
        ]
      }
    ]
  },

  commands: [
    { cat: 'linux', title: 'Update System', code: 'sudo apt update && sudo apt upgrade -y', desc: 'Update and upgrade all packages' },
    { cat: 'linux', title: 'Check Disk Usage', code: 'df -h', desc: 'Show disk space usage' },
    { cat: 'linux', title: 'Check Memory Usage', code: 'free -h', desc: 'Show memory usage' },
    { cat: 'linux', title: 'List Files', code: 'ls -la', desc: 'List all files with details' },
    { cat: 'linux', title: 'Find Files', code: 'find /path -name "filename"', desc: 'Find files by name' },
    { cat: 'linux', title: 'Search in Files', code: 'grep -r "pattern" /path', desc: 'Recursively search for pattern' },
    { cat: 'linux', title: 'Process List', code: 'ps aux', desc: 'List all running processes' },
    { cat: 'linux', title: 'Kill Process', code: 'kill -9 PID', desc: 'Force kill process by ID' },
    { cat: 'linux', title: 'Top Processes', code: 'top', desc: 'Show top CPU consuming processes' },
    { cat: 'linux', title: 'System Info', code: 'uname -a', desc: 'Show system information' },
    { cat: 'vps', title: 'Check System Load', code: 'uptime', desc: 'Show system uptime and load' },
    { cat: 'vps', title: 'Check CPU Info', code: 'lscpu', desc: 'Display CPU information' },
    { cat: 'vps', title: 'Check RAM Info', code: 'lsmem', desc: 'Display memory information' },
    { cat: 'vps', title: 'Check Disk Info', code: 'lsblk', desc: 'List block devices' },
    { cat: 'docker', title: 'List Containers', code: 'docker ps -a', desc: 'List all containers' },
    { cat: 'docker', title: 'List Images', code: 'docker images', desc: 'List all images' },
    { cat: 'docker', title: 'Run Container', code: 'docker run -d -p 80:80 image_name', desc: 'Run container in detached mode' },
    { cat: 'docker', title: 'Stop Container', code: 'docker stop container_id', desc: 'Stop running container' },
    { cat: 'docker', title: 'Start Container', code: 'docker start container_id', desc: 'Start stopped container' },
    { cat: 'git', title: 'Initialize Repo', code: 'git init', desc: 'Initialize new Git repository' },
    { cat: 'git', title: 'Clone Repo', code: 'git clone url', desc: 'Clone repository from URL' },
    { cat: 'git', title: 'Check Status', code: 'git status', desc: 'Show repository status' },
    { cat: 'git', title: 'Add Files', code: 'git add .', desc: 'Add all files to staging' },
    { cat: 'git', title: 'Commit Changes', code: 'git commit -m "message"', desc: 'Commit staged changes' },
    { cat: 'git', title: 'Push Changes', code: 'git push origin branch', desc: 'Push changes to remote' },
    { cat: 'networking', title: 'Ping Host', code: 'ping hostname', desc: 'Test network connectivity' },
    { cat: 'networking', title: 'Trace Route', code: 'traceroute hostname', desc: 'Trace network path' },
    { cat: 'networking', title: 'DNS Lookup', code: 'nslookup hostname', desc: 'Lookup DNS information' },
    { cat: 'networking', title: 'Download File', code: 'wget url', desc: 'Download file from URL' },
    { cat: 'system', title: 'Check Date', code: 'date', desc: 'Show current date and time' },
    { cat: 'system', title: 'Shutdown', code: 'sudo shutdown -h now', desc: 'Shutdown system immediately' },
    { cat: 'system', title: 'Reboot', code: 'sudo reboot', desc: 'Reboot system' },
    { cat: 'system', title: 'Check Services', code: 'systemctl list-units --type=service', desc: 'List all services' },
    { cat: 'useful', title: 'Update All', code: 'apt update && apt upgrade -y', desc: 'Update system' },
    { cat: 'useful', title: 'Install Basic', code: 'apt install curl wget git -y', desc: 'Install essentials' },
    { cat: 'auto', title: 'Edit Cron', code: 'crontab -e', desc: 'Edit cron jobs for automation' },
    { cat: 'review', title: 'Git Diff', code: 'git diff HEAD~1 HEAD', desc: 'Review changes between commits' },
    { cat: 'suggestion', title: 'Tuned Recommend', code: 'tuned-adm recommend', desc: 'Suggest system tuning profile' }
  ],

  links: {
    kicker: '06 / QUICK LINKS',
    title: 'Everything in one place.',
    subtitle: 'Official channels and important destinations across the ecosystem.',
    items: [
      { name: 'Vayu Empire Discord', desc: 'Join the community', cta: 'Join', icon: 'fa-brands fa-discord', href: 'https://discord.gg/eCmwsWw3Bg', accent: 'violet' },
      { name: 'Vayu MC Web', desc: 'Visit website', cta: 'Visit', icon: 'fa-solid fa-cube', href: 'https://vayumc.fun', accent: 'lime' },
      { name: 'YouTube', desc: '@vayuplayzofficial', cta: 'Watch', icon: 'fa-brands fa-youtube', href: 'https://youtube.com/@vayuplayzofficial', accent: 'red' },
      { name: 'Instagram', desc: '@vayuplayzofficial', cta: 'Follow', icon: 'fa-brands fa-instagram', href: 'https://www.instagram.com/vayuplayzofficial', accent: 'pink' }
    ]
  },

  files: {
    kicker: '07 / FILES',
    title: 'Downloads & resources.',
    subtitle: 'Tools and files the community actively uses.',
    items: [
      {
        name: 'PteroDash', version: 'v1.0', status: 'AVAILABLE', icon: 'fa-server',
        category: 'Pterodactyl Theme', available: true,
        banner: 'images/royal.jpg', preview: ['images/royal.jpg'],
        desc: 'Custom Pterodactyl dashboard UI.',
        description: 'PteroDash is a custom Pterodactyl panel dashboard UI. It replaces the default theme with a clean, modern interface built for game server hosting.',
        details: [
          { label: 'File', value: 'pterodash.zip' },
          { label: 'Size', value: '54 KB' },
          { label: 'Type', value: 'ZIP Archive' },
          { label: 'Author', value: 'Vayu Playz Official' },
          { label: 'Compatible', value: 'Pterodactyl Panel' },
          { label: 'Version', value: 'v1.0' }
        ],
        features: [
          'Modern glassmorphism dashboard design',
          'Clean, fully responsive control panel layout',
          'Built on top of the standard Pterodactyl panel',
          'Simple drop-in installation'
        ],
        steps: [
          'Download the ZIP file using the Install button below.',
          'Extract the ZIP archive on your computer or server.',
          'Upload / replace the contents in your Pterodactyl panel directory.',
          'Clear your browser cache and reload the panel.'
        ],
        file: 'codes/pterodash.zip',
        installCode: 'bash <(curl -s https://installer.vayuplayzofficial.indev.in)'
      },
      {
        name: 'NodeJS Panel', version: 'v1.0', status: 'COMING SOON', icon: 'fa-code',
        category: 'NodeJS & Discord', available: false,
        banner: 'images/drip.png', preview: ['images/drip.png'],
        desc: 'Custom NodeJS management panel.',
        description: 'NodeJS Panel is a custom management panel for NodeJS applications, bots and hosting. Control and monitor all your projects from a single clean dashboard.',
        details: [
          { label: 'File', value: 'panel.zip' },
          { label: 'Size', value: '—' },
          { label: 'Type', value: 'ZIP Archive' },
          { label: 'Author', value: 'Vayu Playz Official' },
          { label: 'Compatible', value: 'NodeJS' },
          { label: 'Version', value: 'v1.0' }
        ],
        features: [
          'One dashboard for all your NodeJS apps',
          'Start / stop and monitor running processes',
          'Clean, modern responsive interface',
          'Easy setup on any VPS or hosting'
        ],
        steps: [
          'Download the ZIP file using the Install button below.',
          'Extract the ZIP archive on your server.',
          'Run npm install and configure your environment.',
          'Start the panel and log in.'
        ],
        file: '',
        installCode: 'echo "Coming soon"'
      }
    ]
  },

  faq: {
    kicker: '08 / FAQ',
    title: 'Frequently asked questions.',
    subtitle: 'About the Vayu ecosystem, Vayu Playz Official, Vayu MC Network and Vayu Empire.',
    groups: [
      {
        title: 'Vayu Playz Official — YouTube Channel',
        items: [
          { q: 'What is Vayu Playz Official?', a: 'Vayu Playz Official is a content creation brand focused on gaming, technology, Minecraft, coding, AI tools and creative digital experiments.' },
          { q: 'What type of videos are published?', a: 'Gaming content, Minecraft videos, technology tutorials, coding projects, AI experiments, useful tools and other digital content.' },
          { q: 'Is the channel focused only on Minecraft?', a: 'No. Minecraft is an important part of the channel, but technology, programming, AI and gaming-related topics are also explored.' },
          { q: 'How can I suggest a video idea?', a: 'Share your suggestion in the Vayu Empire Discord community or through the official social media contact channels.' },
          { q: 'Can I collaborate?', a: 'Yes. Contact the creator through the official channels to discuss a collaboration.' },
          { q: 'Is it connected to Vayu MC?', a: 'Yes. Vayu MC is part of the wider Vayu Playz Official ecosystem.' }
        ]
      },
      {
        title: 'Vayu MC Network — Minecraft',
        items: [
          { q: 'What is Vayu MC?', a: 'Vayu MC is a Minecraft multiplayer network with multiple game modes and gameplay experiences in one place.' },
          { q: 'Is Vayu MC just a Lifesteal SMP server?', a: 'No. It is a multi-mode network. Lifesteal SMP is one experience, and other modes are also available.' },
          { q: 'What is the official server address?', a: 'A9-5.aryncloud.in' },
          { q: 'Which editions are supported?', a: 'Both Java Edition and Bedrock Edition are supported.' },
          { q: 'What is the official domain?', a: 'vayumc.fun' },
          { q: 'Which Minecraft version?', a: 'The network uses Paper 1.21.11 server software.' },
          { q: 'How do I join?', a: 'Open Minecraft → Multiplayer → Add Server → enter the address → connect.' }
        ]
      },
      {
        title: 'Vayu Empire — Discord Community',
        items: [
          { q: 'What is Vayu Empire?', a: 'The official community of Vayu Playz Official and Vayu MC — for gamers, creators, developers and members.' },
          { q: 'Is it free to join?', a: 'Yes, joining the Discord community is free.' },
          { q: 'What can I do there?', a: 'Take part in discussions, announcements, support, projects and community activities.' },
          { q: 'What departments exist?', a: 'Administration, Moderation, Support, Partnerships and Development departments.' },
          { q: 'How can I become a staff member?', a: 'Watch the official recruitment announcements and follow the application instructions when positions open.' },
          { q: 'What is the ticket system?', a: 'The ticket system lets you contact the support team privately.' },
          { q: 'How do I report someone?', a: 'Report inappropriate behaviour through the official reporting or ticket system.' },
          { q: 'How do giveaways work?', a: 'Follow giveaway announcements and the steps in the message.' }
        ]
      }
    ]
  },

  // Editable in Admin → Site content. Supabase overrides these defaults.
  site_settings: {
    ADMIN_DISCORD_ID: '',
    DEFAULT_ADMIN_EMAIL: 'admin@vayuplayz.com',
    YOUTUBE_CHANNEL_ID: 'UCidFGGXE-tVCsYwnRBJ3_RQ',
    DISCORD_WIDGET_ID: '1504530914128953464',
    DISCORD_CHAT_CHANNEL_ID: '1504798937989513307',
    SOCIAL: {
      youtube: 'https://youtube.com/@vayuplayzofficial',
      instagram: 'https://www.instagram.com/vayuplayzofficial',
      discord: 'https://discord.gg/eCmwsWw3Bg',
      mc: 'https://vayumc.fun'
    }
  }
};

window.SECTION_KEYS = Object.keys(window.SITE_DATA);

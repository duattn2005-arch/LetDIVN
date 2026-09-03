const fs = require('fs');

const videoTranslations = {
  vi: {
    videosPageBadge: 'HÀNH ĐỘNG VÌ MÔI TRƯỜNG',
    videosPageTitle: 'Thước Phim & Phóng Sự Hành Động',
    videosPageSubtitle: 'Theo dõi các phóng sự truyền hình, thước phim tài liệu và câu chuyện truyền cảm hứng từ các chiến dịch dọn rác Let\'s do it! Vietnam.',
    videosPageAddBtn: 'Thêm Video Mới',
    videosPageEmptyTitle: 'Chưa có video nào',
    videosPageEmptyDesc: 'Dán link YouTube để chia sẻ video phóng sự',
    videosPageCountSuffix: 'Video phóng sự'
  },
  en: {
    videosPageBadge: 'TAKE ACTION',
    videosPageTitle: 'Capturing Change, One Frame at a Time',
    videosPageSubtitle: 'Watch TV reports, documentaries, and inspiring stories from Let\'s do it! Vietnam cleanup campaigns.',
    videosPageAddBtn: 'Add New Video',
    videosPageEmptyTitle: 'No videos yet',
    videosPageEmptyDesc: 'Paste a YouTube link to share a media video',
    videosPageCountSuffix: 'Videos'
  },
  fr: {
    videosPageBadge: 'PASSER À L’ACTION',
    videosPageTitle: 'Capturer le changement, image par image',
    videosPageSubtitle: 'Regardez les reportages télévisés et les documentaires de nos campagnes de nettoyage.',
    videosPageAddBtn: 'Ajouter une vidéo',
    videosPageEmptyTitle: 'Aucune vidéo pour le moment',
    videosPageEmptyDesc: 'Collez un lien YouTube pour partager une vidéo',
    videosPageCountSuffix: 'Vidéos'
  },
  ja: {
    videosPageBadge: '行動を起こそう',
    videosPageTitle: '変化の瞬間を記録する',
    videosPageSubtitle: 'ワールドクリーンアップデーの活動を記録したテレビ特集やドキュメンタリー映像。',
    videosPageAddBtn: '新しい動画を追加',
    videosPageEmptyTitle: '動画がまだありません',
    videosPageEmptyDesc: 'YouTubeリンクを貼り付けて動画を共有してください',
    videosPageCountSuffix: '本'
  },
  ko: {
    videosPageBadge: '실천하기',
    videosPageTitle: '변화의 순간을 담다',
    videosPageSubtitle: '방송 보도 및 정화 활동 현장을 담은 다큐멘터리 영상들을 감상하세요.',
    videosPageAddBtn: '새 동영상 추가',
    videosPageEmptyTitle: '등록된 동영상이 없습니다',
    videosPageEmptyDesc: 'YouTube 링크를 붙여넣어 동영상을 공유하세요',
    videosPageCountSuffix: '개'
  },
  zh: {
    videosPageBadge: '采取行动',
    videosPageTitle: '定格蜕变，记录前行',
    videosPageSubtitle: '观看电视新闻专题报道与清洁行动现场精彩纪录片。',
    videosPageAddBtn: '添加新视频',
    videosPageEmptyTitle: '暂无视频',
    videosPageEmptyDesc: '粘贴YouTube链接即可分享视频',
    videosPageCountSuffix: '个视频'
  },
  de: {
    videosPageBadge: 'AKTIV WERDEN',
    videosPageTitle: 'Den Wandel im Bild festhalten',
    videosPageSubtitle: 'Sehen Sie Fernsehberichte und Dokumentationen von den Aktionen von Let\'s do it! Vietnam.',
    videosPageAddBtn: 'Neues Video hinzufügen',
    videosPageEmptyTitle: 'Noch keine Videos vorhanden',
    videosPageEmptyDesc: 'YouTube-Link einfügen, um ein Video zu teilen',
    videosPageCountSuffix: 'Videos'
  },
  es: {
    videosPageBadge: 'ACTÚA AHORA',
    videosPageTitle: 'Capturando el cambio en cada imagen',
    videosPageSubtitle: 'Mira los reportajes de televisión y documentales de las campañas de limpieza.',
    videosPageAddBtn: 'Añadir nuevo video',
    videosPageEmptyTitle: 'No hay videos aún',
    videosPageEmptyDesc: 'Pega un enlace de YouTube para compartir un video',
    videosPageCountSuffix: 'Videos'
  }
};

let content = fs.readFileSync('src/context/LanguageContext.tsx', 'utf8');

const match = content.match(/export const translations = (\{[\s\S]*?\n\};)/);
if (match) {
  let jsonStr = match[1].replace(/;\s*$/, '');
  const translations = JSON.parse(jsonStr);
  
  for (const lang of Object.keys(videoTranslations)) {
    if (translations[lang]) {
      Object.assign(translations[lang], videoTranslations[lang]);
    }
  }

  const updatedCode = content.replace(/export const translations = \{[\s\S]*?\n\};/, `export const translations = ${JSON.stringify(translations, null, 2)};`);
  fs.writeFileSync('src/context/LanguageContext.tsx', updatedCode, 'utf8');
  console.log('LanguageContext.tsx updated with 100% pure language video keys!');
}

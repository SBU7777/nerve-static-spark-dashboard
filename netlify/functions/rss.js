// netlify/functions/rss.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xrfigxuxvzesclxmoqrh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_47r9yi-eJrtVZwZpoma0PA_XR_ZH3GQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event, context) => {
  try {
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('*')
      .order('episode_number', { ascending: false });

    if (episodesError) throw episodesError;

    const { data: settings, error: settingsError } = await supabase
      .from('podcast_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError) console.log('No settings found');

    let itemsXml = '';

    if (episodes && episodes.length > 0) {
      episodes.forEach(episode => {
        const pubDate = new Date(episode.published_at).toUTCString();
        itemsXml += `
    <item>
      <title>Episode ${episode.episode_number}: ${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${episode.audio_url}</link>
      <enclosure url="${episode.audio_url}" type="audio/mpeg" length="0"/>
      <guid>${episode.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <itunes:duration>00:00:00</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
    </item>`;
      });
    }

    const podcastTitle = settings?.podcast_title || 'Nerve Static Spark';
    const podcastDescription = settings?.podcast_description || 'Understanding Chronic Pain & Autonomic Peripheral Neuropathy';
    const podcastAuthor = settings?.podcast_author || 'Nerve Static Spark';
    const podcastEmail = settings?.podcast_email || 'support@nervestaticspark.org';
    const podcastImage = settings?.podcast_image_url || 'https://xrfigxuxvzesclxmoqrh.supabase.co/storage/v1/object/public/podcast-episodes/nss-logo.jpg';
    const websiteUrl = settings?.website_url || 'https://nervestaticspark.org';

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"

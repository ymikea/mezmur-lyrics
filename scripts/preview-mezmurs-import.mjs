#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const inputFile = args.find((arg) => !arg.startsWith('--')) || './input.txt';
const shouldInsert = args.includes('--insert');
const previewLimit = Number(args.find((arg) => /^--limit=/.test(arg))?.split('=')[1] ?? 5);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
function normalizeText(value) {
  return value
    .replace(/\f/g, '')
    .replace(/\r/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\u200B/g, '')
    .trim();
}

function cleanTitle(rawTitle) {
  return rawTitle
    .replace(/^\s*\d+\.\s*/u, '')
    .replace(/\s*[.]{3,}\s*.*$/u, '')
    .replace(/\s+\d+\s*$/u, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeLyricLine(line, title) {
  const trimmed = line.trim().replace(/[ \t]{2,}/g, ' ');
  if (!trimmed) return null;
  if (trimmed === title) return null;
  if (trimmed === title.replace(/\s+/g, ' ')) return null;
  return trimmed;
}

function isNoiseLine(line) {
  const t = line.trim();
  if (!t) return true;
  if (/^\s*$/u.test(t)) return true;
  if (/^(መዝሙር\s+ዘኦርቶዶክስ\s+ተዋሕዶ|ብቤት\s+ትምህርቲ.*ገጽ\s*\|\s*\d+|28\s+ታሕሳስ.*\(ልደት\)|መዝሙር\s+ዘኦርቶዶክስ)$/u.test(t)) return true;
  if (/^\s*\d+\s*$/u.test(t)) return true;
  if (/^(ብቤት\s+ትምህርቲ|ገጽ\s*\|\s*\d+|ቀሲስ|መሪጌታ|ሊቀ|ዘማሪ|ዲ\/ን|ዘማሪት|ኣብ\s+ትሕቲ\s+ዝብል\s+ክፍሊ)/u.test(t)) return true;
  if (/^(ቅዱስ|እግዚአብሔር|ስብሐት|ዘማሪ|ዲ\/ን|ቀሲስ|መሪጌታ|ሊቀ|ኣብ|ከመይሲ)/u.test(t)) return false;
  return false;
}

function parseBlocks(rawText) {
  const lines = normalizeText(rawText).split('\n');
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const numberedMatch = line.match(/^\s*(\d+)\.\s*(.*)$/u);

    if (numberedMatch) {
      if (current) {
        blocks.push(current);
      }

      const title = cleanTitle(numberedMatch[0]);
      current = {
        title,
        lines: [],
      };
      continue;
    }

    if (current) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (isNoiseLine(trimmed)) continue;

      const normalized = normalizeLyricLine(trimmed, current.title);
      if (normalized) {
        current.lines.push(normalized);
      }
    }
  }

  if (current) blocks.push(current);

  return blocks.filter((block) => block.title && block.title.length > 0);
}

function detectLanguage(block) {
  const lyricLines = block.lines.filter((line) => line && line.trim().length > 0);
  const lyricCount = lyricLines.length;

  if (lyricCount > 3) return 'Tigrinya';
  if (lyricCount <= 3) return 'Geez';
  return 'Geez';
}

function buildPreviewRecords(rawText) {
  const blocks = parseBlocks(rawText);

  return blocks.map((block) => {
    const lyricText = block.lines.join('\n').trim();
    const language = detectLanguage(block);

    return {
      title: block.title,
      language,
      liturgical_season: 'General',
      lyrics: [
        {
          stanza_order: 1,
          text: lyricText || block.title,
          is_chorus: false,
        },
      ],
      status: 'pending_review',
    };
  });
}

function printPreview(records) {
  const display = records.slice(0, previewLimit);
  console.log(JSON.stringify(display, null, 2));
}

async function insertToDatabase(records) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }

  const serviceClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await serviceClient.from('mezmurs').insert(records).select();

  if (error) {
    throw new Error(error.message);
  }

  console.log('Inserted records:', data?.length ?? 0);
}

(async () => {
  const filePath = path.resolve(process.cwd(), inputFile);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const rawText = fs.readFileSync(filePath, 'utf8');
  const records = buildPreviewRecords(rawText);

  if (records.length === 0) {
    console.log('No numbered mezmur entries were detected.');
    process.exit(0);
  }

  if (shouldInsert) {
    try {
      await insertToDatabase(records);
    } catch (error) {
      console.error('Insert failed:', error.message);
      process.exit(1);
    }
    return;
  }

  console.log(`Previewing ${records.length} records from ${path.basename(filePath)}
`);
  printPreview(records);
})();
